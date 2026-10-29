import test from 'node:test';import assert from 'node:assert/strict';
import fixtures from './fixtures/debt-strategies.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {debtSchedule,parseDebts} from '../src/lib/debt-repayment';
import {runClientCalculation} from '../src/lib/calculate-client';
import {resultTrend} from '../src/lib/result-trend';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {glossaryTerm} from '../src/lib/glossary';
import {editorialGuides} from '../src/lib/editorial-guides';
const tool=(s:string)=>calculators.find(c=>c.id==='debt-'+s)!;
const run=(s:string,changes:Record<string,string>={})=>{const c=tool(s),v={...defaults(c.modes[0]),...changes};return {v,r:runCalculation(c.id,s,v)};};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`);
for(const f of fixtures)test('Decimal60 debt '+f.strategy+'/'+f.case,()=>{
 const {r,v}=run(f.strategy,f.values);
 for(const[label,n]of Object.entries(f.expected))close(r.metrics.find(m=>m.label===label)!.value,n);
 assert.equal(r.rows!.length,f.rows.length);
 r.rows!.forEach((row,i)=>row.forEach((value,j)=>close(Number(value),f.rows[i][j])));
 for(const expected of f.milestones){const row=r.additionalTables![0].rows.find(row=>row[0]===expected.name)!;assert.ok(row);assert.equal(row[3],expected.month);close(Number(row[4]),expected.interest);}
 const paid=r.rows!.reduce((sum,row)=>sum+Number(row[1]),0);close(paid,r.metrics.find(m=>m.label==='Total paid')!.value);
 const trend=resultTrend('debt-'+f.strategy,f.strategy,v,r);
 if(f.rows.length){assert.ok(trend);close(trend.points.at(-1)!.balance,0);}else assert.equal(trend,null);
 const legacy=debtSchedule(parseDebts(v.debts).filter(d=>d.balance>0),Number(v.budget),v.rollover==='Yes',0,0,Number(v.once),Number(v.once_month),f.strategy as 'snowball'|'avalanche');assert.deepEqual(r.rows,legacy.rows);assert.deepEqual(r.metrics.slice(0,3),legacy.metrics);
});
test('Targets and actual first clearance remain separate',()=>{
 const {r}=run('avalanche',{debts:'High,1000,50,24\nSmall,100,100,0',budget:'250'});
 assert.equal(r.metrics.find(m=>m.label==='First target for extra payment')!.displayValue,'High');assert.equal(r.metrics.find(m=>m.label==='First debt cleared in month')!.value,1);assert.equal(r.additionalTables![0].rows[0][0],'Small');
});
test('Standalone debt parser rejects incomplete, duplicate, nonfinite or out-of-scope lists',()=>{
 for(const debts of ['', 'A,100,10,','A,100,10,0,extra','A,100,10,0\na,200,20,0','A,NaN,10,0','A,100,-1,0','A,100,10,1001','A,.001,0,0',Array.from({length:21},(_,i)=>`Debt ${i},100,10,0`).join('\n')])assert.throws(()=>run('snowball',{debts}));
 for(const change of [{budget:'249'},{budget:'-1'},{once_month:'1.5'},{once_month:'1201'},{once:'-1'}] as Record<string,string>[])assert.throws(()=>run('avalanche',change));
 assert.throws(()=>run('snowball',{debts:'A,1201,1,0',budget:'1'}),/1,200/);
});
test('A one-time payment after repayment is unused and final payments never overpay',()=>{
 for(const s of ['snowball','avalanche']){const a=run(s).r,b=run(s,{once:'100000',once_month:'1200'}).r;assert.deepEqual(a.metrics,b.metrics);assert.deepEqual(a.rows,b.rows);assert.ok(a.rows!.every(row=>Number(row[1])<=400+.000001));assert.ok(a.rows!.at(-1)!.slice(3).every(balance=>balance===0));}
});
test('Same starting budget comparison preserves rollover scope and both real methods',()=>{
 for(const s of ['snowball','avalanche']){const {r}=run(s,{rollover:'No'});assert.ok(r.additionalTables![1].note!.includes('future budgets can differ'));assert.equal(r.additionalTables![1].rows.length,2);assert.deepEqual(new Set(r.additionalTables![1].rows.map(row=>row[0])),new Set(['Snowball','Avalanche']));}
});
test('Lazy model, restored share inputs and counterpart presets preserve the same debt list',async()=>{
 for(const s of ['snowball','avalanche']){const {v,r}=run(s,{once:'100',once_month:'2'}),c=tool(s);assert.deepEqual(await runClientCalculation(c.id,c.category,s,v),r);const u=new URL(calculationLink('https://www.calculatorfree.io','/'+c.id+'-calculator',c.modes[0],v,true));assert.deepEqual(runCalculation(c.id,s,sharedInputs(c,u.search,u.hash)!.values),r);}
});
test('Both calculators have distinct execution guides, definitions and comparison ownership',()=>{
 for(const s of ['snowball','avalanche']){const id='debt-'+s;assert.equal(tool(s).modes.length,1);assert.equal(guides[id].questions.length,8);assert.equal(guides[id].examples.length,2);assert.ok(glossaryTerm(id));assert.ok(editorialGuides.some(g=>g.path==='/guides/how-to-calculate-debt-'+s+'/'));assert.ok(relatedCalculatorIds[id].includes('debt-payoff'));}
 assert.equal(calculators.find(c=>c.id==='debt-payoff')!.modes.length,2);
});
