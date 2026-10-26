import {readdir,rm,rename,stat,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
// The application uses normal <a> document navigation, not Next Link/RSC prefetch.
// Preserve its public *.html URLs on static hosts, including Cloudflare Pages.
let count=0;
for(const name of await readdir('out')){
 if(!name.endsWith('.html.html'))continue;
 const target=join('out',name.slice(0,-5));
 try{if((await stat(target)).isDirectory())await rm(target,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}
 await rename(join('out',name),target);count++;
}
console.log(`Prepared ${count} static .html routes.`);
// Glossary uses directory URLs, independent of the established calculator URLs.
// No RSC navigation is used; canonical documents are served as index.html.
const glossary='out/glossary';
await mkdir(glossary,{recursive:true});
 for(const name of await readdir(glossary)){
  if(!name.endsWith('.html')||name==='index.html')continue;
  const folder=join(glossary,name.slice(0,-5));await mkdir(folder,{recursive:true});
  await rename(join(glossary,name),join(folder,'index.html'));
 }
await rename('out/glossary.html',join(glossary,'index.html'));
console.log('Prepared glossary directory documents.');
await import('./check-public-brand.mjs');
