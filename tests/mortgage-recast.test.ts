import {test} from 'node:test';
import assert from 'node:assert/strict';
import controls from './fixtures/recast-independent.json';
import {calculators, defaults, runCalculation, routeFor} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {resultTrend} from '../src/lib/result-trend';
import {imageDetails,imageMetrics} from '../src/lib/result-image-data';
import {directorySearch} from '../src/lib/directory';
import {calculators as catalog} from '../src/lib/catalog';
const calc=calculators.find(c=>c.id==='mortgage-recast')!,mode=calc.modes[0];
const run=(extra:Partial<Record<string,string|number>>={})=>runCalculation(calc.id,mode.id,{...defaults(mode),...Object.fromEntries(Object.entries(extra).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});
const value=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number,tolerance=.00001)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
// 60-digit Decimal closed-form amortization/payoff controls, not this engine's output.
for(const c of controls)test('Recast independent Decimal control: '+c.name,()=>{
 const r=run(c.inputs);
 for(const [label,expected] of Object.entries(c.expected))close(value(r,label),expected);
});
test('Recast comparison conserves principal and includes upfront cash once',()=>{
 for(const c of controls){
  const r=run(c.inputs),p=Number(c.inputs.principal),lump=Number(c.inputs.lump),fee=Number(c.inputs.fee);
  close(r.rows!.reduce((s,row)=>s+Number(row[3]),0),p-lump);
  close(r.rows!.reduce((s,row)=>s+Number(row[1]),0)+lump+fee,value(r,'Recast total future cash outlay'));
  close(value(r,'Recast total future cash outlay'),p+value(r,'Recast remaining interest')+fee);
  close(value(r,'Baseline total future cash outlay')-value(r,'Recast total future cash outlay'),value(r,'Recast net interest savings after fee'));
  assert.equal(r.rows!.at(-1)![4],0);assert.equal(r.rows!.at(-1)![5],0);
  assert.ok(r.rows!.every(row=>Number(row[3])>=0&&Number(row[4])>=0&&Number(row[5])>=0));
  close(r.annualRows!.reduce((s,row)=>s+Number(row[2]),0),value(r,'Recast remaining interest'));
  assert.equal(r.additionalTables![0].rows.length,3);
 }
});
test('Recast fees reduce savings without changing balance or payment; zero lump is not free savings',()=>{
 const a=run({fee:0}),b=run({fee:1000});
 close(value(a,'New monthly P&I after recast'),value(b,'New monthly P&I after recast'));
 assert.deepEqual(a.rows,b.rows);close(value(a,'Recast net interest savings after fee')-value(b,'Recast net interest savings after fee'),1000);
 close(value(run({lump:0,fee:300}),'Recast net interest savings after fee'),-300);
});
test('Prior extra payments preserve actual P&I and allow negative recast savings',()=>{
 const r=run({principal:100000,rate:6,years:30,lump:10000,current_payment:2000,fee:500});
 assert.ok(value(r,'Baseline months to payoff')<360);
 assert.ok(value(r,'Recast net interest savings after fee')<0);
 assert.ok(value(r,'Lump-sum-only months to payoff')<value(r,'Recast months to payoff'));
});
test('Recast rejects non-amortizing statement payment, invalid term and complete payoff',()=>{
 for(const values of [{current_payment:1},{years:0,months:0},{years:1.5},{months:1.5},{years:40,months:1},{lump:300000},{lump:300001},{lump:-1},{principal:0},{rate:-1},{months:12},{fee:-1}])assert.throws(()=>run(values),JSON.stringify(values));
 for(const key of ['principal','rate','years','months','lump','fee'])assert.throws(()=>run({[key]:''}));
 assert.throws(()=>run({current_payment:'NaN'}));
});
test('Recast accepts rounded statement P&I and adjusts final payment without negative balance',()=>{
 const baseline=run();const rounded=value(baseline,'Current monthly P&I used').toFixed(2);
 const r=run({current_payment:rounded});close(value(r,'Current monthly P&I used'),Number(rounded),.0051);
 assert.equal(r.rows!.at(-1)![4],0);
});
test('Recast curve and PNG use actual reduced-balance schedules, not the old principal',()=>{
 const v=defaults(mode),r=run(),trend=resultTrend(calc.id,mode.id,v,r)!;
 assert.deepEqual(trend.points[0],{x:0,balance:250000,comparison:250000});
 assert.equal(trend.points.at(-1)!.balance,0);assert.equal(trend.points.at(-1)!.comparison,0);
 assert.equal(trend.points.at(-1)!.x,25);assert.ok(trend.points.some(p=>p.balance>p.comparison!));
 const details=imageDetails(calc.id,mode,v,r,mode.fields,false);
 assert.deepEqual(details.trend,trend);assert.deepEqual(details.inputs,[]);
 assert.equal(imageMetrics(calc.id,mode.id,r).length,r.metrics.length);
});
test('Recast synonyms resolve once to the same page and lazy client matches server',async()=>{
 for(const query of ['mortgage recast','recast mortgage calculator','recast calculator','mortgage recasting']){
  const results=directorySearch(catalog,query);assert.equal(results[0].tool.id,calc.id);assert.equal(results.filter(x=>x.tool.id===calc.id).length,1);
 }
 assert.equal(routeFor(calc.id),'/mortgage-recast-calculator.html');
 assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,defaults(mode)),run());
});
