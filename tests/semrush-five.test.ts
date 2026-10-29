import test from 'node:test';import assert from 'node:assert/strict';
import {selfEmploymentProjection} from '../src/lib/calculators/self-employment-tax';
import {minimumPaymentPlan} from '../src/lib/credit-minimum';
import {contributionTaxSavings} from '../src/lib/401k-tax-savings';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
const tool=(id:string)=>calculators.find(c=>c.id===id)!;
const values=(id:string,mode:string,patch:Record<string,string>={})=>({...defaults(tool(id).modes.find(m=>m.id===mode)!),...patch});
const result=(id:string,mode:string,patch:Record<string,string>={})=>runCalculation(id,mode,values(id,mode,patch));
const val=(r:ReturnType<typeof result>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
const close=(actual:number,expected:number,tol=1e-7)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
test('Schedule SE normal earnings, tax split and deductible half are independently reconciled',()=>{
 const r=result('self-employment-tax','annual');
 close(val(r,'Self-employment tax including SE Additional Medicare'),11303.64);close(val(r,'Regular Social Security SE tax'),9161.12);close(val(r,'Regular Medicare SE tax'),2142.52);close(val(r,'Deductible half of regular SE tax'),5651.82);
 close(val(r,'SE-only quarterly reserve illustration'),2825.91);
});
test('W-2 coordination uses individual SS cap and separately allocates Additional Medicare',()=>{
 const r=result('self-employment-tax','annual',{profit:'50000',ss_wages:'184500',medicare_wages:'184500'});
 close(val(r,'Regular Social Security SE tax'),0);close(val(r,'Regular Medicare SE tax'),1339.075);close(val(r,'Additional Medicare tax on SE income'),276.075);close(val(r,'Self-employment tax including SE Additional Medicare'),1615.15);
 const wage=result('self-employment-tax','annual',{profit:'0',medicare_wages:'300000',ss_wages:'184500'});
 close(val(wage,'Self-employment tax including SE Additional Medicare'),0);close(val(wage,'Additional Medicare tax on wages (separate)'),900);
});
test('SE small-earnings threshold, selected year, losses and joint individual caps',()=>{
 for(const profit of ['0','-5000','400'])close(val(result('self-employment-tax','annual',{profit}),'Self-employment tax including SE Additional Medicare'),0);
 close(val(result('self-employment-tax','annual',{year:'2025',profit:'300000'}),'Regular Social Security SE tax'),21836.4);
 const joint=result('self-employment-tax','annual',{filing:'Married filing jointly',profit:'80000',ss_wages:'184500',medicare_wages:'184500',spouse_profit:'80000'});
 close(val(joint,'Regular Social Security SE tax'),9161.12);close(val(joint,'Additional Medicare tax on SE income'),740.34);
 assert.throws(()=>result('self-employment-tax','annual',{spouse_profit:'100'}),/Spouse/);
});
test('Card percentage minimum, dollar floor, zero balance and no negative amortization',()=>{
 const x={balance:1000,apr:12,percent:2,floor:25,interestExtra:true,extra:0},r=minimumPaymentPlan(x);
 assert.equal(r.firstMinimum,30);assert.equal(r.rows[0][2],10);assert.equal(r.rows[0][4],980);
 const floor=minimumPaymentPlan({...x,balance:100,apr:0});assert.equal(floor.months,4);assert.equal(floor.totalPayments,100);
 const extra=minimumPaymentPlan({...x,balance:100,apr:0,extra:25});assert.equal(extra.months,2);assert.equal(extra.totalPayments,100);
 assert.equal(minimumPaymentPlan({...x,balance:0}).firstMinimum,0);
 assert.throws(()=>minimumPaymentPlan({...x,apr:100,percent:1,floor:0,interestExtra:false}),/does not cover/);
 for(const plan of [r,floor,extra]){close(plan.rows.reduce((s,row)=>s+row[1],0),plan.totalPayments);close(plan.rows.reduce((s,row)=>s+row[3],0),plan.totalPayments-plan.total);assert.equal(plan.rows.at(-1)![4],0);}
});
test('Minimum comparison makes extra-payment savings visible without changing the minimum-only result',()=>{
 const r=result('credit-card','minimum',{principal:'1000',rate:'12',minimum:'2',floor:'25',interest_extra:'Yes'});
 const more=result('credit-card','minimum',{principal:'1000',rate:'12',minimum:'2',floor:'25',interest_extra:'Yes',extra:'25'});
 assert.ok(val(more,'Months to repay')<val(r,'Months to repay'));assert.ok(val(more,'Total interest')<val(r,'Total interest'));
 assert.equal(val(r,'Initial modeled minimum payment'),30);assert.equal(val(more,'Initial payment including extra'),55);
 assert.equal(r.additionalTables![0].rows.length,3);
});
test('No-fee APR matches contract rate; fees reconcile once and increase cash-flow APR',()=>{
 const args={principal:'10000',rate:'12',years:'1',months:'0',compound:'Monthly',pay:'Monthly',financed:'0',upfront:'0'};
 const r=result('apr','loan',args),f=result('apr','loan',{...args,financed:'500',upfront:'100'});
 close(val(r,'Nominal APR'),12,1e-5);assert.ok(val(f,'Nominal APR')>12);assert.equal(val(f,'Net proceeds'),9900);
 close(val(f,'Total borrowing cost over full term'),val(f,'Periodic loan payment')*12+100-10000);
 assert.throws(()=>result('apr','loan',{...args,years:'0'}),/positive term|Loan term/);
});
test('CD comparison uses constant APY without double compounding',()=>{
 const r=result('cd','accumulation',{principal:'10000',rate_type:'APY',rate:'4',years:'0',months:'6',tax:'22'});
 close(val(r,'Interest earned'),198.03902718557);close(val(r,'Effective annual yield (APY)'),4);
 const twelve=r.additionalTables![0].rows.find(row=>row[0]===12)!;
 close(Number(twelve[1]),10400);close(Number(twelve[3]),10312);assert.equal(val(r,'Selected CD term in months'),6);
});
test('401k contribution tax savings separates Roth, mandatory Roth catch-up and payroll taxes',()=>{
 const v=defaults(contributionTaxSavings),r=contributionTaxSavings.calculate(v);
 close(val(r,'Estimated annual income-tax saving'),1760);close(val(r,'Estimated paycheck reduction per pay period'),240);
 const roth=contributionTaxSavings.calculate({...v,roth_share:'100'});assert.equal(val(roth,'Estimated annual income-tax saving'),0);
 const older=contributionTaxSavings.calculate({...v,age:'60',salary:'100000',employee:'35750',prior_wages:'160000'});
 assert.equal(val(older,'Annual Roth employee deferral'),11250);assert.equal(val(older,'Annual traditional employee deferral'),24500);
 assert.throws(()=>contributionTaxSavings.calculate({...v,employee:'25000'}),/exceeds/);
});
test('New SE and 401k tax mode load in browser dispatch; researched worked examples execute',async()=>{
 const se=tool('self-employment-tax'),input=defaults(se.modes[0]);assert.deepEqual(await runClientCalculation(se.id,se.category,'annual',input),selfEmploymentProjection(input));
 assert.deepEqual(await runClientCalculation('401k','Retirement','tax-savings',defaults(contributionTaxSavings)),contributionTaxSavings.calculate(defaults(contributionTaxSavings)));
 for(const id of ['self-employment-tax','credit-card','cd','apr','401k'])for(const e of guides[id].examples){const r=result(id,e.mode,Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)])));close(val(r,e.expected.label),e.expected.value,e.expected.tolerance??.005);}
});
