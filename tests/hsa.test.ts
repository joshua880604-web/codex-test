import test from 'node:test';import assert from 'node:assert/strict';
import {hsaCalculator,hsaAllowance,hsaGrowth,hsaTax} from '../src/lib/calculators/hsa';
import {defaults} from '../src/lib/types';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
const v=(mode=0,patch:Record<string,string>={})=>({...defaults(hsaCalculator.modes[mode]),...patch});
const n=(r:ReturnType<typeof hsaTax>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
test('HSA annual legal ceilings, catch-up and monthly prorating',()=>{
 assert.equal(hsaAllowance(v()).limit,4400);
 assert.equal(hsaAllowance(v(0,{coverage:'Family',catchup:'Yes',months:'6'})).limit,4875);
 assert.equal(hsaAllowance(v(0,{year:'2025',coverage:'Family'})).limit,8550);
 assert.equal(hsaAllowance(v(0,{months:'0'})).limit,0);
});
test('HSA employer room and direct versus Section125 payroll tax savings',()=>{
 const direct=hsaTax(v());assert.equal(n(direct,'Estimated tax savings on personal contribution'),660);
 assert.equal(n(direct,'Maximum personal contribution after employer'),3900);
 assert.equal(n(hsaTax(v(0,{method:'Section 125 payroll'})),'Estimated tax savings on personal contribution'),889.5);
 const excess=hsaTax(v(0,{employee:'5000',employer:'1000'}));
 assert.equal(n(excess,'Planned contributions above modeled limit'),1600);
 assert.equal(n(excess,'Estimated tax savings on personal contribution'),748);
 assert.equal(n(hsaTax(v(0,{employer:'5000'})),'Estimated tax savings on personal contribution'),0);
});
test('HSA hand-calculated year-end cash flow and accounting identity',()=>{
 const r=hsaGrowth(v(1,{years:'1',contribution_years:'1',fee:'50',inflation:'0'}));
 assert.equal(n(r,'Projected HSA balance'),7700);
 assert.equal(n(r,'Ending balance in today’s dollars'),7700);
 const long=hsaGrowth(v(1));
 assert.ok(Math.abs(n(long,'Projected HSA balance')-(5000+n(long,'Total new contributions')+n(long,'Investment earnings before fees')-n(long,'Total medical withdrawals')-n(long,'Total fees paid')))<1e-7);
});
test('HSA zero return matches independent arithmetic-series saving',()=>{
 const r=hsaGrowth(v(1,{return:'0',years:'10',contribution_years:'4',spending:'200',fee:'50'}));
 assert.equal(n(r,'Projected HSA balance'),16500); // 5000 + 4*3500 - 10*250
 const compound=hsaGrowth(v(1,{employee:'0',employer:'0',spending:'0',years:'10',contribution_years:'0',inflation:'2'}));
 assert.ok(Math.abs(n(compound,'Projected HSA balance')-5000*1.05**10)<1e-7);
 assert.ok(Math.abs(n(compound,'Ending balance in today’s dollars')-5000*(1.05/1.02)**10)<1e-7);
});
test('HSA cannot overdraw, separates unfunded costs and accepts losses',()=>{
 const r=hsaGrowth(v(1,{balance:'100',employee:'0',employer:'0',return:'-50',spending:'100',fee:'10',years:'2',contribution_years:'0'}));
 assert.equal(n(r,'Projected HSA balance'),0);assert.equal(n(r,'Medical expenses not funded by HSA'),160);assert.equal(n(r,'Total fees paid'),10);
});
test('HSA rejects unsupported selections, bad periods and over-limit growth',()=>{
 for(const patch of [{months:'1.5'},{months:'13'},{coverage:'Both'},{year:'2027'},{catchup:'Maybe'},{employee:'-1'}])assert.throws(()=>hsaAllowance(v(0,Object.fromEntries(Object.entries(patch).map(([k,value])=>[k,String(value)])))));
 for(const patch of [{employee:'5000'},{years:'0'},{years:'2',contribution_years:'3'},{return:'-100'},{years:'2.5'}])assert.throws(()=>hsaGrowth(v(1,Object.fromEntries(Object.entries(patch).map(([k,value])=>[k,String(value)])))));
 assert.throws(()=>hsaTax(v(0,{state:'100'})));
});
test('HSA lazy client loader and visible editorial examples match calculations',async()=>{
 for(const mode of hsaCalculator.modes){const input=defaults(mode);assert.deepEqual(await runClientCalculation('hsa','Retirement',mode.id,input),mode.calculate(input));}
 for(const e of guides.hsa.examples){const mode=hsaCalculator.modes.find(m=>m.id===e.mode)!;const r=mode.calculate({...defaults(mode),...Object.fromEntries(Object.entries(e.values).map(([k,val])=>[k,String(val)]))});assert.ok(Math.abs(n(r,e.expected.label)-e.expected.value)<=(e.expected.tolerance??0.005));}
 assert.equal(guides.hsa.questions.length,10);
});
