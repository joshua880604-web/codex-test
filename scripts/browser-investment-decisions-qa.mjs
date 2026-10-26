import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';import {selectCalculatorMode} from './browser-mode-controls.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3630',dir=process.env.QA_EVIDENCE_DIR??'/workspace/work/investment-decisions-20261027';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[],errors=[];
try{
 const ctx=await browser.newContext({acceptDownloads:true});await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.fulfill({body:'',contentType:'text/javascript'}));const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440])for(const id of ['tax-equivalent-yield','treasury-bill']){
  await page.setViewportSize({width,height:900});const r=await page.goto(base+'/'+id+'-calculator',{waitUntil:'networkidle'});assert.equal(r.status(),200);await page.locator('.result h2').waitFor();
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/'+id+'-calculator');assert.equal(await page.locator('.calculator-disclaimer').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.ok((await page.locator('title').textContent()).length<=70);assert.equal(await page.locator('.breadcrumb a').last().getAttribute('href'),'/savings-investment-calculators');
  const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];assert.equal(graph[0].offers.price,'0');assert.equal(await page.locator('a[href^="/"][href*=".html"]').count(),0);
  if(width===1440){assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);assert.ok((await page.locator('.page-wrap').boundingBox()).width<=1120);}
  checks.push({width,id,initial:true,noOverflow:true,finalLinks:true,schema:true});
  if(id==='tax-equivalent-yield'){
   await page.getByLabel('Federal marginal income tax rate',{exact:true}).fill('20');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary strong').filter({hasText:'5.0000%'}).waitFor();checks.push({width,taxEquivalent5Percent:true});
  }else{
   await selectCalculatorMode(page,'price');await page.getByLabel('Purchase fee',{exact:true}).fill('10');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary strong').filter({hasText:'$142.00'}).waitFor();checks.push({width,billPriceMode142Profit:true});
  }
  if(width===390){
   await page.screenshot({path:dir+'/'+id+'-top.png'});
   await page.locator('.workspace-details > summary').click();const csvPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();await (await csvPromise).saveAs(dir+'/'+id+'.csv');
   await page.locator('.workspace-sharing > summary').click();assert.equal(await page.getByLabel('Include input details in PNG').isChecked(),false);
   const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await (await pngPromise).saveAs(dir+'/'+id+'.png');
   await page.getByLabel('Include input details in PNG').check();const p2=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await (await p2).saveAs(dir+'/'+id+'-inputs.png');checks.push({id,csv:true,pngWithoutAndWithInputs:true});
   if(id==='tax-equivalent-yield'){await page.getByLabel('Federal marginal income tax rate',{exact:true}).fill('99');await page.getByLabel('State marginal tax rate',{exact:true}).fill('1');}
   else await page.getByLabel('Holding length',{exact:true}).fill('0');
   await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await page.locator('.metric.primary').count(),0);assert.ok(await page.locator('.error[role=alert]').count()||await page.locator('input:invalid').count());checks.push({id,invalidInputNoStaleResult:true});
  }
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());for(const id of ['tax-equivalent-yield','treasury-bill']){const p=await nojs.newPage();await p.goto(base+'/'+id+'-calculator');await p.locator('.result h2').waitFor();assert.equal(await p.locator('.calculator-guide').count(),1);await p.close();checks.push({id,staticResultWithoutJS:true});}await nojs.close();assert.deepEqual(errors,[]);
 await fs.writeFile(dir+'/browser-investment-qa.json',JSON.stringify({passed:true,checks,errors},null,2)+'\n');console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
