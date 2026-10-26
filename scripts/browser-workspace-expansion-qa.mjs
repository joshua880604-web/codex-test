// Run with: node --import tsx scripts/browser-workspace-expansion-qa.mjs
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators/index.ts';
import {workspaceIds,workspaceLayout,workspaceMetrics} from '../src/lib/workspace-layout.ts';
import {resultTrend} from '../src/lib/result-trend.ts';
import {formatMetric} from '../src/lib/sharing.ts';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const adLoader='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
const page=await browser.newPage({acceptDownloads:true,reducedMotion:'reduce'}),base='http://127.0.0.1:3000';
const dir='/workspace/work/bordered-calculators-20261025/reports',checks=[],errors=[],external=[],failed=[];
await fs.mkdir(dir+'/screenshots',{recursive:true});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
page.on('request',r=>{if(r.url()!==adLoader&&!r.url().startsWith(base)&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.request().url()===adLoader?r.fulfill({contentType:'text/javascript',body:''}):r.abort());
async function openChart(p=page){const d=p.locator('.workspace-chart');if(await d.count()&&!await d.evaluate(e=>e.open))await d.locator('summary').click();}
const screenshotIds=['mortgage','auto-loan','savings','cd','ira','investment-fee','retirement','mutual-fund'];
async function checkLayout(id,mode,width){
 const {input,result}=await page.evaluate(()=>({input:document.querySelector('#calculator-panel').getBoundingClientRect().toJSON(),result:document.querySelector('.result').getBoundingClientRect().toJSON()}));
 if(width>=1120&&workspaceLayout(id,mode)==='split')assert.ok(result.x>=input.right&&Math.abs(input.y-result.y)<2,`${id}/${mode}/${width}: columns`);
 else assert.ok(result.y>=input.bottom,`${id}/${mode}/${width}: vertical order`);
 const geometry=await page.evaluate(()=>({main:document.querySelector('main').getBoundingClientRect().toJSON(),reports:[...document.querySelectorAll('.workspace-report')].map(e=>e.getBoundingClientRect().toJSON()),sidebar:document.querySelector('.sidebar').getBoundingClientRect().toJSON()}));
 for(const report of geometry.reports){assert.ok(Math.abs(report.x-geometry.main.x)<1);assert.ok(Math.abs(report.width-geometry.main.width)<1);assert.ok(report.y>=Math.max(input.bottom,result.bottom));}
 if(width>=1120){assert.equal(Math.round(geometry.main.width),736);assert.equal(Math.round(geometry.sidebar.width),320);}
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}/${mode}/${width}: overflow`);
}
try {
 for(const width of [390,1440]) {
  await page.setViewportSize({width,height:900});
  for(const id of workspaceIds) {
   const c=calculators.find(c=>c.id===id);await page.goto(base+routeFor(id));await page.locator('.result h2').waitFor();
   for(const mode of c.modes) {
    await selectCalculatorMode(page,mode.id);await page.getByRole('button',{name:'Reset',exact:true}).click();
    await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
    const values=defaults(mode),result=runCalculation(id,mode.id,values),trend=resultTrend(id,mode.id,values,result),summary=workspaceMetrics(id,mode.id,result);
    assert.equal(await page.locator('.result .metric.primary strong').textContent(),formatMetric(summary.primary),`${id}/${mode.id}: primary`);
    for(const m of summary.highlights) {
     const figure=page.locator('.workspace-key-figures .metric').filter({has:page.getByText(m.label,{exact:true})});
     assert.equal(await figure.locator('strong').innerText(),formatMetric(m));assert.ok(await figure.isVisible());
    }
    assert.equal(await page.locator('.result .metric').count(),result.metrics.length,`${id}/${mode.id}: no lost/duplicate metrics`);
    if(trend) {
     await openChart();await page.locator('.result-trend svg:visible').waitFor();
     assert.equal(await page.locator('.workspace-report-chart').count(),1);assert.equal(await page.locator('.result-trend svg:visible').count(),1);
     assert.equal(await page.locator('.result-trend figcaption').textContent(),trend.title);
     assert.ok(!/NaN|Infinity/.test(await page.locator('.result-trend svg:visible').innerHTML()));
     const desc=await page.locator('.result-trend svg:visible desc').textContent();assert.ok(desc.includes(trend.balanceLabel)&&desc.includes('USD'));
     if(trend.secondaryKey)assert.ok(desc.includes(trend.secondaryLabel));
    } else {assert.equal(await page.locator('.result-trend').count(),0);assert.equal(await page.locator('.workspace-report-chart').count(),0);}
    await checkLayout(id,mode.id,width);
    if(await page.locator('.workspace-breakdown').count())await page.locator('.workspace-breakdown > summary').click();
    await page.locator('.workspace-details > summary').click();
    if(result.rows?.length)await page.locator('.workspace-report .table-scroll').first().waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(await page.locator('.workspace-breakdown').count())await page.locator('.workspace-breakdown > summary').click();
    await page.locator('.workspace-details > summary').click();
    if(mode===c.modes[0]) {
     const more=page.locator('.calculator-form > .advanced');
     if(await more.count())await more.locator(':scope > summary').click();
     const invalid=await page.locator('.calculator-form input,.calculator-form select,.calculator-form textarea').evaluateAll(els=>els.filter(e=>e.getClientRects().length).map(e=>({id:e.id,width:e.getBoundingClientRect().width,font:parseFloat(getComputedStyle(e).fontSize),right:e.getBoundingClientRect().right})).filter(e=>e.width<65||e.right>innerWidth+1||(innerWidth<=700&&e.font<16)));
     assert.deepEqual(invalid,[],`${id}/${width}: editable controls`);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     if(await more.count())await more.locator(':scope > summary').click();
     if(screenshotIds.includes(id)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${dir}/screenshots/${id}-${width}.png`,fullPage:true});}
    }
    checks.push({id,mode:mode.id,width,primary:summary.primary.label,chart:trend?.title??null,layout:workspaceLayout(id,mode.id),allMetrics:true});
   }
  }
 }
 for(const width of [320,768,1024]) {
  await page.setViewportSize({width,height:900});
  for(const id of ['mortgage','fha-loan','amortization','mortgage-payoff','auto-loan','heloc','savings','cd','annuity-payout','ira','investment-fee','depreciation','retirement','mutual-fund']) {
   await page.goto(base+routeFor(id));await page.locator('.result h2').waitFor();
   const c=calculators.find(c=>c.id===id);await checkLayout(id,c.modes[0].id,width);
   checks.push({id,width,boundaryLayout:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 for(const [id,query] of [['mortgage-payoff','mode=known-normal&elapsed=60'],['refinance','mode=balance&finance=Yes&cashout=10000&fees=3000'],['student-loan','mode=projection'],['investment-fee','mode=compare'],['annuity-payout','mode=length&frequency=Quarterly'],['cd','tax=100']]) {
  await page.goto(base+routeFor(id)+'?'+query);await page.waitForLoadState('networkidle');await openChart();await page.locator('.result-trend svg:visible').waitFor();
  await page.locator('.workspace-sharing > summary').click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();
  const image=await pending,bytes=await fs.readFile(await image.path());assert.equal(bytes.readUInt32BE(16),1200);assert.ok(bytes.readUInt32BE(20)>=1680);
  await image.saveAs(`${dir}/${id}-export.png`);
  await page.locator('.workspace-details > summary').click();const csvPending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const csv=await fs.readFile(await (await csvPending).path(),'utf8');assert.ok(csv.split('\n').length>2);
  await page.locator('.calculator-form input[type=number]').first().fill('');assert.equal(await page.locator('.result-trend').count(),0);
  await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await page.locator('.result').count(),0);
  await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await openChart();await page.locator('.result-trend svg:visible').waitFor();
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.ok(await page.locator('.workspace-details').evaluate(e=>e.open));
  await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('.workspace-details').evaluate(e=>e.open),false);
  checks.push({id,sharedInputs:true,png:'1200px wide; adaptive height',csv:true,editInvalidReset:true,print:true});
 }
 const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await plain.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 for(const id of ['mortgage','savings','cd','ira','investment-fee']) {await plain.goto(base+routeFor(id));await openChart(plain);await plain.locator('.result-trend svg:visible').waitFor();await plain.locator('.workspace-details > summary').click();await plain.locator('.workspace-report .table-scroll').first().waitFor();checks.push({id,noJavaScriptChartAndTable:true});}
 await plain.close();assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 await fs.writeFile(`${dir}/browser.json`,JSON.stringify({passed:true,checks,errors,external,failed},null,2));console.log({checks:checks.length,errors:errors.length,external:external.length});
}finally{await browser.close();}
