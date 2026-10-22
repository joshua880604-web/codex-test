import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {retirementStory,retirementScenarios} from '../src/lib/retirement-story';
import {employee401kLimit} from '../src/lib/retirement-limits';
import type {Values} from '../src/lib/types';
const mode=calculators.find(c=>c.id==='401k')!.modes.find(m=>m.id==='projection')!;
function plan(overrides:Values={}){const values={...defaults(mode),...overrides};return {values,result:runCalculation('401k','projection',values)};}
const close=(a:number,b:number,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('Story reconciles opening savings, employee, employer and investment growth without double counting',()=>{
 const p=plan({age:'65',retire:'66',life:'67',salary:'12000',balance:'1000',contribution:'10',match:'50',match_limit:'6',return:'10',inflation:'0'}),s=retirementStory(p.values,p.result)!;
 assert.deepEqual(s.parts.map(p=>p.value),[1000,1200,360,100]);close(s.balance,2660);close(s.parts.reduce((n,p)=>n+p.value,0),s.balance);
 assert.equal(s.monthly,p.result.metrics.find(m=>m.label==='Initial monthly retirement withdrawal')!.value);
});
test('The optional 4 percent illustration is $5,566.67 for $1.67m and does not replace lifespan-based withdrawals',()=>{
 const p=plan({age:'67',retire:'67',life:'90',balance:'1670000',return:'0',inflation:'0'}),s=retirementStory(p.values,p.result)!;
 close(s.fourPercentMonthly,5566.666666666667);close(s.monthly,1670000/(23*12));assert.notEqual(s.monthly,s.fourPercentMonthly);close(s.fourPercentToday,s.fourPercentMonthly);
});
test('Today-dollar explanation and optional withdrawal use the entered inflation horizon',()=>{
 const p=plan({age:'35',retire:'65',life:'90',inflation:'3'}),s=retirementStory(p.values,p.result)!;
 close(s.todayMonthly,s.monthly/1.03**30);close(s.fourPercentToday,s.fourPercentMonthly/1.03**30);
 assert.ok(s.interpretation.includes('age 65'));assert.ok(s.interpretation.includes('age 90'));assert.ok(s.interpretation.includes('today’s purchasing power'));
 assert.ok(s.cardInterpretation.includes('age 65'));assert.ok(s.cardInterpretation.includes('age 90'));assert.ok(s.cardInterpretation.includes('today’s dollars'));
});
test('Investment losses keep their sign and zero balances avoid NaN or invented growth',()=>{
 const p=plan({age:'60',retire:'65',life:'80',salary:'0',balance:'100000',return:'-5',inflation:'0'}),s=retirementStory(p.values,p.result)!;
 assert.ok(s.parts[3].value<0);assert.equal(s.parts[3].label,'Projected investment loss');close(s.parts.reduce((n,p)=>n+p.value,0),s.balance);
 const z=plan({salary:'0',balance:'0'}),zero=retirementStory(z.values,z.result)!;assert.ok(zero.parts.every(p=>p.value===0));assert.equal(zero.monthly,0);assert.equal(zero.fourPercentMonthly,0);
 assert.equal(retirementStory(z.values,{metrics:[]}),null);
});
test('The extra-saving option adds $1,200 in its first year through the actual contribution-rate input',()=>{
 const p=plan(),s=retirementScenarios(p).find(s=>s.id==='save-more')!;assert.equal(s.disabledReason,undefined);assert.equal(s.values.contribution,'11.5');assert.equal(s.label,'Add $100/month now');
 const next=runCalculation('401k','projection',s.values);close(Number(next.rows![0][2])-Number(p.result.rows![0][2]),1200);assert.ok(s.detail.includes('Future contributions follow your salary'));
});
test('Savings scenarios respect age-based catch-up, salary and partial contribution room',()=>{
 for(const [age,cap] of [[49,24500],[50,32500],[60,35750],[64,32500]]){
  assert.equal(employee401kLimit(age),cap);
  const p=plan({age:String(age),retire:String(age+1),life:String(age+20),salary:'100000',contribution:String((cap-500)/1000)});
  const s=retirementScenarios(p)[0];assert.equal(s.disabledReason,undefined);assert.equal(s.label,'Use remaining contribution room');
  const next=runCalculation('401k','projection',s.values);close(Number(next.rows![0][2]),cap);close(Number(next.rows![0][2])-Number(p.result.rows![0][2]),500);
 }
 const salary=plan({salary:'1000',contribution:'50'}),s=retirementScenarios(salary)[0];assert.equal(s.values.contribution,'100');close(Number(runCalculation('401k','projection',s.values).rows![0][2]),1000);
});
test('Contribution choices explain unavailable salary, limit and saving-horizon cases',()=>{
 for(const p of [plan({salary:'0'}),plan({salary:'100000',contribution:'100'}),plan({age:'67',retire:'67',life:'90'})])assert.ok(retirementScenarios(p)[0].disabledReason);
});
test('Return and later-retirement choices change one assumption from the same immutable original plan',()=>{
 const p=plan(),before=JSON.stringify(p),choices=retirementScenarios(p),lower=choices[1],later=choices[2];
 assert.equal(lower.values.return,'5');assert.equal(lower.values.retire,'67');assert.equal(later.values.retire,'69');assert.equal(later.values.return,'6');assert.equal(later.label,'Retire at 69');assert.ok(later.detail.includes('withdrawal period becomes 21 years'));
 for(const s of choices){assert.ok(runCalculation('401k','projection',s.values).metrics.every(m=>Number.isFinite(m.value)));assert.deepEqual(Object.keys(p.values).filter(k=>p.values[k]!==s.values[k]),[s.id==='save-more'?'contribution':s.id==='lower-return'?'return':'retire']);}
 assert.equal(JSON.stringify(p),before);
});
test('Scenario boundaries keep return and retirement horizon within supported inputs',()=>{
 const p=plan({age:'67',retire:'67',life:'68',salary:'0',balance:'0',return:'-99',inflation:'0'}),s=retirementScenarios(p);assert.ok(s[1].disabledReason);assert.ok(s[2].disabledReason);
 const limit=plan({age:'20',retire:'120',life:'130',salary:'0',balance:'0'});assert.ok(retirementScenarios(limit)[2].disabledReason);
 const short=plan({retire:'67',life:'69'});assert.equal(retirementScenarios(short)[2].values.retire,'68');
});
