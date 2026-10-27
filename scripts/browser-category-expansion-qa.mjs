import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3651';
const dir=process.env.QA_EVIDENCE_DIR??'/workspace/work/category-expansion-20261027';
const cases=[
 ['retirement','retirement-calculators',9,'Retirement Planning Calculators','retirement-calculator'],
 ['tax-salary','tax-income-calculators',7,'Tax & Income Calculators','tax-calculator'],
 ['business-finance','business-calculators',5,'Business Calculators','margin-calculator'],
 ['everyday','everyday-calculators',7,'Everyday Calculators','percentage-calculator'],
];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext();
await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.fulfill({body:'',contentType:'text/javascript'}));
const page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 for(const theme of ['default','dark-pro']){
  await page.goto(base+'/financial-calculator');
  await page.evaluate(t=>localStorage.setItem('calculatorfree.theme',t),theme);
  for(const width of [320,390,768,1440])for(const [id,path,count,heading] of cases){
   await page.setViewportSize({width,height:900});await page.goto(base+'/'+path,{waitUntil:'networkidle'});
   assert.equal(await page.locator('h1').innerText(),heading);
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.locator('.estate-list li a').count(),count);
   const links=await page.locator('.estate-list li a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
   assert.equal(new Set(links).size,count);
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/'+path);
   const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent())['@graph'];
   assert.equal(graph.find(x=>x['@type']==='ItemList').numberOfItems,count);
   assert.deepEqual(graph.find(x=>x['@type']==='ItemList').itemListElement.map(x=>new URL(x.url).pathname),links);
   assert.equal(await page.locator('script[src*="adsbygoogle.js"]').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.equal(await page.locator('#side-financial-heading a').getAttribute('href'),'/'+path);
   if(theme==='dark-pro')assert.equal(await page.locator('html').getAttribute('data-theme'),'dark-pro');
   for(const href of [...links,...await page.locator('#category-concepts li a').evaluateAll(as=>as.map(a=>a.getAttribute('href'))) ])assert.equal((await context.request.get(base+href)).status(),200);
   if(width===390||width===1440)await page.screenshot({path:dir+'/'+id+'-'+width+'-'+theme+'.png',fullPage:true});
   checks.push({id,width,theme,tools:count,canonical:true,schema:true,noOverflow:true,adsense:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 for(const [id,path,,,tool] of cases){
  await page.goto(base+'/'+tool,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.breadcrumb a').last().getAttribute('href'),'/'+path);
  await page.locator('.breadcrumb a').last().click();await page.waitForURL(base+'/'+path);
  await page.goto(base+'/financial-calculator',{waitUntil:'networkidle'});
  assert.equal(await page.locator(`#${id} >h3 >a`).getAttribute('href'),'/'+path);
  assert.equal(await page.locator(`#${id} >.category-overview`).getAttribute('href'),'/'+path);
  await page.locator('.mobile-menu >summary').click();
  await page.locator('#mobile-navigation a[href="/'+path+'"]').click();await page.waitForURL(base+'/'+path);
  checks.push({id,breadcrumb:true,homeLinks:true,mobileNavigation:true});
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 for(const [,path,count] of cases){const p=await nojs.newPage();await p.goto(base+'/'+path);assert.equal(await p.locator('.estate-list li a').count(),count);assert.equal(await p.locator('script[src*="adsbygoogle.js"]').count(),1);await p.close();}
 await nojs.close();assert.deepEqual(errors,[]);
 await fs.writeFile(dir+'/browser.json',JSON.stringify({passed:true,checks,noJS:4,errors,scope:'Local Chromium production export; external scripts stubbed; no live PSI claim'},null,2));
 console.log({passed:true,checks:checks.length,noJS:4});
}finally{await browser.close();}
