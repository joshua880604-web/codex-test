import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const markers={recast:'A recast needs a remaining loan balance',mortgageTools:'The matched-budget comparison pays the same annual amount',engine:'These inputs do not produce a finite result',other:'No prepayment penalties or new borrowing',property:'Yearly extra payment start must be a whole payment month',retirement:'Retirement age must be at least current age',cpi:'CUUR0000SA0',fx:'Frankfurter v2',joint:'current post-2021 factors',directory:'Popular financial calculators',png:'Image export is unavailable in this browser',scientific:'Expression is too long (maximum 2,000 characters).'};
const assets=await fs.readdir('out/_next/static/chunks'),chunks={};
for(const name of assets.filter(n=>n.endsWith('.js'))){const text=await fs.readFile('out/_next/static/chunks/'+name,'utf8');for(const [key,marker] of Object.entries(markers))if(text.includes(marker))(chunks[key]??=[]).push('/_next/static/chunks/'+name);}
for(const key of Object.keys(markers))assert.ok(chunks[key]?.length,'Missing bundle marker '+key);
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3000',browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],measurements=[],errors=[],external=[];
const adLoader='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
// Search is shared with sidebars; the directory marker names its own component.
const categories=['recast','mortgageTools','engine','other','property','retirement','cpi','fx','joint','png','scientific'];
function loaded(resources,key){return chunks[key].some(name=>resources.some(r=>r.path===name));}
async function fresh(options={}){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true,...options});
 const resources=[],jobs=[];page.on('response',r=>{if(new URL(r.url()).pathname.endsWith('.js'))jobs.push(r.body().then(b=>resources.push({path:new URL(r.url()).pathname,decodedBytes:b.length,gzipEstimate:gzipSync(b).length})).catch(()=>{}));});
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:')&&r.url()!==adLoader)external.push(r.url());});
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.request().url()===adLoader?route.fulfill({body:'',contentType:'text/javascript'}):route.abort());
 return {page,resources,settle:async()=>{await page.waitForLoadState('networkidle');await Promise.all(jobs);}};
}
try{
 // Static content must remain usable/readable when all JS is disabled.
 for(const id of ['financial','mortgage','401k','scientific','student-loan','pmi','biweekly-mortgage','discount-points','mortgage-recast']){
  const {page}=await fresh({javaScriptEnabled:false});await page.goto(`${base}/${id}-calculator.html`);await page.locator('h1').waitFor();
  if(id==='financial'){assert.ok(await page.locator('.directory-grid a').count()>=81);await page.locator('#quick-expression').waitFor();}
  else {assert.ok(await page.locator('.calculator-form input,.calculator-form textarea').count()>0);await page.locator('.result h2').waitFor();await page.locator('.calculator-guide').waitFor();}
  checks.push({id,staticHtmlWithoutJavaScript:true});await page.close();
 }
 for(const [id,expected] of [['mortgage-recast','recast'],['pmi','mortgageTools'],['biweekly-mortgage','mortgageTools'],['discount-points','mortgageTools'],['financial','scientific'],['mortgage','property'],['401k','retirement'],['vat','other'],['inflation','cpi'],['currency','fx'],['rmd','joint'],['cagr','engine']]){
  console.log('Checking lazy runtime: '+id);
  const {page,resources,settle}=await fresh();await page.goto(`${base}/${id}-calculator.html`);await settle();
  const initial=resources.map(r=>({...r}));
  for(const key of categories)assert.equal(loaded(initial,key),false,id+' eagerly loaded '+key);
  assert.equal(loaded(initial,'directory'),id==='financial',id+' directory isolation');
  const blocking=await page.locator('script[src]').evaluateAll(els=>els.filter(el=>!el.async&&!el.defer&&!el.noModule&&el.type!=='module').map(el=>el.src));assert.deepEqual(blocking,[]);
  if(id==='financial'){await page.locator('#quick-expression').fill('2+3*4');await page.getByRole('button',{name:'Calculate =',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.quick-answer')?.textContent==='14');}
  else {await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();}
  await settle();assert.equal(loaded(resources,expected),true,id+' did not load expected runtime');
  for(const key of ['cpi','fx','joint'])assert.equal(loaded(resources,key),key===expected,id+' fetched unrelated '+key);
  assert.equal(loaded(resources,'png'),false,'PNG code loaded before export');
  const calculationResources=resources.map(r=>({...r}));
  if(id==='vat'){
   const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const file=await download;const bytes=await fs.readFile(await file.path());assert.equal(bytes.readUInt32BE(16),1200);assert.ok(bytes.readUInt32BE(20)>=1680);await settle();assert.equal(loaded(resources,'png'),true);checks.push({pngLoadsOnlyOnExport:true,dimensions:'1200px wide; height adapts to content'});
  }
  measurements.push({id,initialDecodedBytes:initial.reduce((n,r)=>n+r.decodedBytes,0),initialGzipEstimate:initial.reduce((n,r)=>n+r.gzipEstimate,0),afterCalculationDecodedBytes:calculationResources.reduce((n,r)=>n+r.decodedBytes,0),initialResources:initial,calculationResources,allResources:resources});
  checks.push({id,noCalculationCodeInitially:true,onlyRequestedDataToolLoads:true,nonBlockingScriptTags:true});await page.close();
 }
 // Delay engine downloads; editing during the wait must cancel stale results.
 {
  const {page,settle}=await fresh();let release;const gate=new Promise(r=>release=r),held=[];
  await page.route('**/*.js',async route=>{if(chunks.engine.includes(new URL(route.request().url()).pathname)){held.push(route.request().url());await gate;}await route.continue();});
  await page.goto(base+'/mortgage-calculator.html');await settle();await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('form')?.getAttribute('aria-busy')==='true');assert.ok(await page.getByRole('button',{name:/Calculating/}).isDisabled());
  await page.locator('form [id$="-price"]').fill('300000');assert.equal(await page.locator('.result').count(),0);release();await settle();assert.ok(held.length);assert.equal(await page.locator('.result').count(),0);assert.ok(await page.getByRole('button',{name:'Calculate',exact:true}).isEnabled());
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('form [id$="-price"]').inputValue(),'300000');checks.push({delayedEngineShowsBusy:true,editCancelsStaleResult:true,subsequentCalculateWorks:true});await page.close();
 }
 // Shared links may load the requested engine automatically, after HTML appears.
 {
  const {page,settle}=await fresh();let release;const gate=new Promise(r=>release=r);
  await page.route('**/*.js',async route=>{if(chunks.engine.includes(new URL(route.request().url()).pathname))await gate;await route.continue();});
  await page.goto(base+'/cagr-calculator.html#calc=share_version=1&mode=rate&begin=100&end=121&years=2',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('form')?.getAttribute('aria-busy')==='true');await page.getByRole('button',{name:'Reset',exact:true}).click();release();await settle();assert.equal(await page.locator('.result').count(),0);assert.equal(await page.locator('form [id$="-begin"]').inputValue(),'10000');checks.push({sharedLinkLoadsAfterHtml:true,resetCancelsPendingSharedResult:true});await page.close();
 }
 // A missing JS chunk gives a readable recovery instruction and leaves the form usable.
 {
  const {page}=await fresh();let block=true;
  await page.route('**/*.js',async route=>{if(block&&chunks.engine.includes(new URL(route.request().url()).pathname))await route.abort();else await route.continue();});
  await page.goto(base+'/vat-calculator.html');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await page.locator('.error[role=alert]').waitFor();assert.match(await page.locator('.error[role=alert]').innerText(),/could not load.*reload this page/);assert.ok(await page.getByRole('button',{name:'Calculate',exact:true}).isEnabled());
  block=false;await page.reload();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error[role=alert]').count(),0);checks.push({failedChunkShowsRecovery:true,reloadRestoresCalculation:true});await page.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-lazy-loading-qa.json',JSON.stringify({tested_at:new Date().toISOString(),method:'Fresh Chromium pages against local static export; decoded JS and estimated gzip sums, not field performance or actual hosted wire bytes',checks,measurements,chunks,errors,external},null,2));
 console.log(JSON.stringify({checks:checks.length,measurements:measurements.map(({id,initialDecodedBytes,initialGzipEstimate})=>({id,initialDecodedBytes,initialGzipEstimate})),errors,external},null,2));
}finally{await browser.close();}
