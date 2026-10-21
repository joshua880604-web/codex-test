import fs from 'node:fs/promises';
import {guides} from '../src/lib/guides.ts';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
const base='http://127.0.0.1:3000';
try{
 const redirect=await page.request.get(base+'/',{maxRedirects:0});if(redirect.status()!==301||redirect.headers().location!=='/financial-calculator.html')throw new Error('Directory redirect failed');checks.push('Root 301 redirects to canonical financial directory');
 const robots=await page.request.get(base+'/robots.txt');if(!robots.ok()||!(await robots.text()).includes('User-Agent: *'))throw new Error('robots failed');
 for(const [id,guide] of Object.entries(guides)){
  const route=catalog.find(c=>c.id===id).local_route;
  for(const example of guide.examples){
   await page.goto(base+route);
   const section=page.locator('.worked-example').filter({has:page.getByRole('heading',{name:example.title,exact:true})});
   await section.getByRole('link',{name:'Try these inputs',exact:true}).click();
   for(const [key,value] of Object.entries(example.values)){
    const field=page.locator(`form [id$="-${key}"]`);await field.waitFor({state:'attached'});
    await page.waitForFunction(({selector,value})=>document.querySelector(selector)?.value===value,{selector:`form [id$="-${key}"]`,value:String(value)}).catch(async error=>{throw new Error(`${id}/${example.title}/${key}: expected ${value}, got ${await field.inputValue()}; ${error.message}`);});
   }
   await page.getByRole('button',{name:'Calculate',exact:true}).click();
   const metric=id==='marriage-tax'&&example.expected.label==='Marriage penalty / negative bonus'?page.locator('.metric.primary'):page.locator('.metric').filter({has:page.getByText(example.expected.label,{exact:true})});await metric.waitFor();
   const actual=Number((await metric.locator('strong').innerText()).replace(/[^0-9.+-]/g,''));
   const displayed=await metric.locator("strong").innerText();
   const tolerance=Math.max(example.expected.tolerance??.005,displayed.includes("$")?.005:.00005);
   if(Math.abs(actual-(id==='marriage-tax'&&example.expected.label==='Marriage penalty / negative bonus'?Math.abs(example.expected.value):example.expected.value))>tolerance)throw new Error(`${id}/${example.title}: ${actual}`);
   const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();if(schemas.length!==1||!JSON.parse(schemas[0])['@graph'].some(x=>x['@type']==='WebApplication'))throw new Error('Application schema missing');
   const robotsMeta=await page.locator('meta[name="robots"]').getAttribute('content');if(!robotsMeta.includes('noindex'))throw new Error('Unconfigured preview unexpectedly indexable');
   checks.push({id,example:example.title,result:'passed'});
  }
 }
 await page.goto(base+'/methodology.html');await page.getByRole('heading',{name:'Calculation methodology and sources',exact:true,level:1}).waitFor();checks.push('Methodology page and review status available');
 for(const route of ['/vat-calculator.html','/mortgage-calculator.html','/methodology.html']){
  await page.goto(base+route);for(const width of [768,390]){await page.setViewportSize({width,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw new Error('Overflow '+route);checks.push({route,width,result:'no overflow'});}
 }
 if(errors.length)throw new Error(errors.join('\n'));
 await fs.writeFile('docs/financial-clone/evidence/browser-seo-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors,live_indexing_or_ai_citations:'not measured'},null,2));
 console.log(JSON.stringify({passed:true,checks:checks.length,worked_examples:Object.values(guides).reduce((n,g)=>n+g.examples.length,0)}));
}finally{await browser.close();}
