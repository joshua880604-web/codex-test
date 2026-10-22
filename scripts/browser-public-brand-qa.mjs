import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8')),terms=JSON.parse(await fs.readFile('src/lib/glossary-data.json','utf8'));
const paths=[...catalog.map(item=>item.local_route),'/financial-calculator.html','/about.html','/privacy.html','/methodology.html','/glossary/',...terms.map(term=>'/glossary/'+term.slug+'/')];
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3002';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],blockedRequests=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('request',request=>{if(/calculator\.net/i.test(request.url()))blockedRequests.push(request.url());});
await fs.mkdir('/workspace/work/public-brand-preview',{recursive:true});
try{
 for(const path of paths){
  const response=await page.goto(base+path);assert.equal(response.status(),200,path);await page.locator('h1').waitFor();
  assert.ok(!/calculator(?:\.|\\u002e|%2e)net/i.test(await page.content()),path);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' mobile overflow');
  if(path==='/real-estate-calculator.html'){
   assert.equal(await page.locator('.estate-list a').count(),15);
   for(const link of await page.locator('.estate-list a').all()){const href=await link.getAttribute('href');assert.ok(href.startsWith('/'));assert.equal((await page.request.get(base+href)).status(),200);}
   await page.screenshot({path:'/workspace/work/public-brand-preview/real-estate-390.png'});
  }
  if(path==='/about.html')await page.screenshot({path:'/workspace/work/public-brand-preview/about-390.png'});
  checks.push({path,noReferenceDomain:true,noMobileOverflow:true});
 }
 for(const path of ['/loan-calculator.html','/irr-calculator.html','/tax-calculator.html']){
  await page.goto(base+path);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
  assert.ok(!/calculator\.net/i.test(await page.content()));
 }
 await page.goto(base+'/tax-calculator.html');assert.ok(await page.locator('.calculator-guide a[href^="https://www.irs.gov/"]').count()>0);
 await page.goto(base+'/methodology.html');assert.ok(await page.locator('.methodology-content a[href*="bls.gov"]').count()>0);
 assert.deepEqual(errors,[]);assert.deepEqual(blockedRequests,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-public-brand-qa.json',JSON.stringify({tested_at:new Date().toISOString(),passed:true,pages:checks.length,checks,calculationSmokeRoutes:3,officialTaxAndInflationSourcesPresent:true,errors,blockedRequests},null,2)+'\n');
 console.log({passed:true,pages:checks.length,calculationSmokeRoutes:3,errors:errors.length});
}finally{await browser.close();}
