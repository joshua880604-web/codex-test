import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {filesUnder} from './prepare-browser-compat.mjs';
const require=createRequire(import.meta.url),{parse}=require('next/dist/compiled/acorn');
const files=await filesUnder('out'),scripts=[],documents=[];
for(const file of files) {
 if(file.endsWith('.js')) {
  const source=await fs.readFile(file,'utf8');parse(source,{ecmaVersion:2020,sourceType:'script'});scripts.push(file);
 } else if(file.endsWith('.html')) {
  const html=await fs.readFile(file,'utf8'),tags=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(tags.length&&tags[0][1].includes('data-browser-compat="safari14-v1"'),file+' early startup');
  assert.equal(tags.filter(t=>t[1].includes('data-browser-compat=')).length,1,file+' single startup');
  for(const tag of tags) {
   const src=tag[1].match(/\bsrc="([^"]+)"/)?.[1];
   if(src?.startsWith('/_next/static/'))assert.ok(src.includes('?dpl=safari14-v1'),file+' versioned '+src);
   if(!src&&!tag[1].includes('application/ld+json'))parse(tag[2],{ecmaVersion:2020});
  }
  documents.push(file);
 }
}
const report={passed:true,tested_at:new Date().toISOString(),javascript_files:scripts.length,html_documents:documents.length,checks:['All emitted JavaScript and executable inline scripts parse with an ES2020 ceiling','ES5 compatibility bootstrap is the first script in every HTML document','Framework asset URLs carry a new deployment cache key'],limits:'Syntax and API compatibility checks are not a native iOS14.4.2 device test.'};
await fs.writeFile('docs/financial-clone/evidence/browser-compat-build-qa.json',JSON.stringify(report,null,2)+'\n');console.log(report);
