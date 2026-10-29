import test from 'node:test';import assert from 'node:assert/strict';
import fixtures from './fixtures/fire-budgets.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {fireProjection} from '../src/lib/calculators/fire';
import {runClientCalculation} from '../src/lib/calculate-client';
import {resultTrend} from '../src/lib/result-trend';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
const tool=(id:string)=>calculators.find(c=>c.id===id)!;
const values=(id:string,changes:Record<string,string>={})=>({...defaults(tool(id).modes[0]),...changes});
const run=(id:string,changes:Record<string,string>={})=>{const v=values(id,changes);return {v,r:runCalculation(id,'plan',v)};};
const n=(r:ReturnType<typeof run>['r'],label:string)=>r.metrics.find(m=>m.label===label)!.value;
for(const f of fixtures)test('Decimal60 budget FIRE '+f.id+'/'+f.case,()=>{
 const {r,v}=run(f.id,f.values as Record<string,string>);
 for(const[label,expected]of Object.entries(f.expected))assert.ok(Math.abs(n(r,label)-expected)<.00001,f.id+'/'+f.case+'/'+label);
 assert.equal(n(r,'Modeled target status'),f.crossing===null?0:f.crossing===0?1:2);
 const trend=resultTrend(f.id,'plan',v,r);if(f.crossing===0)assert.equal(trend,null);else{assert.ok(trend);assert.equal(trend.points[0].balance,Number(v.balance));assert.equal(trend.points.at(-1)!.balance,n(r,'Portfolio at projection endpoint'));}
 const generic=fireProjection({...v,spending:String(n(r,'Annual portfolio-funded budget'))});
 assert.deepEqual(r.rows,generic.rows);assert.deepEqual(r.metrics.slice(0,generic.metrics.length),generic.metrics);
});
test('Monthly and annual budget units, taxes and buffer reconcile without double counting',()=>{
 const {r}=run('fat-fire',{core:'1000',travel:'1200',housing_extra:'0',family:'0',lifestyle:'0',health_extra:'0',annual_extra:'600',tax_allowance:'1200',buffer:'10'});
 assert.equal(n(r,'Annual portfolio-funded budget'),16500);assert.equal(n(r,'Annual spending buffer'),1500);assert.equal(n(r,'FIRE portfolio target'),412500);
 const rows=r.additionalTables![0].rows;assert.equal(Number(rows.at(-1)![1]),16500);assert.equal(rows.slice(0,-1).reduce((s,row)=>s+Number(row[1]),0),16500);
});
test('Budget comparisons preserve buffer and withdrawal assumptions and omit nonpositive budgets',()=>{
 const {r}=run('lean-fire',{buffer:'10'});const rows=r.additionalTables![1].rows;
 assert.deepEqual(rows.map(row=>row[0]),[-100,0,100]);assert.equal(rows[0][1],33000);assert.equal(rows[0][2],825000);
 const small=run('fat-fire',{core:'1',travel:'0',housing_extra:'0',family:'0',lifestyle:'0',health_extra:'0',annual_extra:'0'}).r;
 assert.equal(small.additionalTables![1].rows.length,2);
});
test('Both budget calculators reject missing, negative, zero-total and nonfinite inputs',()=>{
 for(const id of ['fat-fire','lean-fire']){
  for(const invalid of ([{buffer:'-1'},{buffer:'101'},{tax_allowance:'NaN'},{annual_extra:'-1'},{age:'35.5'},{max_age:'35'},{withdrawal:'0'},{return:'-100'}] as Record<string,string>[]))assert.throws(()=>run(id,invalid));
  const empty=values(id);for(const f of tool(id).modes[0].fields)if(f.unit?.startsWith('$/'))empty[f.key]='0';assert.throws(()=>runCalculation(id,'plan',empty));
 }
});
test('Lazy calculation and share restoration match the server budget projection',async()=>{
 for(const id of ['fat-fire','lean-fire']){
  const {v,r}=run(id,{tax_allowance:'1200',buffer:'5'});assert.deepEqual(await runClientCalculation(id,tool(id).category,'plan',v),r);
  const mode=tool(id).modes[0],url=new URL(calculationLink('https://www.calculatorfree.io','/'+id+'-calculator',mode,v,true));
  assert.deepEqual(runCalculation(id,'plan',sharedInputs(tool(id),url.search,url.hash)!.values),r);
 }
});
test('One canonical tool per FIRE budget, with distinct guides and mutual cluster links',()=>{
 for(const id of ['fat-fire','lean-fire']){
  assert.equal(tool(id).modes.length,1);assert.ok(guides[id].questions.length>=8);assert.equal(guides[id].examples.length,2);
  for(const other of ['fire','coast-fire',id==='fat-fire'?'lean-fire':'fat-fire'])assert.ok(relatedCalculatorIds[id].includes(other));
  assert.ok(relatedCalculatorIds.fire.includes(id));assert.ok(relatedCalculatorIds['coast-fire'].includes(id));
 }
 assert.notEqual(guides['fat-fire'].summary,guides['lean-fire'].summary);
});
