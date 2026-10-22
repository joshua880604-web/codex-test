import {readdir,readFile,writeFile} from 'node:fs/promises';
import {extname,join} from 'node:path';

// Check shipped documents AND lazy bundles/RSC payloads, not only visible links.
const banned=/calculator(?:\.|\\u002e|\\x2e|%2e|&#(?:0*46|x0*2e);)net/i;
const textExtensions=new Set(['.html','.js','.mjs','.json','.txt','.xml','.css','.map','.svg']);
const violations=[];let files=0;
async function scan(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())await scan(path);
  else if(textExtensions.has(extname(entry.name).toLowerCase())){
   files++;if(banned.test(await readFile(path,'utf8')))violations.push(path);
  }
 }
}
await scan('out');
await writeFile('docs/financial-clone/evidence/public-brand-scan.json',JSON.stringify({tested_at:new Date().toISOString(),passed:violations.length===0,scanned_text_files:files,scope:'Complete public export including HTML, JavaScript, JSON, RSC text, XML, CSS, maps and SVG',violations},null,2)+'\n');
if(violations.length)throw new Error('Disallowed reference domain in public export: '+violations.join(', '));
console.log(`Public export domain check passed (${files} text assets).`);
