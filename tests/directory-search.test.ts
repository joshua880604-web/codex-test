import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../src/lib/catalog';
import {directoryMatch,directoryTarget,directoryScore} from '../src/lib/directory';
const find=(q:string)=>{const tools=calculators.filter(c=>directoryMatch(c,q));return directoryTarget(tools,q)?.id;};
test('Exact names beat broader result matches without guessing from substrings',()=>{assert.equal(find('mortgage'),'mortgage');assert.equal(find('CAGR Calculator'),'cagr');assert.equal(find('  COMPOUND INTEREST  '),'compound-interest');assert.equal(find('investment'),'investment');assert.equal(find('tax'),undefined);});
test('Common exact aliases navigate to their intended tool',()=>{assert.equal(find('car payment'),'auto-loan');assert.equal(find('401(k)'),'401k');assert.equal(find('required minimum distribution'),'rmd');assert.equal(find('gross to net pay'),'take-home-paycheck');});
test('A sole match can navigate, empty or no-result searches do not',()=>{assert.equal(find('emergency fund'),'emergency-fund');assert.equal(find('no-match-xyz'),undefined);assert.equal(find(''),undefined);assert.equal(find('calculator'),undefined);});
test('Competing exact aliases or titles stay a choice, never auto-pick first',()=>{const c=calculators.find(c=>c.id==='loan')!;assert.equal(directoryTarget([c,{...c,id:'another-loan'}],'loan'),undefined);});

test("Titles rank above incidental descriptions",()=>{const tax=calculators.find(c=>c.id==='income-tax')!,mortgage=calculators.find(c=>c.id==='mortgage')!;assert.ok(directoryScore(tax,'tax')<directoryScore(mortgage,'tax'));});
