import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validationExamples,exampleLink} from '../src/lib/methodology';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
for(const example of validationExamples)test('Published methodology check: '+example.title,()=>{
 const calc=calculators.find(calc=>calc.id===example.id)!,mode=calc.modes.find(mode=>mode.id===example.mode)!;
 const url=new URL(exampleLink(example),'https://calculatorfree.io');
 const values={...defaults(mode),...Object.fromEntries(url.searchParams)};delete values.mode;
 const result=runCalculation(calc.id,mode.id,values),actual=result.metrics.find(metric=>metric.label===example.label)!;
 assert.ok(actual);assert.ok(Math.abs(actual.value-example.expected)<.000001,actual.value+' != '+example.expected);
 if(example.id==='loan'){
  assert.equal(result.rows!.length,12);
  assert.ok(Math.abs(result.rows!.reduce((n,row)=>n+Number(row[3]),0)-12000)<.000001);
  assert.ok(Math.abs(Number(result.rows!.at(-1)!.at(-1)))<.000001);
 }
});
test('Published inflation sensitivity uses the same annual period and exact real-return model',()=>{
 const calc=calculators.find(calc=>calc.id==='real-return')!,mode=calc.modes.find(mode=>mode.id==='rate')!;
 const first=runCalculation(calc.id,mode.id,{...defaults(mode),nominal:'6',inflation:'2.5'}).metrics[0].value;
 const second=runCalculation(calc.id,mode.id,{...defaults(mode),nominal:'6',inflation:'3.5'}).metrics[0].value;
 assert.equal(first.toFixed(4),'3.4146');assert.equal(second.toFixed(4),'2.4155');assert.ok(first>second);
});
