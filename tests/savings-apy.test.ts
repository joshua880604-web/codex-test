import {test} from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const tool=calculators.find(c=>c.id==='savings')!;
const base={principal:'10000',rate:'4',rate_type:'APY',compound:'Monthly',annual:'0',timing:'End of period',tax:'0',inflation:'0'};
const run=(id:string,extra:Record<string,string>={})=>runCalculation('savings',id,{...defaults(tool.modes.find(m=>m.id===id)!),...base,...extra});
const val=(r:ReturnType<typeof run>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const rate=1.04**(1/12)-1;
const future=(months:number,deposit:number,due=false)=>10000*(1+rate)**months+deposit*((1+rate)**months-1)/rate*(due?1+rate:1);
test('savings APY accumulation uses effective yield and exact contribution timing',()=>{
 for(const timing of ['End of period','Beginning of period'])for(const compound of ['Monthly','Daily','Annually']){
  const r=run('accumulation',{years:'1',months:'0',monthly:'200',compound,timing});close(val(r,'Ending balance'),future(12,200,timing==='Beginning of period'));close(Number(r.rows!.at(-1)![3]),val(r,'Ending balance'));
 }
});
test('savings APY required deposit independently matches annuity equation and accumulation',()=>{
 for(const timing of ['End of period','Beginning of period']){
  const r=run('goal-contribution',{end:'15000',years:'1',months:'0',timing});
  const expected=(15000-10400)/(((1.04-1)/rate)*(timing==='Beginning of period'?1+rate:1));close(val(r,'Required monthly deposit'),expected);close(val(r,'Ending balance'),15000);
  close(val(run('accumulation',{years:'1',months:'0',monthly:String(expected),timing}),'Ending balance'),15000);
 }
});
test('savings APY goal-time returns first whole month crossing target',()=>{
 const r=run('goal-time',{end:'15000',monthly:'200'});const months=val(r,'Months to savings goal');assert.equal(months,21);assert.ok(future(months-1,200)<15000);assert.ok(future(months,200)>=15000);
});
test('savings APY zero, negative, tax and already covered goals behave consistently',()=>{
 close(val(run('accumulation',{years:'1',months:'0',monthly:'0',tax:'25'}),'Ending balance'),10300);
 close(val(run('accumulation',{years:'1',months:'0',monthly:'0',rate:'-10',tax:'25'}),'Ending balance'),9000);
 close(val(run('goal-contribution',{end:'12400',years:'1',months:'0',rate:'0'}),'Required monthly deposit'),200);
 close(val(run('goal-time',{end:'10000'}),'Months to savings goal'),0);
 close(val(run('goal-contribution',{end:'9000',years:'1',months:'0'}),'Required monthly deposit'),0);
});
test('legacy savings links retain nominal compounding in all three modes',()=>{
 for(const mode of tool.modes){const values:Record<string,string>={...defaults(mode),rate:'12',compound:'Monthly'};delete values.rate_type;const r=runCalculation('savings',mode.id,values);assert.deepEqual(r,runCalculation('savings',mode.id,{...values,rate_type:'Nominal interest rate'}));}
 const v:Record<string,string>={...defaults(tool.modes[0]),principal:'10000',years:'1',months:'0',rate:'12',compound:'Monthly',annual:'0',monthly:'0',tax:'0'};delete v.rate_type;close(val(runCalculation('savings','accumulation',v),'Ending balance'),10000*1.01**12);
});
test('savings rejects invalid APY and has no APY selector on other shared growth tools',()=>{
 assert.throws(()=>run('accumulation',{rate_type:'Invalid'}));assert.throws(()=>run('accumulation',{rate:'-100'}));
 for(const id of ['investment','compound-interest','interest'])assert.ok(calculators.find(c=>c.id===id)!.modes.every(m=>!m.fields.some(f=>f.key==='rate_type')));
});
