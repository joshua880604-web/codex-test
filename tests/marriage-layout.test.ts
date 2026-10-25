import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators } from '../src/lib/calculators/index';
import { marriageFieldSection, marriageSections } from '../src/lib/marriage-layout';
const fields=calculators.find(c=>c.id==='marriage-tax')!.modes[0].fields;
test('Marriage layout keeps all 77 inputs in complete partner pairs',()=>{
 assert.equal(fields.length,77);
 const rendered=['year','filing1','filing2'];
 for(const f of fields.filter(f=>!f.key.startsWith('p2_')&&!['year','filing1','filing2'].includes(f.key))){
  const partner=fields.find(p=>p.key==='p2_'+f.key);assert.ok(partner,f.key);
  assert.equal(marriageFieldSection(f),marriageFieldSection(partner));
  assert.ok(marriageSections.some(s=>s.id===marriageFieldSection(f)));
  rendered.push(f.key,partner.key);
 }
 assert.equal(new Set(rendered).size,77);
 assert.deepEqual([...rendered].sort(),fields.map(f=>f.key).sort());
});
test('Essential inputs for both partners remain in the basic group',()=>{
 for(const key of ['year','filing1','filing2','wages','p2_wages','children','p2_children','dependents','p2_dependents'])assert.equal(marriageFieldSection(fields.find(f=>f.key===key)!),'basic');
});
