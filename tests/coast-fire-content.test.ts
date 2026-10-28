import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/lib/coast-fire-guide-data.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {coastFireGuide,editorialGuides} from '../src/lib/editorial-guides';
import {glossaryTerm,glossaryForCalculator} from '../src/lib/glossary';
const c=calculators.find(c=>c.id==='coast-fire')!,m=c.modes[0];
const number=(changes:Record<string,number>)=>runCalculation(c.id,m.id,{...defaults(m),...Object.fromEntries(Object.entries(changes).map(([k,v])=>[k,String(v)]))}).metrics.find(m=>m.label==='Coast FIRE number today')!.value;
test('Guide age, return, retirement-date and withdrawal figures reconcile with independent 60-digit examples',()=>{
 for(const row of data.ageRows)assert.ok(Math.abs(number({age:row.age})-row.threshold)<.005);
 for(const row of data.returnRows)assert.ok(Math.abs(number({return:row.nominal})-row.threshold)<.005);
 for(const row of data.retireRows)assert.ok(Math.abs(number({retire:row.retire})-row.threshold)<.005);
 assert.ok(Math.abs(number({withdrawal:3.5})-data.withdrawal35)<.005);
});
test('Coast guide and definition connect to one tool while retaining distinct information purposes',()=>{
 const term=glossaryTerm('coast-fire')!;assert.ok(term);
 assert.equal(editorialGuides.filter(g=>g.path===coastFireGuide.path).length,1);
 assert.ok(coastFireGuide.calculatorIds.includes(c.id));assert.ok(glossaryForCalculator(c.id).includes(term));
 assert.equal(term.guides![0].path,coastFireGuide.path);assert.ok(term.aliases.includes('CoastFIRE'));
 for(const t of ['real-rate-of-return','withdrawal-rate'])assert.ok(glossaryTerm(t)!.related.includes('coast-fire'));
 assert.ok(!term.sources.some(s=>s.url.includes('semrush')));
});
