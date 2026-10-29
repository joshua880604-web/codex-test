import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mortgageInvestCalculator,mortgageInvestPlan} from '../src/lib/calculators/mortgage-vs-invest';
import {defaults,type Result} from '../src/lib/types';
import {runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {resultTrend} from '../src/lib/result-trend';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const calc=mortgageInvestCalculator,mode=calc.modes[0],input=(p:Record<string,string|number>={})=>({...defaults(mode),...Object.fromEntries(Object.entries(p).map(([k,n])=>[k,String(n)]))});
const run=(p:Record<string,string|number>={})=>runCalculation(calc.id,mode.id,input(p));
const n=(r:Result,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number,t=.00001)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const zero={principal:12000,rate:0,term:1,lump:6000,extra:0,horizon:1,return:0};
test('Mortgage versus investing reinvests all freed payments in a zero-rate benchmark',()=>{
 const r=run(zero);close(n(r,'Paydown-first investment account'),6000);close(n(r,'Invest-first investment account'),6000);close(n(r,'Invest-first advantage at horizon'),0);close(n(r,'Paydown-first loan payoff within horizon'),6);close(n(r,'Invest-first loan payoff within horizon'),12);
});
test('Mortgage versus investing catches unused budget in the final payoff month',()=>{
 const r=run({...zero,principal:1200,lump:0,extra:350,horizon:.25});close(n(r,'Scheduled monthly principal and interest'),100);close(n(r,'Same total monthly cash budget'),450);close(n(r,'Paydown-first investment account'),150);close(n(r,'Invest-first investment account'),1050);close(n(r,'Invest-first mortgage remaining'),900);close(n(r,'Invest-first advantage at horizon'),0);close(Number(r.rows![2][1]),150);
});
test('Mortgage versus investing invests initial cash above the balance without throwing it away',()=>{
 const r=run({...zero,principal:1200,lump:2000});close(n(r,'Upfront principal paid in paydown-first path'),1200);close(n(r,'Paydown-first loan payoff within horizon'),0);close(n(r,'Paydown-first investment account'),2000);close(n(r,'Invest-first investment account'),2000);close(n(r,'Invest-first advantage at horizon'),0);
});
test('Mortgage versus investing baseline matches independent loan-balance and annuity formulas',()=>{
 const p={principal:300000,rate:6,term:20,lump:10000,extra:200,horizon:5,return:7},r=run(p),i=.06/12,g=1.07**(1/12),m=60,a=300000*i/(1-(1+i)**(-240));
 const debt=300000*(1+i)**m-a*((1+i)**m-1)/i,portfolio=10000*g**m+200*(g**m-1)/(g-1),prepayDebt=290000*(1+i)**m-(a+200)*((1+i)**m-1)/i;
 close(n(r,'Scheduled monthly principal and interest'),a);close(n(r,'Invest-first mortgage remaining'),debt);close(n(r,'Invest-first investment account'),portfolio);close(n(r,'Paydown-first mortgage remaining'),prepayDebt);close(n(r,'Invest-first advantage at horizon'),portfolio-debt+prepayDebt);
});
test('Mortgage versus investing conserves the identical contributed cash in both paths',()=>{
 for(const patch of [{},{...zero},{...zero,principal:1200,lump:2000},{return:-20,horizon:30},{extra:0,lump:0,horizon:40}] as Record<string,string|number>[]){
  const v=input(patch),r=run(patch),funds=Number(v.lump)+n(r,'Same total monthly cash budget')*n(r,'Comparison length in months');
  for(const path of ['Paydown-first','Invest-first']){const loanPaid=Number(v.principal)-n(r,path+' mortgage remaining')+n(r,path+' interest paid within horizon');close(loanPaid+n(r,path+' total investment deposits'),funds,.001);}
 }
});
test('Mortgage versus investing equal monthly growth keeps both positions equal before and after payoff',()=>{
 for(const rate of [0,3,6,12])for(const horizon of [.5,5,20]){const effective=((1+rate/1200)**12-1)*100,r=run({principal:60000,rate,term:10,lump:15000,extra:250,horizon,return:effective});close(n(r,'Invest-first advantage at horizon'),0,.001);}
});
test('Mortgage versus investing no lump and no monthly extra is identical at every return',()=>{
 for(const ret of [-20,0,6,15]){const r=run({lump:0,extra:0,return:ret,horizon:35});close(n(r,'Invest-first advantage at horizon'),0);}
});
test('Mortgage versus investing keeps original P&I after upfront principal rather than recasting',()=>{
 const a=run({lump:0}),b=run({lump:50000});close(n(a,'Scheduled monthly principal and interest'),n(b,'Scheduled monthly principal and interest'));assert.ok(n(b,'Paydown-first mortgage remaining')<n(a,'Paydown-first mortgage remaining'));
});
test('Mortgage versus investing reports only horizon interest and no guessed later payoff',()=>{
 const r=run({horizon:1});assert.match(r.metrics.find(m=>m.label==='Invest-first loan payoff within horizon')!.displayValue!,/Not paid off/);assert.ok(n(r,'Interest avoided within horizon')>0);close(n(r,'Interest avoided within horizon'),n(r,'Invest-first interest paid within horizon')-n(r,'Paydown-first interest paid within horizon'));assert.equal(r.rows!.length,12);
});
test('Mortgage versus investing zero mortgage gives the same investment path',()=>{
 const r=run({principal:0,lump:1000,extra:100,horizon:1,return:12});close(n(r,'Scheduled monthly principal and interest'),0);close(n(r,'Invest-first advantage at horizon'),0);close(n(r,'Paydown-first loan payoff within horizon'),0);close(n(r,'Invest-first loan payoff within horizon'),0);assert.ok(n(r,'Paydown-first investment account')>2200);
});
test('Mortgage versus investing sensitivity retains exact baseline and equal-growth references',()=>{
 const r=run(),rows=r.additionalTables![0].rows,baseline=rows.find(row=>Math.abs(Number(row[0])-6)<1e-8)!;close(Number(baseline[7]),n(r,'Invest-first advantage at horizon'));const ref=n(r,'Equal-growth annual investment reference'),matched=rows.find(row=>Math.abs(Number(row[0])-ref)<1e-8)!;close(Number(matched[7]),0,.001);assert.ok(rows.some(row=>row[0]===0));
});
test('Mortgage versus investing can favor paydown at low return or investing at higher return',()=>{
 assert.ok(n(run({return:0}),'Invest-first advantage at horizon')<0);assert.ok(n(run({return:12}),'Invest-first advantage at horizon')>0);assert.ok(n(run({return:-20}),'Invest-first investment account')>=0);
});
test('Mortgage versus investing positions and chart exclude common home value consistently',()=>{
 const v=input(),r=run(),trend=resultTrend(calc.id,mode.id,v,r)!;assert.ok(trend);close(trend.points[0].balance,10000-300000);close(trend.points[0].comparison!,10000-300000);close(trend.points.at(-1)!.balance,n(r,'Paydown-first investments minus mortgage'));close(trend.points.at(-1)!.comparison!,n(r,'Invest-first investments minus mortgage'));close(trend.points.at(-1)!.x,10);assert.match(trend.help,/home value/);
});
test('Mortgage versus investing rejects invalid periods, rates and unsupported growth',()=>{
 for(const patch of [{principal:-1},{lump:-1},{extra:-1},{term:0},{term:51},{term:1.01},{horizon:0},{horizon:51},{horizon:1.01},{rate:-1},{rate:26},{return:-100},{return:51},{principal:''},{return:'NaN'},{lump:1e9,horizon:50,return:50}] as Record<string,string|number>[])assert.throws(()=>run(patch));assert.throws(()=>mortgageInvestPlan(input({principal:1e10})));
});
test('Mortgage versus investing lazy client and worked examples match the pure engine',async()=>{
 assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,input()),run());for(const e of guides[calc.id].examples)close(n(run(e.values),e.expected.label),e.expected.value,e.expected.tolerance??.005);assert.equal(guides[calc.id].questions.length,10);
});
test('Mortgage versus investing is one canonical tool with mortgage and investment links',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/pay-off-mortgage-vs-invest-calculator').length,1);assert.equal(calculatorCategory(calc.id)!.id,'mortgage-housing');for(const id of ['mortgage-payoff','mortgage','investment','compound-interest'])assert.ok(relatedCalculatorIds[id].includes(calc.id));const schema=JSON.stringify(calculatorSchema(calc,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});

test('Mortgage versus investing retains valid main results when a higher sensitivity exceeds the numeric range',()=>{
 const r=run({principal:0,lump:1e7,extra:0,horizon:50,return:44});assert.ok(Number.isFinite(n(r,'Invest-first investment account')));assert.ok(r.additionalTables![0].rows.some(row=>Math.abs(Number(row[0])-44)<1e-8));assert.ok(!r.additionalTables![0].rows.some(row=>Math.abs(Number(row[0])-46)<1e-8));
});
