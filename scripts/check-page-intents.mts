import {navigationHref} from '../src/lib/navigation';
import {calculatorPresetHref} from '../src/lib/preset-links';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculators,routeFor} from '../src/lib/calculators/index.ts';
import {keywordTitles,searchTasks} from '../src/lib/keyword-targets.ts';
import {relatedCalculatorIds} from '../src/lib/guides.ts';
import candidates from '../src/lib/page-intents.json';
const titles=new Set(),keywords=new Set(),checks=[];
for(const calc of calculators.filter(c=>!c.directory)){
 const route=routeFor(calc.id),html=fs.readFileSync('out'+route,'utf8');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 assert.ok(title&&!titles.has(title),calc.id+' unique title');titles.add(title);
 assert.ok(relatedCalculatorIds[calc.id]?.length,calc.id+' related links');
 for(const task of searchTasks[calc.id]){
  assert.ok(calc.modes.some(m=>m.id===task.mode),calc.id+task.mode);
  assert.ok(!keywords.has(task.keyword.toLowerCase()),task.keyword);keywords.add(task.keyword.toLowerCase());
  // Visible content, not JSON-LD or a meta keywords tag, owns the phrase.
  const headings=[...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gs)].map(m=>m[1].replace(/<[^>]+>/g,''));
  assert.ok(headings.includes(task.keyword.replaceAll('&','&amp;')),calc.id+' visible intent heading');
  const href=calculatorPresetHref(route,task.mode,task.values).replaceAll('&','&amp;');
  assert.ok(html.includes('href="'+href+'"'),calc.id+' fragment preset link');
  for(const alias of task.aliases??[]){assert.ok(html.includes(alias.replaceAll('&','&amp;')),calc.id+' visible alias');assert.ok(!keywords.has(alias.toLowerCase()),alias);keywords.add(alias.toLowerCase());}
 }
 for(const id of relatedCalculatorIds[calc.id])assert.ok(html.includes('href="'+navigationHref(routeFor(id))+'"'),calc.id+' contextual link '+id);
 assert.ok(html.includes('id="worked-examples"')&&html.includes('id="scope-assumptions"'),calc.id+' citation anchors');
 checks.push({id:calc.id,route,title:keywordTitles[calc.id],keywords:searchTasks[calc.id].map(t=>t.keyword),related:relatedCalculatorIds[calc.id]});
}
const report={checked_at:new Date().toISOString(),passed:true,tools:checks.length,search_tasks:keywords.size,editorial_candidates:candidates.length,keyword_volume_claims:'See keyword-map.json and research/us-keywords-2026-10-21.json for user-provided evidence; remaining editorial phrases have no verified volume' ,indexing_or_ai_citations:'not measured',checks};
fs.writeFileSync('docs/financial-clone/evidence/page-intents-qa.json',JSON.stringify(report,null,2)+'\n');
console.log({tools:checks.length,search_tasks:keywords.size,passed:true});
