import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultContext} from '../src/lib/result-context';
import {resultTrend} from '../src/lib/result-trend';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {runClientCalculation} from '../src/lib/calculate-client';
const close=(a:number,b:number,tol=.005)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
function inputs(id:string,mode:string,v:Record<string,string|number>={}){const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return {...defaults(m),...(id==='mortgage'?{pmi_method:'Manual'}:{}),...Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]))};}
const run=(id:string,mode:string,v:Record<string,string|number>={})=>runCalculation(id,mode,inputs(id,mode,v));
const metric=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
for(const id of ['mortgage','fha-loan','va-mortgage'])for(const mode of ['monthly','biweekly'])test(`MORT-01: ${id}/${mode} rejects fractional aggregate months`,()=>{
 for(const v of [{years:1,months:.5},{years:1.1,months:0},{years:.01,months:0},{years:1001,months:0}])assert.throws(()=>run(id,mode,v),/whole number of months/);
});
test('MORT-01: fractional years yielding whole monthly periods remain supported',()=>{
 close(run('mortgage','monthly',{years:1.5,rate:0}).rows!.length,18);
 close(run('mortgage','monthly',{years:1.1,months:.8,rate:0}).rows!.length,14);
 for(const id of ['fha-loan','va-mortgage'])close(run(id,'monthly',{years:1.5,rate:0}).rows!.length,18);
 close(metric(run('mortgage','monthly',{price:12000,down:0,years:1/12,rate:0,tax:0,insurance:0}),'Monthly principal & interest'),12000);
});
for(const text of ['1,','1,100,999','1,1,000',',100','0,100','1.5,100','12001,100','1,-1','1,NaN','1,Infinity','1,1e16'])test(`MORT-02: malformed extra-payment row ${JSON.stringify(text)}`,()=>{
 for(const id of ['mortgage','fha-loan','va-mortgage'])assert.throws(()=>run(id,'monthly',{dated:text}),/Extra payment row 1:/);
});
test('MORT-02: errors preserve original line numbers and both mortgage modes reject bad rows',()=>{
 for(const mode of ['monthly','biweekly'])assert.throws(()=>run('mortgage',mode,{dated:'\n1,50\n\n2,'}),/Extra payment row 4:/);
 assert.throws(()=>run('amortization','schedule',{dated:'1,100,999'}),/Extra payment row 1:/);
});
test('MORT-02: valid whitespace, blank lines, duplicates, zero and payoff truncation',()=>{
 const r=run('mortgage','monthly',{price:12000,down:0,years:1,rate:0,tax:0,insurance:0,dated:'\n 1 , 100 \n1,200\n2,0\n3,50000\n'});
 close(Number(r.rows![0][2]),1300);close(Number(r.rows![1][2]),1000);close(Number(r.rows![2][2]),9700);
 close(metric(r,'Total payments'),12000);close(Number(r.rows!.at(-1)![5]),0);assert.equal(r.rows!.length,3);
});
for(const id of ['mortgage','fha-loan','va-mortgage'])for(const mode of ['monthly','biweekly'])test(`MORT-03: ${id}/${mode} full cash purchase retains ongoing ownership costs`,()=>{
 const v={price:400000,down:100,tax:4800,insurance:1500,hoa:1200,other:2400,pmi:1200},r=run(id,mode,v);
 close(metric(r,'Financed loan amount'),0);close(metric(r,'Initial monthly total'),825);close(metric(r,'Initial annual ownership costs'),9900);close(metric(r,'Total interest'),0);close(metric(r,'Total payments'),0);
 assert.equal(r.rows,undefined);assert.equal(r.annualRows,undefined);assert.equal(resultTrend(id,mode,inputs(id,mode,v),r),null);
 assert.ok(!r.metrics.some(m=>['Total taxes and other costs','Total out of pocket'].includes(m.label)));
 assert.match(resultContext(id,mode,inputs(id,mode,v),r)!,/No mortgage loan is needed/);
 assert.match(r.notes!.join(' '),/No lifetime ownership-cost total/);
});
test('MORT-03: dollar down payment and percentage ownership costs reconcile without a loan',()=>{
 const r=run('mortgage','biweekly',{price:400000,down:400000,down_unit:'Dollars',tax:1.2,tax_unit:'Percent of home value',insurance:.375,insurance_unit:'Percent of home value'});
 close(metric(r,'Biweekly payment'),0);close(metric(r,'Payments'),0);close(metric(r,'Initial annual ownership costs'),6300);close(metric(r,'Initial monthly total'),525);
 assert.throws(()=>run('mortgage','monthly',{price:0}),/Home price/);
});
test('MORT-03: positive loans retain payment-period ownership totals and explain the horizon',()=>{
 const r=run('mortgage','monthly',{price:12000,down:0,years:1,rate:0,tax:1200,insurance:0,extra_once:12000,extra_once_month:1});
 close(metric(r,'Total taxes and other costs'),100);close(metric(r,'Total out of pocket'),12100);assert.equal(r.rows!.length,1);
 assert.match(r.notes!.join(' '),/only the modeled loan-payment period/);
});
test('MORT-04: original PMI value is the lower purchase price or purchase appraisal',()=>{
 const v={price:400000,down:20,pmi:1200,pmi_policy:'Cancel at 80% original LTV',tax:0,insurance:0},r=run('mortgage','monthly',{...v,appraised_value:350000});
 close(metric(r,'Original value for PMI'),350000);close(metric(r,'Original loan-to-value ratio'),91.42857142857);close(Number(r.rows![0][6]),100);
 // Independent annuity balance equation reaches $280,000 after98 payments.
 close(metric(r,'Total taxes and other costs'),9800);close(Number(r.rows![97][6]),100);close(Number(r.rows![98][6]),0);
 for(let i=0;i<r.rows!.length;i++){
  const opening=i?Number(r.rows![i-1][5]):320000;
  close(Number(r.rows![i][6]),opening>280000?100:0);
 }
 for(const appraisal of ['',400000,450000]){const equal=run('mortgage','monthly',{...v,appraised_value:appraisal});close(metric(equal,'Original value for PMI'),400000);close(Number(equal.rows![0][6]),0);}
});
test('MORT-04: early principal affects the requested cancellation threshold and annual totals',()=>{
 const r=run('mortgage','monthly',{price:400000,down:20,pmi:1200,pmi_policy:'Cancel at 80% original LTV',appraised_value:350000,tax:0,insurance:0,extra_once:40000,extra_once_month:1});
 close(Number(r.rows![0][6]),100);close(Number(r.rows![1][6]),0);close(Number(r.annualRows![0][6]),100);
 close(metric(r,'Total taxes and other costs'),100);
 close(r.rows!.reduce((sum,row)=>sum+Number(row[4]),0),320000);
});
test('MORT-04: appraisal changes neither loan P&I nor fixed-duration PMI or FHA policy behavior',()=>{
 const normal=run('mortgage','monthly',{pmi:1200}),unused=run('mortgage','monthly',{pmi:1200,appraised_value:'not used'});
 assert.deepEqual(unused.metrics,normal.metrics);close(Number(unused.rows![0][6]),625);
 const f=run('fha-loan','monthly',{appraised_value:350000});close(metric(f,'FHA loan-to-value ratio'),91.42857142857);close(metric(f,'FHA MIP duration in years'),30);
 assert.throws(()=>run('mortgage','monthly',{pmi_policy:'Cancel at 80% original LTV',appraised_value:0}),/appraised value/i);
});
test('Mortgage repair inputs survive sharing and lazy calculation for both modes',async()=>{
 const c=calculators.find(c=>c.id==='mortgage')!;
 const cases: Record<string,string>[]=[{pmi_policy:'Cancel at 80% original LTV',appraised_value:'350000',pmi:'1200'},{down:'100'}];
 for(const mode of ['monthly','biweekly'])for(const values of cases){
  const m=c.modes.find(m=>m.id===mode)!,v=inputs(c.id,mode,values),url=new URL(calculationLink('https://calculatorfree.io','/mortgage-calculator.html',m,v,true)),shared=sharedInputs(c,url.search,url.hash)!;
  assert.deepEqual((await runClientCalculation(c.id,c.category,mode,shared.values)).metrics,runCalculation(c.id,mode,v).metrics);
 }
});
