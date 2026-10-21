import test from 'node:test';
import assert from 'node:assert/strict';
import insights from '../src/lib/guide-insights.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
test('Result explanations name real outputs, with specific scenario comparisons and input checks',()=>{
 for(const [id,insight] of Object.entries(insights)){
  const calc=calculators.find(c=>c.id===id)!;assert.ok(calc);
  const labels=new Set(calc.modes.flatMap(mode=>runCalculation(id,mode.id,defaults(mode)).metrics.map(m=>m.label)));
  for(const result of insight.results)assert.ok(labels.has(result.label),id+': '+result.label);
  assert.ok(insight.answer.length>100&&insight.compare.length>=2&&insight.checks.length>=3,id);
 }
});
