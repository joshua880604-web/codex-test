import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
const calc=calculators.find(c=>c.id==='mortgage-payoff')!;
test('Non-extra payoff strategies ignore legacy extra inputs while keeping the same result',()=>{
 for(const mode of calc.modes.filter(m=>!m.id.endsWith('-extra'))){
  const link=sharedInputs(calc,`?mode=${mode.id}&extra_monthly=-999&extra_once_month=0`,'')!;
  assert.equal(link.values.extra_monthly,undefined);
  assert.deepEqual(runCalculation(calc.id,mode.id,link.values).metrics,runCalculation(calc.id,mode.id,defaults(mode)).metrics);
 }
});
test('Extra payoff payments reduce interest against normal repayment under both input bases',()=>{
 for(const basis of ['remaining','known']){
  const mode=calc.modes.find(m=>m.id===basis+'-extra')!;
  const result=runCalculation(calc.id,mode.id,{...defaults(mode),extra_monthly:'100'});
  const normal=calc.modes.find(m=>m.id===basis+'-normal')!;
  const baseline=runCalculation(calc.id,normal.id,defaults(normal));
  assert.ok(result.metrics.find(m=>m.label==='Interest with strategy')!.value<baseline.metrics.find(m=>m.label==='Interest with strategy')!.value);
  assert.ok(result.metrics.find(m=>m.label==='Interest saved')!.value>0);
 }
});
