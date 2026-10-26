import {readFile,writeFile,readdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
// Use the compiler shipped with the lockfile's Next version. Transform the final
// export too: precompiled framework dependencies can bypass application targets.
const {transformSync}=require('next/dist/compiled/babel/core');
const presetEnv=require('next/dist/compiled/babel/preset-env');
const {parse}=require('next/dist/compiled/acorn');
export async function filesUnder(root) {
  const out=[];
  for(const item of await readdir(root,{withFileTypes:true})) {
    const path=join(root,item.name);
    if(item.isDirectory())out.push(...await filesUnder(path));else out.push(path);
  }
  return out;
}
export function compatibleJavaScript(source,filename='browser.js') {
  const result=transformSync(source,{
    filename,configFile:false,babelrc:false,sourceMaps:false,compact:true,comments:true,
    presets:[[presetEnv,{targets:{safari:'14',ios:'14.0'},bugfixes:true,modules:false,
      // Safari14 supports this operator, but lowering it gives the export a
      // strict ES2020 syntax ceiling that can be checked on every build.
      include:['transform-logical-assignment-operators']}]],
  });
  if(!result?.code)throw new Error('Compatibility transform produced no code: '+filename);
  parse(result.code,{ecmaVersion:2020,sourceType:'script'});
  return result.code+'\n';
}
export async function prepareBrowserCompatibility(root='out') {
  const files=await filesUnder(root);
  const boot=await readFile(new URL('../public/browser-compat.js',import.meta.url),'utf8');
  parse(boot,{ecmaVersion:5});
  if(/<\/script/i.test(boot))throw new Error('Unsafe compatibility bootstrap');
  const tag='<script data-browser-compat="safari14-v1">'+boot+'</script>';
  let scripts=0,documents=0;
  for(const path of files) {
    if(extname(path)==='.js'&&path.includes(join('_next','static'))) {
      const source=await readFile(path,'utf8');
      await writeFile(path,compatibleJavaScript(source,path));scripts++;
    } else if(extname(path)==='.html') {
      const html=await readFile(path,'utf8');
      if(html.includes('data-browser-compat='))throw new Error('Duplicate compatibility pass: '+path);
      if(!html.includes('<head>'))throw new Error('Missing document head: '+path);
      await writeFile(path,html.replace('<head>','<head>'+tag));documents++;
    }
  }
  console.log(`Prepared iOS14-compatible startup: ${scripts} scripts, ${documents} HTML documents.`);
  return {scripts,documents};
}
