import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const adsensePublisher='ca-pub-5145325695425659';

// Match complete script elements so serialized page data cannot stand in for a loader.
export function validateAdSense(html,label='HTML document'){
 const loaders=[];
 for(const script of html.matchAll(/<script\b([^>]*?)>[\s\S]*?<\/script\s*>/gi)){
  const attrs=new Map();
  for(const attr of script[1].matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g))attrs.set(attr[1].toLowerCase(),attr[2]??attr[3]??attr[4]??'');
  if(!attrs.has('src'))continue;
  let url;try{url=new URL(attrs.get('src').replace(/&amp;/gi,'&'),'https://www.calculatorfree.io');}catch{continue;}
  if(url.pathname==='/pagead/js/adsbygoogle.js')loaders.push({url,attrs,index:script.index});
 }
 assert.equal(loaders.length,1,`${label}: expected exactly one AdSense loader; found ${loaders.length}`);
 const {url,attrs,index}=loaders[0];
 assert.equal(url.origin,'https://pagead2.googlesyndication.com',`${label}: incorrect AdSense source`);
 assert.equal(url.searchParams.get('client'),adsensePublisher,`${label}: incorrect AdSense publisher`);
 assert.ok(attrs.has('async'),`${label}: AdSense must load asynchronously`);
 assert.equal(attrs.get('crossorigin'),'anonymous',`${label}: AdSense crossorigin must be anonymous`);
 const head=/<head\b[^>]*>/i.exec(html),end=html.search(/<\/head\s*>/i);
 assert.ok(head&&index>=head.index+head[0].length&&index<end,`${label}: AdSense loader must be in the document head`);
 return true;
}

export async function checkAdSenseBuild(root='out'){
 const files=[];
 async function collect(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const path=join(dir,entry.name);
   if(entry.isDirectory())await collect(path);
   else if(entry.isFile()&&/\.html$/i.test(entry.name))files.push(path);
  }
 }
 await collect(root);assert.ok(files.length,'AdSense check found no exported HTML pages');
 const violations=[];
 for(const file of files){try{validateAdSense(await readFile(file,'utf8'),relative(root,file));}catch(error){violations.push(error.message);}}
 assert.equal(violations.length,0,'AdSense coverage failed:\n'+violations.join('\n'));
 return {passed:true,htmlPages:files.length,publisher:adsensePublisher};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)console.log(await checkAdSenseBuild(process.argv[2]??'out'));
