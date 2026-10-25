import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const dir='/workspace/work/cd-layout-implementation',base='http://127.0.0.1:3170';
await fs.mkdir(dir,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{env:{...process.env,PORT:'3170'},stdio:['ignore','pipe','pipe']});await once(server.stdout,'data');
let browser;const checks=[],errors=[],unexpected=[];
const adLoader='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
const defaults={'After-tax balance':'$11,259.48','Interest earned':'$1,614.72','Maturity balance':'$11,614.72','Tax on interest':'$355.24'};
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({acceptDownloads:true});
 await context.route('**/*',r=>{const url=r.request().url();if(url.startsWith(base+'/'))return r.continue();if(url===adLoader)return r.fulfill({contentType:'text/javascript',body:''});unexpected.push(url);return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 async function amounts(expected=defaults){for(const [label,value] of Object.entries(expected)){const row=page.locator('.result .metric').filter({has:page.getByText(label,{exact:true})});assert.equal(await row.count(),1,label);assert.ok(await row.isVisible(),label);assert.ok((await row.innerText()).includes(value),label+': '+await row.innerText());}}
 async function overflow(){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 for(const width of [320,390,768,900,1023,1024,1149,1199,1200,1280,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/cd-calculator.html');await page.locator('.result h2').waitFor();await amounts();
  const rects=await page.evaluate(()=>{const r=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();return {main:r('main'),input:r('.calculator-form'),result:r('.result'),sidebar:r('.sidebar')};});
  assert.equal(await page.locator('.workspace-breakdown').count(),0);
  if(width>=1024){assert.equal(Math.round(rects.sidebar.width),320);assert.ok(rects.sidebar.x>=rects.main.x+rects.main.width+23);}
  else assert.ok(rects.sidebar.y>rects.main.y+rects.main.height);
  if(width>=1120){assert.ok(rects.result.width>=385&&rects.result.width<=395);assert.ok(rects.result.x>rects.input.x+rects.input.width);assert.ok(rects.result.height<650);}
  else assert.ok(rects.result.y>=rects.input.y+rects.input.height);
  const chart=page.locator('.workspace-chart'),summary=chart.locator('summary');assert.equal(await chart.getAttribute('open'),null);assert.equal(await chart.locator('svg').isVisible(),false);
  await summary.focus();await summary.press('Enter');await chart.locator('svg').waitFor();assert.match(await chart.locator('svg desc').textContent(),/11,614.72/);assert.ok(!/NaN|Infinity/.test(await chart.locator('svg').innerHTML()));
  await summary.press('Enter');assert.equal(await chart.locator('svg').isVisible(),false);await overflow();
  if([390,1440].includes(width)){await page.locator('.calculator-workspace').scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/cd-${width}.png`});}
  checks.push({width,fourAmountsVisible:true,chartKeyboardToggle:true,sidebar:Math.round(rects.sidebar.width),resultWidth:Math.round(rects.result.width),resultHeight:Math.round(rects.result.height),noOverflow:true});
 }
 await page.locator('.workspace-details > summary').click();assert.equal(await page.locator('.table-scroll tbody tr').count(),36);
 let pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();let csv=await fs.readFile(await (await pending).path(),'utf8');assert.equal(csv.trim().split(/\r?\n/).length,37);assert.ok(csv.includes('Balance before tax'));
 await page.getByRole('button',{name:'Yearly',exact:true}).click();assert.equal(await page.locator('.table-scroll tbody tr').count(),3);pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();csv=await fs.readFile(await (await pending).path(),'utf8');assert.equal(csv.trim().split(/\r?\n/).length,4);assert.ok(csv.includes('Year'));await amounts();checks.push('Monthly/yearly schedules and full CSV remain available');
 await page.locator('.workspace-details > summary').click();await page.emulateMedia({media:'print'});await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.ok(await page.locator('.workspace-chart svg').isVisible());assert.ok(await page.locator('.table-scroll').isVisible());assert.equal(await page.locator('.sidebar').isVisible(),false);await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await page.emulateMedia({media:'screen'});assert.equal(await page.locator('.workspace-chart').getAttribute('open'),null);assert.equal(await page.locator('.workspace-details').getAttribute('open'),null);checks.push('Print includes chart/schedule and restores disclosure states');
 await page.locator('.workspace-sharing > summary').click();pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const png=await pending,bytes=await fs.readFile(await png.path());assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),1680);await png.saveAs(dir+'/cd-result.png');checks.push('Result PNG remains 1200x1680');
 for(const [query,expected,hasChart] of [
  ['principal=1000&rate=10&compound=Annually&years=2&months=0&tax=20',{'After-tax balance':'$1,168.00','Interest earned':'$210.00','Maturity balance':'$1,210.00','Tax on interest':'$42.00'},true],
  ['principal=1000&rate=0&years=2&months=0&tax=22',{'After-tax balance':'$1,000.00','Interest earned':'$0.00','Maturity balance':'$1,000.00','Tax on interest':'$0.00'},true],
  ['principal=1000&rate=-10&compound=Annually&years=2&months=0&tax=22',{'After-tax balance':'$810.00','Interest earned':'-$190.00','Maturity balance':'$810.00','Tax on interest':'$0.00'},true],
  ['principal=1000&rate=10&compound=Annually&years=2&months=0&tax=100',{'After-tax balance':'$1,000.00','Interest earned':'$210.00','Maturity balance':'$1,210.00','Tax on interest':'$210.00'},true],
  ['principal=1000&rate=5&years=0&months=0&tax=22',{'After-tax balance':'$1,000.00','Interest earned':'$0.00','Maturity balance':'$1,000.00','Tax on interest':'$0.00'},false],
 ]){
  await page.goto(base+'/cd-calculator.html?mode=accumulation&'+query);await page.waitForFunction(value=>document.querySelector('.metric.primary strong')?.textContent?.trim()===value,expected['After-tax balance']);await amounts(expected);assert.equal(await page.locator('.workspace-chart').count(),Number(hasChart));await overflow();checks.push({query,amounts:true,zeroTermHasNoEmptyChart:!hasChart});
 }
 await page.goto(base+'/cd-calculator.html');await page.locator('.result h2').waitFor();await page.locator('#cd-accumulation-principal').fill('');assert.equal(await page.locator('.result').count(),0);await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await page.locator('.result').count(),0);await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();await amounts();checks.push('Edits/invalid fields clear stale results; reset recalculates original values');
 await page.setViewportSize({width:1440,height:1000});
 for(const [id,sidebar,result] of [['loan',220,512],['401k',280,650]]){await page.goto(base+'/'+id+'-calculator.html');await page.locator('.result h2').waitFor();assert.equal(await page.locator('.cd-page').count(),0);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),sidebar);assert.equal(Math.round((await page.locator('.result').boundingBox()).width),result);if(id==='loan')await page.locator('.result-trend svg').waitFor();assert.equal(await page.locator('.workspace-chart').count(),0);checks.push({id,unaffectedLayout:true});}
 await page.goto(base+'/financial-calculator.html');await page.getByRole('combobox',{name:'Find a calculator'}).fill('401');assert.deepEqual(await page.getByRole('option').allTextContents(),['401K Calculator']);checks.push('Homepage search remains accurate');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}});await nojs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());const staticPage=await nojs.newPage();await staticPage.goto(base+'/cd-calculator.html');assert.equal(await staticPage.locator('.result .metric').count(),4);for(const value of Object.values(defaults))assert.ok((await staticPage.locator('.result').innerText()).includes(value));await staticPage.locator('.workspace-chart > summary').click();assert.ok(await staticPage.locator('.workspace-chart svg').isVisible());checks.push('Four values and native chart disclosure work without JavaScript');await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);const report={checks,errors,unexpected,tested_at:new Date().toISOString(),ads:'Only approved loader stubbed; no real ad placement test'};await fs.writeFile('docs/financial-clone/evidence/browser-cd-layout-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.kill();}
