import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultTrend} from '../src/lib/result-trend';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
const calculator=calculators.find(c=>c.id==='coast-fire')!,mode=calculator.modes[0];
const values=(changes:Record<string,string>={})=>({...defaults(mode),...changes});
const run=(v:Record<string,string>)=>runCalculation('coast-fire','coast',v);
const couple=values({household:'Couple',balance:'100000',partner_balance:'50000',monthly:'600',partner_monthly:'400'});
test('Split household assets and investments reproduce the entire equivalent individual path',()=>{
 const individual=run(values()),combined=run(couple);
 assert.deepEqual(combined.metrics,individual.metrics);
 assert.deepEqual(combined.rows,individual.rows);
 assert.deepEqual(combined.additionalTables,individual.additionalTables);
 assert.match(combined.notes![0],/combined once/);
 assert.equal(resultTrend('coast-fire','coast',couple,combined)!.points[0].balance,150000);
});
test('Shared budget is not doubled and zero-growth household crossing is independently sized',()=>{
 const v=values({household:'Couple',age:'40',retire:'50',balance:'100000',partner_balance:'80000',monthly:'600',partner_monthly:'400',spending:'12000',return:'0',inflation:'0'});
 const r=run(v),metric=(label:string)=>r.metrics.find(m=>m.label===label)!;
 assert.equal(metric('Full FIRE portfolio target').value,300000);
 assert.equal(metric('New investments on modeled path').value,120000);
 assert.equal(metric('Time until Coast FIRE').displayValue,'At target retirement age');
 assert.equal(r.rows!.at(-1)![1],300000);
});
test('Returning to Individual ignores preserved or invalid inactive partner drafts',()=>{
 const individual=values({partner_balance:'NaN',partner_monthly:'-1000'});
 assert.deepEqual(run(individual),run(values()));
 const legacy=values();delete legacy.household;delete legacy.partner_balance;delete legacy.partner_monthly;
 assert.deepEqual(run(legacy),run(values()));
});
test('Active partner inputs reject blanks, negatives and nonfinite values',()=>{
 for(const key of ['partner_balance','partner_monthly'])for(const invalid of ['', '-1','NaN','Infinity'])assert.throws(()=>run({...couple,[key]:invalid}));
 assert.throws(()=>run({...couple,household:'Unknown'}));
});
test('Household share link restores both owners and yields the same projection',()=>{
 const link=new URL(calculationLink('https://www.calculatorfree.io','/coast-fire-calculator',mode,couple,true));
 const shared=sharedInputs(calculator,link.search,link.hash)!;
 assert.equal(shared.values.household,'Couple');assert.equal(shared.values.partner_balance,'50000');
 assert.deepEqual(run(shared.values),run(couple));
});
