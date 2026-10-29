import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3640',dir=process.env.QA_EVIDENCE_DIR??'/workspace/work/lean-fat-build-20261029';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],requests=[];
const pageFor=async(width=390,dark=false,javaScriptEnabled=true)=>{
 const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true,javaScriptEnabled});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base)){requests.push(u);return r.continue();}return r.fulfill({body:'',contentType:'text/javascript'});});
 if(dark)await page.addInitScript(()=>localStorage.setItem('calculatorfree.theme','dark-pro'));return page;
};
try{
 for(const id of ['fat-fire','lean-fire'])for(const width of [320,390,768,1440]){
  const p=await pageFor(width);const response=await p.goto(base+'/'+id+'-calculator',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  assert.equal(await p.locator('h1').innerText(),id==='fat-fire'?'Fat FIRE Calculator':'Lean FIRE Calculator');
  assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/'+id+'-calculator');
  assert.equal(await p.locator('script[src*="adsbygoogle.js"]').count(),1);
  const form=p.locator('.calculator-form');assert.equal(await form.locator('input,select,textarea').count(),16);
  assert.equal(await form.locator('input').evaluateAll(inputs=>new Set(inputs.map(i=>i.id)).size),16);
  assert.equal(await p.locator('.calculator-guide #common-questions').count(),1);
  const report=p.getByRole('region',{name:'Retirement budget and target comparisons',exact:true});await report.waitFor();assert.equal(await report.getByRole('table').count(),2);
  assert.equal(await p.locator('.result .metrics strong').first().innerText(),id==='fat-fire'?'$3,000,000.00':'$780,000.00');
  await p.getByLabel('Annual tax allowance funded by portfolio',{exact:true}).fill(id==='fat-fire'?'12000':'3600');
  assert.equal(await p.locator('.result').count(),0);
  await p.getByLabel('Additional spending buffer',{exact:true}).fill('10');await p.getByLabel('Additional spending buffer',{exact:true}).press('Enter');
  await report.waitFor();assert.equal(await p.locator('.result .metrics strong').first().innerText(),id==='fat-fire'?'$3,630,000.00':'$957,000.00');
  assert.equal(await p.getByRole('region',{name:'Balance chart',exact:true}).count(),1);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width<=390){const input=await p.getByLabel('Current invested assets for FIRE',{exact:true}).boundingBox(),label=await p.locator(`label[for="${id}-plan-balance"]`).boundingBox();assert.ok(label.y+label.height<=input.y);}
  const dl=p.waitForEvent('download');await report.getByRole('button',{name:'Download budget CSV'}).first().click();const download=await dl;const csv=await fs.readFile(await download.path(),'utf8');assert.ok(csv.includes('Total portfolio-funded budget'));assert.ok(csv.includes(id==='fat-fire'?'145200':'38280'));
  if([390,1440].includes(width)){await form.screenshot({path:dir+'/'+id+'-form-'+width+'.png'});await report.screenshot({path:dir+'/'+id+'-report-'+width+'.png'});}
  await p.getByRole('button',{name:'Add calculator to favorites',exact:true}).click();await p.getByRole('button',{name:'Remove calculator from favorites',exact:true}).waitFor();
  await p.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await p.getByLabel('Additional spending buffer',{exact:true}).inputValue(),'0');assert.equal(await p.locator('.result').count(),0);
  await p.getByRole('button',{name:'Calculate',exact:true}).click();await report.waitFor();assert.equal(await p.locator('.result .metrics strong').first().innerText(),id==='fat-fire'?'$3,000,000.00':'$780,000.00');
  checks.push({id,width,defaults:true,noDuplicateFields:true,keyboardSubmit:true,budgetAndTax:true,csv:true,chart:true,reset:true,favorite:true,ads:true,noOverflow:true});await p.close();
 }
 for(const id of ['fat-fire','lean-fire']){
  const p=await pageFor(390,true);await p.goto(base+'/'+id+'-calculator',{waitUntil:'networkidle'});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark-pro');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.calculator-form').screenshot({path:dir+'/'+id+'-dark-390.png'});checks.push({id,dark:true,noOverflow:true});await p.close();
  const params=new URLSearchParams({share_version:'1',mode:'plan',buffer:'10',tax_allowance:id==='fat-fire'?'12000':'3600'});const shared=await pageFor();await shared.goto(base+'/'+id+'-calculator#calc='+params.toString(),{waitUntil:'networkidle'});await shared.getByRole('region',{name:'Retirement budget and target comparisons',exact:true}).waitFor();assert.equal(await shared.getByLabel('Additional spending buffer',{exact:true}).inputValue(),'10');assert.equal(await shared.locator('.result .metrics strong').first().innerText(),id==='fat-fire'?'$3,630,000.00':'$957,000.00');checks.push({id,sharedInputs:true});await shared.close();
  const nojs=await pageFor(390,false,false);await nojs.goto(base+'/'+id+'-calculator',{waitUntil:'networkidle'});assert.equal(await nojs.locator('h1').count(),1);assert.equal(await nojs.locator('.calculator-form input').count(),16);assert.equal(await nojs.locator('.calculator-guide #common-questions').count(),1);checks.push({id,noJSContent:true});await nojs.close();
 }
 const category=await pageFor();await category.goto(base+'/retirement-calculators',{waitUntil:'networkidle'});for(const id of ['fat-fire','lean-fire'])assert.ok(await category.locator(`#category-tools a[href="/${id}-calculator"]`).count()>0);checks.push({categoryLinks:true});await category.close();
 assert.deepEqual(errors,[]);await fs.writeFile(dir+'/browser.json',JSON.stringify({checks,errors,requestedAssets:[...new Set(requests.filter(u=>u.includes('/_next/static/')))]},null,2));console.log(JSON.stringify({configurations:checks.length,checks,errors},null,2));
}finally{await browser.close();}
