import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {keywordTitles,searchTasks} from '../src/lib/keyword-targets';
const run=(id:string,modeId:string,overrides:Record<string,string|number>)=>{const mode=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===modeId)!;return runCalculation(id,modeId,{...defaults(mode),...Object.fromEntries(Object.entries(overrides).map(([k,v])=>[k,String(v)]))});};
const value=(result:ReturnType<typeof run>,label:string)=>result.metrics.find(m=>m.label===label)!.value;
test('Each search-intent entry links to a real mode and a distinct primary page',()=>{
 for(const [id,tasks] of Object.entries(searchTasks)){
  const calc=calculators.find(c=>c.id===id)!;assert.ok(calc&&keywordTitles[id]);
  for(const t of tasks)assert.ok(calc.modes.some(m=>m.id===t.mode),id+t.mode);
 }
 assert.equal(new Set(Object.values(searchTasks).flat().map(t=>t.keyword)).size,12);
});
test('Compound growth matches independent ordinary and due annuity identities',()=>{
 const r=.06/12,N=24,f=(1+r)**N;
 for(const timing of ['End of period','Beginning of period']){
 const result=run('compound-interest','growth',{principal:1000,monthly:100,annual:0,rate:6,years:2,months:0,compound:'Monthly',timing,tax:0,inflation:0});
 assert.ok(Math.abs(value(result,'Ending balance')-(1000*f+100*(f-1)/r*(timing.startsWith('Beginning')?1+r:1)))<1e-7);
 }
 assert.ok(run('compound-interest','conversion',{rate:5,from:'Monthly',to:'Annually'}).metrics.length===2);
});
test('Savings target solver handles zero rate, reached targets and impossible horizons',()=>{
 assert.equal(value(run('savings','goal-contribution',{principal:0,end:12000,rate:0,years:1,months:0,annual:0,tax:0,inflation:0}),'Required monthly deposit'),1000);
 assert.equal(value(run('savings','goal-contribution',{principal:15000,end:12000,rate:0,years:1,months:0,annual:0}),'Required monthly deposit'),0);
 assert.throws(()=>run('savings','goal-contribution',{principal:0,end:12000,rate:0,years:0,months:0,annual:0}),/at least one month/);
 assert.equal(value(run('savings','goal-time',{principal:0,end:12000,rate:0,monthly:1000,annual:0}),'Months to savings goal'),12);
 assert.equal(value(run('savings','goal-time',{principal:12000,end:12000,rate:0,monthly:0,annual:0}),'Months to savings goal'),0);
 assert.throws(()=>run('savings','goal-time',{principal:0,end:12000,rate:0,monthly:0,annual:0}),/200 years/);
});
test('Positive-rate savings target and period boundary satisfy independently calculated values',()=>{
 const r=.06/12,f=(1+r)**12;
 const result=run('savings','goal-contribution',{principal:1000,end:5000,rate:6,years:1,months:0,annual:0,compound:'Monthly',timing:'End of period',tax:0,inflation:0});
 assert.ok(Math.abs(value(result,'Required monthly deposit')-(5000-1000*f)/((f-1)/r))<1e-7);
 const duration=run('savings','goal-time',{principal:0,end:12001,rate:0,monthly:1000,annual:0});assert.equal(value(duration,'Months to savings goal'),13);
});
test('Extra loan payments conserve principal, cap final payment and compare independently hand-worked baseline',()=>{
 const result=run('repayment','extra-payments',{principal:1000,rate:12,payment:500,extra_monthly:500,extra_yearly:0,extra_once:0,extra_once_month:1});
 assert.ok(Math.abs(value(result,'Interest saved')-5.151)<1e-8);
 assert.equal(value(result,'Months saved'),1);
 assert.equal(result.rows!.length,2);assert.ok(Math.abs(Number(result.rows![1][1])-10.1)<1e-8);
 assert.ok(Math.abs(result.rows!.reduce((sum,row)=>sum+Number(row[3]),0)-1000)<1e-8);
 assert.equal(result.rows!.at(-1)![4],0);
 const unchanged=run('repayment','extra-payments',{extra_monthly:0,extra_yearly:0,extra_once:0});assert.equal(value(unchanged,'Interest saved'),0);assert.equal(value(unchanged,'Months saved'),0);
 const once=run('repayment','extra-payments',{principal:1000,rate:0,payment:100,extra_monthly:0,extra_yearly:0,extra_once:500,extra_once_month:3});assert.equal(value(once,'Months saved'),5);
 const yearly=run('repayment','extra-payments',{principal:2400,rate:0,payment:100,extra_monthly:0,extra_yearly:1200,extra_once:0});assert.equal(value(yearly,'Months saved'),12);
 assert.throws(()=>run('repayment','extra-payments',{principal:1000,rate:12,payment:10}),/cover monthly interest/);
 assert.throws(()=>run('repayment','extra-payments',{extra_once_month:1.5}),/whole number/);
});
