import {test} from 'node:test';import assert from 'node:assert/strict';
import data from '../src/lib/guide-check-data.json';import expected from './fixtures/guide-check-expected.json';import {guideChecks} from '../src/lib/guide-checks';
import {calculators,runCalculation} from '../src/lib/calculators';import {sharedInputs} from '../src/lib/sharing';
const near=(actual:number,wanted:string)=>assert.ok(Math.abs(actual-Number(wanted))<=1e-6,`${actual} differs from independent ${wanted}`);
const value=(r:ReturnType<typeof runCalculation>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
test('All27guide scenarios match independent60-digit Decimal payoff and amortization fixtures',()=>{
 assert.deepEqual([data.debt.length,data.biweekly.length,data.points.length],[10,5,12]);
 for(const [i,r] of data.debt.entries()){const e=expected.debt[i];assert.equal(r.months,e.months);assert.equal(r.firstMonth,e.firstMonth);near(r.interest,e.interest);near(r.paid,e.paid);const now=runCalculation('debt-payoff',r.strategy,r.values);near(value(now,'Total interest'),e.interest);assert.equal(value(now,'Months until debt-free'),e.months);}
 for(const [i,r] of data.biweekly.entries()){const e=expected.biweekly[i];for(const k of ['monthly','half','matchedPayment','annualBudget','standardInterest','biweeklyInterest','matchedInterest','biweeklyYears','matchedYears'] as const)near(r[k],e[k]);const now=runCalculation('biweekly-mortgage','biweekly',r.values);near(value(now,'Biweekly total interest'),e.biweeklyInterest);near(value(now,'Matched-budget monthly total interest'),e.matchedInterest);}
 for(const [i,r] of data.points.entries()){const e=expected.points[i];for(const k of ['upfront','cashSaving','balanceAdvantage','netSaving','costBreak','cashBreak'] as const)near(r[k],e[k]);near(value(runCalculation('discount-points','compare',r.values),'Net borrowing-cost savings at horizon (B vs A)'),e.netSaving);}
});
test('All27reproduction links preserve exact inputs and calculations rather than introducing new URLs',()=>{
 for(const [name,rows,id,mid] of [['debt',data.debt,'debt-payoff',''],['biweekly',data.biweekly,'biweekly-mortgage','biweekly'],['points',data.points,'discount-points','compare']] as const){const c=calculators.find(c=>c.id===id)!;for(const [i,row] of rows.entries()){const u=new URL(guideChecks[name].rows[i].href,'https://www.calculatorfree.io'),restore=sharedInputs(c,'',u.hash)!;assert.equal(u.pathname,'/'+id+'-calculator');assert.deepEqual(restore.values,row.values);assert.equal(restore.mode.id,mid||data.debt[i].strategy);assert.ok(runCalculation(c.id,restore.mode.id,restore.values).metrics.length);}}
});
test('Controlled comparisons retain budget, zero-rate control, signed cost reversals and proportional chart axes',()=>{
 const at400=data.debt.filter(r=>r.budget===400);assert.equal(at400[0].firstMonth,6);assert.equal(at400[1].firstMonth,22);assert.ok(at400[0].interest>at400[1].interest);assert.ok(at400[0].months>at400[1].months);
 const zero=data.biweekly.find(r=>r.rate===0)!;assert.deepEqual([zero.standardInterest,zero.biweeklyInterest,zero.matchedInterest],[0,0,0]);
 const at36=data.points.filter(r=>r.hold===36);assert.ok(at36[0].netSaving>0&&at36[1].netSaving<0);assert.deepEqual(at36.map(r=>r.costBreak),[32,40]);assert.deepEqual(at36.map(r=>r.cashBreak),[41,51]);
 for(const check of Object.values(guideChecks)){const x=check.figure.x.map(s=>Number(s.replace(/[$%]/g,'')));const steps=x.slice(1).map((n,i)=>n-x[i]);assert.ok(steps.every(n=>n===steps[0]),'Equally-spaced chart positions require equally-spaced x values');assert.equal(check.rows.length,check.figure.series.reduce((n,s)=>n+s.values.length,0)/(check===guideChecks.biweekly?3:1));}
});
