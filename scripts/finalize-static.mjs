import {readdir,rm,rename,stat} from 'node:fs/promises';
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
