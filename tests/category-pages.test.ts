import {test} from 'node:test';import assert from 'node:assert/strict';
import {categoryPages} from '../src/lib/category-pages';
import {calculatorCategories,categoryHref} from '../src/lib/calculator-categories';
import {calculators} from '../src/lib/catalog';
import glossary from '../src/lib/glossary-data.json';
import {categoryPageSchema,sitemapEntries} from '../src/lib/seo';
const config={origin:'https://finance.example',indexable:true};
test('Three category directories have unique nonconflicting paths and reuse the existing housing URL',()=>{
 assert.equal(categoryPages.length,3);assert.equal(new Set(categoryPages.map(p=>p.path)).size,3);
 for(const p of categoryPages){assert.equal(categoryHref(p.id),p.path);assert.ok(p.guides.length>=3&&p.differences.length>=3&&p.questions.length>=3);for(const [slug] of p.concepts)assert.ok(glossary.some(t=>t.slug===slug),slug);if(p.id==='mortgage-housing')assert.equal(p.path,'/real-estate-calculator.html');else assert.ok(!calculators.some(c=>c.local_route===p.path));}
});
test('Category collection schema covers only real tools in visible scenario order, once each',()=>{
 for(const p of categoryPages){const schema=categoryPageSchema(p,config),list=schema['@graph'].find(x=>x['@type']==='ItemList') as any;const group=calculatorCategories.find(g=>g.id===p.id)!;const ids=group.sections!.flatMap(s=>s.tools);assert.equal(list.numberOfItems,ids.length);assert.deepEqual(list.itemListElement.map((x:any)=>x.url),ids.map(id=>'https://finance.example'+calculators.find(c=>c.id===id)!.local_route));assert.equal(new Set(list.itemListElement.map((x:any)=>x.url)).size,ids.length);assert.equal(sitemapEntries(config).filter(x=>x.url==='https://finance.example'+p.path).length,1);}
});
