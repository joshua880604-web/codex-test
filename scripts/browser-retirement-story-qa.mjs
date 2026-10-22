import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base='http://127.0.0.1:3000',output='/workspace/work/result-story';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],external=[];
const number=text=>Number(text.replaceAll('−','-').replace(/[^0-9.-]/g,''));
const close=(a,b,tolerance=.021)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
async function fresh(options={}){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true,...options});
 await page.addInitScript(()=>{window.__drawnText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.__drawnText.push(String(text));return original.call(this,text,...args);};});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
 return page;
}
const field=(page,key)=>page.locator(`form [id$="-${key}"]`);
const metric=async(page,label)=>number(await page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong').innerText());
const inputValues=page=>page.locator('form input,form select').evaluateAll(nodes=>Object.fromEntries(nodes.filter(n=>n.id).map(n=>[n.id,n.value])));
async function ready(page,query=''){
 await page.goto(base+'/401k-calculator.html'+query);
 await page.locator('.retirement-story').waitFor();await page.waitForLoadState('networkidle');
}
async function scenario(page,id){await page.locator(`[data-scenario="${id}"]`).click();await page.locator('.story-comparison').waitFor();assert.equal(await page.locator(`[data-scenario="${id}"]`).getAttribute('aria-pressed'),'true');}
async function restore(page){await page.getByRole('button',{name:'Restore original plan',exact:true}).click();await page.getByText('Original plan restored.',{exact:true}).waitFor();assert.equal(await page.locator('.story-comparison').count(),0);}
try{
 const page=await fresh();
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await ready(page);
  const balance=await metric(page,'Projected 401(k) balance');
  const parts=await page.locator('.story-parts dd').allTextContents();assert.equal(parts.length,4);close(parts.reduce((sum,p)=>sum+number(p),0),balance);
  const meaning=await page.locator('.story-meaning').innerText();
  assert.ok(meaning.includes(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(await metric(page,'Initial monthly retirement withdrawal'))));
  assert.ok(meaning.includes(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(await metric(page,'Initial withdrawal in today’s dollars'))));
  assert.equal(await page.locator('.story-four-percent').evaluate(el=>el.open),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const button of await page.locator('.story-scenario-buttons button').all()){
   const bounds=await button.boundingBox();assert.ok(bounds.height>=44);assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
  }
  if(width===390){await page.locator('.retirement-story').screenshot({path:output+'/story-default-mobile.png'});}
  checks.push({width,reconciledBreakdown:true,noOverflow:true,touchTargets:true});
 }
 await page.setViewportSize({width:390,height:844});await ready(page);
 const originalInputs=await inputValues(page),originalBalance=await metric(page,'Projected 401(k) balance'),originalMonthly=await metric(page,'Initial withdrawal in today’s dollars');
 await scenario(page,'save-more');assert.equal(await field(page,'contribution').inputValue(),'11.5');
 close(number(await page.locator('[data-delta="balance"]').innerText()),await metric(page,'Projected 401(k) balance')-originalBalance);
 close(number(await page.locator('[data-delta="monthly-today"]').innerText()),await metric(page,'Initial withdrawal in today’s dollars')-originalMonthly);
 await page.waitForFunction(()=>document.activeElement?.getAttribute('data-scenario')==='save-more');
 checks.push('Saving scenario updates inputs, compares the original result and retains keyboard focus');
 await scenario(page,'lower-return');assert.equal(await field(page,'contribution').inputValue(),'10');assert.equal(await field(page,'return').inputValue(),'5');assert.equal(await field(page,'retire').inputValue(),'67');
 assert.ok(number(await page.locator('[data-delta="balance"]').innerText())<0);
 checks.push('Return scenario starts from original values instead of stacking');
 await scenario(page,'retire-later');assert.equal(await field(page,'retire').inputValue(),'69');assert.equal(await field(page,'return').inputValue(),'6');assert.equal(await field(page,'contribution').inputValue(),'10');
 assert.match(await page.locator('.story-comparison').innerText(),/different retirement ages.*shorter withdrawal period/s);
 await page.locator('.retirement-story').screenshot({path:output+'/story-later-mobile.png'});
 checks.push('Later retirement uses the original return and explains the different withdrawal horizon');
 // Sharing, summary, PNG and schedules must describe the selected scenario.
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.locator('.share-options > summary').click();await page.getByLabel('Include current inputs in the link',{exact:true}).check();
 await page.getByRole('button',{name:'Copy link',exact:true}).click();await page.getByText('Recalculable link copied. It includes your input values.',{exact:true}).waitFor();
 const link=await page.evaluate(()=>navigator.clipboard.readText()),params=new URLSearchParams(new URL(link).hash.slice(6));
 assert.equal(params.get('retire'),'69');assert.equal(params.get('return'),'6');assert.equal(params.has('baseline'),false);
 const selectedBalance=await page.locator('.metric.primary strong').innerText();
 await page.getByRole('button',{name:'Copy result summary',exact:true}).click();await page.getByText('Result summary copied. It contains calculation amounts.',{exact:true}).waitFor();
 assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes(selectedBalance));
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const download=await downloading;
 await download.saveAs(output+'/401k-later-result.png');const png=await fs.readFile(output+'/401k-later-result.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),1680);
 assert.ok(await page.evaluate(value=>window.__drawnText.some(t=>t.includes(value)),selectedBalance));
 for(const label of ['Existing savings','Your future contributions','Future employer match','Projected investment growth','READING YOUR RESULT'])assert.ok(await page.evaluate(value=>window.__drawnText.includes(value),label),'PNG is missing '+label);
 assert.ok((await page.evaluate(()=>window.__drawnText.join(' '))).includes(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(await metric(page,'Initial withdrawal in today’s dollars'))));
 const csvDownloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download retirement CSV',exact:true}).click();const csv=await csvDownloading;const csvText=await fs.readFile(await csv.path(),'utf8');assert.equal(csvText.trim().split('\n').length,22);
 checks.push('Share link, copied summary, 5:7 PNG and withdrawal CSV all use the selected scenario');
 await restore(page);assert.deepEqual(await inputValues(page),originalInputs);assert.equal(await metric(page,'Projected 401(k) balance'),originalBalance);
 checks.push('Restore returns exact original inputs and result');
 await scenario(page,'save-more');await field(page,'return').fill('7');assert.equal(await page.locator('.result').count(),0);
 await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.retirement-story').waitFor();assert.equal(await page.locator('.story-comparison').count(),0);
 await scenario(page,'lower-return');assert.equal(await field(page,'return').inputValue(),'6');await restore(page);assert.equal(await field(page,'return').inputValue(),'7');
 checks.push('Manual edits establish a new original plan on the next calculation');
 await scenario(page,'lower-return');await page.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await page.locator('.result').count(),0);assert.equal(await page.locator('.scenario-recovery').count(),0);
 await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.retirement-story').waitFor();assert.equal(await page.locator('.story-comparison').count(),0);
 await page.getByRole('tab',{name:'Early Withdrawal Cost',exact:true}).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result').waitFor();assert.equal(await page.locator('.retirement-story').count(),0);
 checks.push('Reset and other 401(k) modes do not retain scenario state');
 await page.goto(link);await page.waitForFunction(()=>document.querySelector('form [id$="-retire"]')?.value==='69');await page.locator('.retirement-story').waitFor();assert.equal(await page.locator('.story-comparison').count(),0);assert.equal(await page.locator('.metric.primary strong').innerText(),selectedBalance);
 checks.push('Shared scenario becomes a reproducible independent plan');
 await ready(page,'?mode=projection&age=49&retire=50&life=75&salary=100000&contribution=24.5');
 assert.ok(await page.locator('[data-scenario="save-more"]').isDisabled());assert.match(await page.locator('#scenario-save-more-reason').innerText(),/modeled limit/);
 await ready(page,'?mode=projection&age=49&retire=50&life=75&salary=100000&contribution=24');
 assert.equal(await page.locator('[data-scenario="save-more"]').innerText(),'Use remaining contribution room');await scenario(page,'save-more');assert.equal(await field(page,'contribution').inputValue(),'24.5');assert.match(await page.locator('.story-comparison').innerText(),/adding \$500.00 to first-year/);
 checks.push('Contribution cap and partial remaining room are explained and enforced');
 await ready(page,'?mode=projection&age=67&retire=67&life=68&balance=12000&return=0&inflation=0');
 assert.equal(await metric(page,'Initial monthly retirement withdrawal'),1000);assert.ok(await page.locator('[data-scenario="save-more"]').isDisabled());assert.ok(await page.locator('[data-scenario="retire-later"]').isDisabled());
 await page.locator('.story-four-percent > summary').click();assert.match(await page.locator('.story-four-percent').innerText(),/\$40.00 per month/);
 checks.push('The 4% illustration remains separate from lifespan-based monthly income');
 await ready(page,'?mode=projection&age=60&retire=65&life=80&salary=0&balance=100000&return=-5&inflation=0');
 assert.ok(await page.locator('[data-scenario="save-more"]').isDisabled());assert.match(await page.locator('[data-part="growth"]').innerText(),/Projected investment loss\s*-\$/);assert.equal(await page.locator('.story-composition').count(),0);
 const lossDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await lossDownload;
 assert.ok(await page.evaluate(()=>window.__drawnText.includes('Projected investment loss')));
 checks.push('Zero salary and negative returns keep clear reasons and signed investment losses');
 await page.close();
 const noJS=await fresh({javaScriptEnabled:false});await ready(noJS);assert.equal(await noJS.locator('.story-parts dd').count(),4);await noJS.close();checks.push('Explanation is present in server-rendered HTML without JavaScript');
 const files=await fs.readdir('out/_next/static/chunks'),engine=[];
 for(const file of files.filter(f=>f.endsWith('.js')))if((await fs.readFile('out/_next/static/chunks/'+file,'utf8')).includes('These inputs do not produce a finite result'))engine.push('/_next/static/chunks/'+file);
 assert.ok(engine.length);
 {
  const slow=await fresh();let release;const gate=new Promise(r=>release=r);let held=0;
  await slow.route('**/*.js',async route=>{if(engine.includes(new URL(route.request().url()).pathname)){held++;await gate;}await route.continue();});
  try{
   await ready(slow);await slow.locator('[data-scenario="save-more"]').click();await slow.locator('.scenario-recovery').waitFor();assert.equal(await field(slow,'contribution').inputValue(),'11.5');
   await restore(slow);assert.equal(await field(slow,'contribution').inputValue(),'10');release();await slow.waitForLoadState('networkidle');assert.ok(held>0);assert.equal(await metric(slow,'Projected 401(k) balance'),originalBalance);assert.equal(await slow.locator('.story-comparison').count(),0);
   checks.push('Restoring during a slow first scenario cancels stale asynchronous results');
  }finally{release();await slow.close();}
 }
 {
  const failed=await fresh();await failed.route('**/*.js',route=>engine.includes(new URL(route.request().url()).pathname)?route.abort():route.continue());
  await ready(failed);await failed.locator('[data-scenario="save-more"]').click();await failed.locator('.error[role="alert"]').waitFor();assert.match(await failed.locator('.error[role="alert"]').innerText(),/scenario could not be calculated.*could not load/s);
  await restore(failed);assert.equal(await metric(failed,'Projected 401(k) balance'),originalBalance);assert.equal(await failed.locator('.error[role="alert"]').count(),0);await failed.close();checks.push('A failed lazy engine load shows an error and can restore the cached original');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const report={passed:true,tested_at:new Date().toISOString(),checks,errors,external};await fs.writeFile('docs/financial-clone/evidence/browser-retirement-story-qa.json',JSON.stringify(report,null,2));console.log({passed:true,checks:checks.length,errors,external});
}finally{await browser.close();}
