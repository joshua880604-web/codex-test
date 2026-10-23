import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3000';
const origin='https://calculatorfree.io';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[],errors=[];
await fs.mkdir('/workspace/work/glossary-expansion/screenshots',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 for(const slug of ['', 'apy','required-minimum-distribution','apr','cap-rate-vs-cash-on-cash-return','marginal-vs-effective-tax-rate','lease-residual-value','ecpm','percentage-vs-percentage-points']){
  const path='/glossary/'+(slug?slug+'/':'');assert.equal((await page.goto(base+path)).status(),200);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+path);
  assert.ok(!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const ld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(ld['@graph'][0]['@type'],slug?'DefinedTerm':'DefinedTermSet');
  if(['required-minimum-distribution','ecpm','apr'].includes(slug))await page.screenshot({path:'/workspace/work/glossary-expansion/screenshots/'+slug+'-390.png',fullPage:true});
  if(slug==='cap-rate-vs-cash-on-cash-return')assert.match(await page.locator('main').innerText(),/excludes financing, depreciation and income tax/);
  if(slug==='ecpm'){assert.equal(await page.locator('.glossary-calculators').count(),0);assert.match(await page.locator('main').innerText(),/page RPM uses page views, while ad RPM uses ad impressions/);}
  checks.push({path,canonical:true,indexable:true,noOverflow:true,schema:true});
 }
 // Directory filtering is local and must not request a calculation engine or API.
 const requested=[];page.on('request',request=>requested.push(request.url()));
 await page.goto(base+'/glossary/');await page.waitForLoadState('networkidle');requested.length=0;
 await page.getByRole('searchbox',{name:'Find a finance term'}).fill('RMD');assert.equal(await page.locator('.glossary-grid article').count(),1);await page.getByRole('link',{name:'Required minimum distribution (RMD)',exact:true}).waitFor();
 assert.equal(requested.length,0,'Search must not request a calculation engine');
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-glossary-production-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,searchRequests:requested,errors},null,2));console.log({passed:true,checks:checks.length,errors});
}finally{await browser.close();}
