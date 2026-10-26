import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../src/lib/catalog';
import {calculatorCategories,calculatorCategory,categoryNavigation,sidebarTools} from '../src/lib/calculator-categories';

test('Every existing catalog entry has exactly one primary display category',()=>{
 const ids=calculatorCategories.flatMap(group=>group.tools);
 assert.equal(new Set(ids).size,ids.length,'no duplicate primary ownership');
 assert.deepEqual([...ids].sort(),calculators.map(tool=>tool.id).sort(),'no omitted or invented tools');
 for(const tool of calculators)assert.ok(calculatorCategory(tool.id));
});
test('Business and personal-finance tools are no longer mixed with general utilities',()=>{
 for(const id of ['business-loan','margin','markup','break-even','depreciation'])assert.equal(calculatorCategory(id)?.id,'business-finance');
 for(const id of ['budget','currency','emergency-fund'])assert.equal(calculatorCategory(id)?.id,'saving-investing');
 for(const id of ['percentage','scientific','date','unit-converter','tip-bill-split'])assert.equal(calculatorCategory(id)?.id,'everyday');
 for(const id of ['pmi','biweekly-mortgage','discount-points'])assert.equal(calculatorCategory(id)?.id,'mortgage-housing');
});
test('Scenario sections cover every functional tool in their category exactly once',()=>{
 for(const group of calculatorCategories.filter(group=>group.sections)){
  const assigned=group.sections!.flatMap(section=>section.tools);
  assert.deepEqual([...assigned].sort(),group.tools.filter(id=>id!=='real-estate').sort());
  assert.equal(new Set(assigned).size,assigned.length);
 }
});
test('Renamed display labels retain all existing category fragment targets and legacy aliases',()=>{
 const old=['mortgage-housing','mortgage-and-real-estate','loans-debt','auto','other','saving-investing','investment','retirement','tax-salary','tax-and-salary','everyday','everyday-tools'];
 const all=calculatorCategories.flatMap(group=>[group.id,...group.aliases]);
 for(const id of old)assert.ok(all.includes(id),id);
 assert.equal(new Set(all).size,all.length);
 assert.equal(categoryNavigation.length,7);
 for(const link of categoryNavigation)assert.equal(link.href,'/financial-calculator.html#'+link.id);
});
test('Contextual sidebars link valid related tools without self links, directory loops or long mixed lists',()=>{
 for(const tool of calculators){const side=sidebarTools(tool.id);assert.equal(side.title,calculatorCategory(tool.id)!.title);assert.ok(side.ids.length>0&&side.ids.length<=8);assert.equal(new Set(side.ids).size,side.ids.length);assert.ok(!side.ids.includes(tool.id));assert.ok(!side.ids.includes('real-estate'));for(const id of side.ids)assert.ok(calculators.some(tool=>tool.id===id));}
 assert.ok(sidebarTools('margin').ids.includes('markup'));assert.ok(sidebarTools('pmi').ids.includes('mortgage'));assert.ok(sidebarTools('loan').ids.includes('apr'));assert.equal(sidebarTools('margin').ids.includes('mortgage'),false);
});
