import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../src/lib/catalog';
import {directoryMatch,directoryTarget,directoryScore,directorySearch} from '../src/lib/directory';
const find=(q:string)=>{const tools=calculators.filter(c=>directoryMatch(c,q));return directoryTarget(tools,q)?.id;};
test('Exact names beat broader result matches without guessing from substrings',()=>{assert.equal(find('mortgage'),'mortgage');assert.equal(find('CAGR Calculator'),'cagr');assert.equal(find('  COMPOUND INTEREST  '),'compound-interest');assert.equal(find('investment'),'investment');assert.equal(find('tax'),undefined);});
test('Common exact aliases navigate to their intended tool',()=>{assert.equal(find('car payment'),'auto-loan');assert.equal(find('401(k)'),'401k');assert.equal(find('required minimum distribution'),'rmd');assert.equal(find('gross to net pay'),'take-home-paycheck');});
test('A sole match can navigate, empty or no-result searches do not',()=>{assert.equal(find('emergency fund'),'emergency-fund');assert.equal(find('no-match-xyz'),undefined);assert.equal(find(''),undefined);assert.equal(find('calculator'),undefined);});
test('Competing exact aliases or titles stay a choice, never auto-pick first',()=>{const c=calculators.find(c=>c.id==='loan')!;assert.equal(directoryTarget([c,{...c,id:'another-loan'}],'loan'),undefined);});

test("Titles rank above incidental descriptions",()=>{const tax=calculators.find(c=>c.id==='income-tax')!,mortgage=calculators.find(c=>c.id==='mortgage')!;assert.ok(directoryScore(tax,'tax')<directoryScore(mortgage,'tax'));});

const search=(q:string)=>directorySearch(calculators,q);
test('Short name searches exclude tools that only mention the name in a use case',()=>{
 for(const q of ['401','401k','401(k)','401 k'])assert.deepEqual(search(q).map(x=>x.tool.id),['401k']);
 assert.equal(search('take home pay calculator after taxes and 401k')[0]?.tool.id,'take-home-paycheck');
 assert.deepEqual(search('financial calculator').map(x=>x.tool.id),['finance']);
 assert.deepEqual(search('irr').map(x=>x.tool.id),['irr']);
});
test('Suggestions use word prefixes, rank exact names first and deduplicate tools',()=>{
 const matches=search('loan');assert.equal(matches[0].tool.id,'loan');assert.ok(matches.length>1);
 assert.equal(search('compou int')[0]?.tool.id,'compound-interest');
 assert.equal(search('loan texas').length,0);
 assert.equal(new Set(search('interest').map(x=>x.tool.id)).size,search('interest').length);
});
test('Supported use cases preserve their actual mode and registered presets',()=>{
 for(const [q,id,mode] of [
  ['compound interest calculator with monthly contributions','compound-interest','growth'],
  ['savings calculator goal','savings','goal-contribution'],
  ['debt snowball calculator','debt-payoff','snowball'],
  ['debt payoff calculator snowball','debt-payoff','snowball'],
  ['irr calculator with dates','average-return','cashflows'],
  ['401k catch up contributions','401k','projection'],
 ]){const result=search(q)[0];assert.equal(result.tool.id,id);assert.equal(new URL(result.href,'https://example.test').searchParams.get('mode'),mode);}
 assert.equal(search('compound interest')[0].href,'/compound-interest-calculator.html');
});

test('Supported comparison ages and saved exchange direction stay in the target URL',()=>{
 for(const [query,id,values] of [
  ['social security calculator age 66 vs 70','social-security',{mode:'compare',age1:'66',age2:'70'}],
  ['social security calculator 62 vs 67','social-security',{mode:'compare',age1:'62',age2:'67'}],
  ['currency calculator euro to usd','currency',{mode:'snapshot',from:'EUR',to:'USD'}],
 ] as const){const result=search(query)[0];assert.equal(result.tool.id,id);const params=new URL(result.href,'https://example.test').searchParams;for(const [key,value] of Object.entries(values))assert.equal(params.get(key),value);}
 for(const query of ['currency calculator live euro to usd','social security calculator canada 66 vs 70'])assert.equal(search(query).length,0);
});

test('Search links retain explicit compounding and tax-year presets',()=>{
 for(const [q,key,value] of [['compound interest calculator daily','compound','Daily'],['compound interest calculator monthly','compound','Monthly'],['2026 tax calculator','year','2026'],['2025 tax calculator','year','2025']]){
  assert.equal(new URL(search(q)[0].href,'https://example.test').searchParams.get(key),value);
 }
});
