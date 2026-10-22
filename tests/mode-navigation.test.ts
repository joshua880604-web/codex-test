import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { savingsChoices, taskModeGroups, switchModeInputs } from '../src/lib/mode-navigation';
import type { Values } from '../src/lib/types';
function context(id:string, start?:string) {
 const calc=calculators.find(c=>c.id===id)!;
 let mode=calc.modes.find(m=>m.id===start)??calc.modes[0],values=defaults(mode),drafts:Record<string,Values>={};
 return { get mode(){return mode;},get values(){return values;},edit(v:Values){values={...values,...v};},switch(next:string){const target=calc.modes.find(m=>m.id===next)!;const result=switchModeInputs(id,mode,target,values,drafts);mode=target;values=result.values;drafts=result.drafts;return values;} };
}
test('Mobile task choices cover every existing mode without adding unsupported combinations',()=>{
 for(const [id,groups] of Object.entries(taskModeGroups)){
  const ids=groups.flatMap(g=>g.choices.map(c=>c.id));
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual([...ids].sort(),calculators.find(c=>c.id===id)!.modes.map(m=>m.id).sort());
 }
 assert.deepEqual(savingsChoices.map(c=>c.id).sort(),calculators.find(c=>c.id==='savings')!.modes.map(m=>m.id).sort());
});
test('Savings retains contributions, zeroes and blank inputs across changing unknowns',()=>{
 const c=context('savings');c.edit({principal:'23456',rate:'0',years:'12',months:'3',monthly:'250',annual:'0'});
 c.switch('goal-contribution');assert.equal(c.values.principal,'23456');assert.equal(c.values.rate,'0');assert.equal(c.values.monthly,undefined);
 c.edit({end:'80000'});c.switch('goal-time');assert.equal(c.values.monthly,'250');assert.equal(c.values.end,'80000');assert.equal(c.values.years,undefined);
 c.switch('accumulation');assert.equal(c.values.years,'12');assert.equal(c.values.months,'3');assert.equal(c.values.monthly,'250');
 c.edit({principal:''});c.switch('goal-contribution');assert.equal(c.values.principal,'');
});
test('Student regular and extra repayment share original loan inputs but other balance meanings stay separate',()=>{
 const c=context('student-loan');c.edit({principal:'45678',rate:'4',years:'7',months:'5'});c.switch('extra');assert.equal(c.values.principal,'45678');assert.equal(c.values.months,'5');
 c.edit({extra_monthly:'120'});c.switch('normal');c.switch('extra');assert.equal(c.values.extra_monthly,'120');
 c.switch('all');assert.equal(c.values.principal,'30000');c.edit({principal:'12000'});
 c.switch('projection');assert.equal(c.values.principal,'0');c.edit({principal:'4000'});
 c.switch('normal');assert.equal(c.values.principal,'45678');c.switch('all');assert.equal(c.values.principal,'12000');c.switch('projection');assert.equal(c.values.principal,'4000');
});
test('Student unknown solvers retain known inputs without borrowing an original-loan amount',()=>{
 const c=context('student-loan');c.edit({principal:'45678'});c.switch('solve-payment');assert.equal(c.values.principal,'30000');
 c.edit({principal:'27000',rate:'3',years:'8'});c.switch('solve-rate');assert.equal(c.values.principal,'27000');assert.equal(c.values.years,'8');assert.equal(c.values.rate,undefined);
 c.switch('solve-principal');assert.equal(c.values.rate,'3');assert.equal(c.values.principal,undefined);c.switch('solve-term');assert.equal(c.values.principal,'27000');assert.equal(c.values.rate,'3');
});
test('Business margin drafts are retained without mixing trading collateral or markup rates',()=>{
 const c=context('margin');c.edit({cost:'240',margin:'40'});c.switch('cost');assert.equal(c.values.margin,'40');c.edit({revenue:'400'});
 c.switch('margin');assert.equal(c.values.cost,'240');assert.equal(c.values.revenue,'400');
 c.switch('markup');assert.notEqual(c.values.cost,'240');c.edit({cost:'80',markup:'25'});
 c.switch('stock');c.edit({price:'75'});c.switch('currency');c.edit({rate:'1.2'});c.switch('revenue');assert.equal(c.values.cost,'240');assert.equal(c.values.margin,'40');
 c.switch('markup');assert.equal(c.values.cost,'80');c.switch('stock');assert.equal(c.values.price,'75');
});
test('Returning from each commission solver leaves its unknown empty even when an older draft exists',()=>{
 for(const unknown of ['commission','sales','rate']){
  const c=context('commission');c.edit({sales:'20000',rate:'10',commission:'2000'});c.switch(unknown);const known={...c.values};c.switch('any-two');
  assert.equal(c.values[unknown],'');for(const [key,value] of Object.entries(known))assert.equal(c.values[key],value);
  assert.equal(Object.values(c.values).filter(v=>v!=='').length,2);
  assert.ok(runCalculation('commission','any-two',c.values).metrics.every(m=>Number.isFinite(m.value)));
 }
});
test('Commission isolates tiered quantities and retains blank and zero values for the simple form',()=>{
 const c=context('commission');c.edit({sales:'0',rate:'5',commission:''});c.switch('tiered');c.edit({sales:'45',tier_unit:'Amount per item'});c.switch('any-two');
 assert.deepEqual({...c.values},{sales:'0',rate:'5',commission:''});c.switch('tiered');assert.equal(c.values.sales,'45');assert.equal(c.values.tier_unit,'Amount per item');
});
test('Commission unknown stays blank through a tiered detour, including direct legacy solver entry',()=>{
 for(const unknown of ['commission','sales','rate'])for(const populatedOldDraft of [false,true]){
  const c=context('commission',populatedOldDraft?undefined:unknown);
  if(populatedOldDraft){c.edit({sales:'20000',rate:'10',commission:'2000'});c.switch(unknown);}
  c.switch('tiered');c.edit({sales:'45',tier_unit:'Amount per item'});c.switch('any-two');
  assert.equal(c.values[unknown],'');assert.equal(Object.values(c.values).filter(v=>v!=='').length,2);
  assert.ok(runCalculation('commission','any-two',c.values).metrics.every(m=>Number.isFinite(m.value)));
 }
});
test('Hidden invalid optional drafts do not block another mode and cannot become extra fields in its share inputs',()=>{
 const c=context('student-loan','extra');c.edit({extra_monthly:'-99'});c.switch('normal');assert.equal(c.values.extra_monthly,undefined);assert.ok(runCalculation('student-loan','normal',c.values).metrics.every(m=>Number.isFinite(m.value)));
 c.switch('extra');assert.equal(c.values.extra_monthly,'-99');
});
test('Shared-input hydration can start clean drafts and unrelated calculators retain their previous reset behavior',()=>{
 const c=context('mortgage-payoff');c.edit({principal:'280000'});c.switch('remaining-normal');assert.equal(c.values.principal,'280000');c.switch('known-normal');assert.equal(c.values.principal,'100000');c.switch('remaining-extra');assert.equal(c.values.principal,'280000');
 const fresh=context('savings','goal-time');fresh.edit({principal:'15000'});fresh.switch('accumulation');assert.equal(fresh.values.principal,'15000');assert.equal(fresh.values.years,'10');
 const other=context('investment');other.edit({principal:'12345'});other.switch('return');assert.equal(other.values.principal,'10000');
});
