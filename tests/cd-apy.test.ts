import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators, defaults, runCalculation} from '../src/lib/calculators';
const mode=calculators.find(c=>c.id==='cd')!.modes[0];
const run=(extra:Record<string,string>)=>runCalculation('cd',mode.id,{...defaults(mode),...extra});
const value=(r:ReturnType<typeof run>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.000001,`${a} != ${b}`);
test('CD effective yield earns exactly 400 per 10000 at 4% for one year without double compounding',()=>{
 for(const compound of ['Monthly','Annually','Daily']) {
  const r=run({principal:'10000',rate_type:'APY',rate:'4',years:'1',months:'0',tax:'25',compound});
  close(value(r,'Maturity balance'),10400);close(value(r,'Interest earned'),400);close(value(r,'Tax on interest'),100);close(value(r,'After-tax balance'),10300);
  close(Number(r.rows!.at(-1)![3]),10400);
 }
});
test('CD APY supports half year, two years, zero term, zero and negative yield',()=>{
 for(const [rate,months,expected] of [['4','6',10000*Math.sqrt(1.04)],['4','24',10816],['0','12',10000],['-10','12',9000],['4','0',10000]] as const){
  const r=run({principal:'10000',rate_type:'APY',rate,years:'0',months,tax:'25'});close(value(r,'Maturity balance'),expected);
  if(Number(rate)<0)close(value(r,'Tax on interest'),0);
 }
});
test('legacy CD values without rate type keep nominal-rate compounding',()=>{
 const v:Record<string,string>={...defaults(mode),principal:'10000',rate:'12',years:'1',months:'0',compound:'Monthly',tax:'0'};delete v.rate_type;
 const r=runCalculation('cd',mode.id,v);close(value(r,'Maturity balance'),10000*1.01**12);
});
test('CD rejects invalid rate type and APY outside supported domain',()=>{
 assert.throws(()=>run({rate_type:'Invalid'}));assert.throws(()=>run({rate_type:'APY',rate:'-100'}));assert.throws(()=>run({rate_type:'APY',rate:'NaN'}));
});
