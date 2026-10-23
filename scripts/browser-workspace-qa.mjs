import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const dir='/workspace/work/svg-workspace',base='http://127.0.0.1:3000',checks=[],errors=[],external=[];
await fs.mkdir(dir,{recursive:true});
const page=await browser.newPage({acceptDownloads:true,reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
const tools=[['compound-interest',['conversion','growth']],['investment',['end','contribution','return','starting','length']],['loan',['amortized','deferred','bond']]];
try {
 for(const width of [320,390,768,1024,1440]) {
  await page.setViewportSize({width,height:900});
  for(const [id,modes] of tools) {
   await page.goto(`${base}/${id}-calculator.html`);await page.locator('.result h2').waitFor();
   for(const mode of modes) {
    await selectCalculatorMode(page,mode);
    await page.getByRole('button',{name:'Calculate',exact:true}).click();
    await page.locator('.result h2').waitFor();
    const chart=(id==='compound-interest'&&mode==='growth')||id==='investment'||mode==='amortized';
    if(chart) {
     await page.locator('.result-trend svg').waitFor();
     const svg=page.locator('.result-trend svg');assert.equal(await svg.getAttribute('role'),'img');
     assert.ok((await svg.locator('desc').textContent()).includes('USD'));
     assert.ok(!/NaN|Infinity/.test(await svg.innerHTML()));
    } else assert.equal(await page.locator('.result-trend').count(),0);
    const {input,result}=await page.evaluate(()=>({input:document.querySelector('#calculator-panel').getBoundingClientRect().toJSON(),result:document.querySelector('.result').getBoundingClientRect().toJSON()}));
    if(width>800) assert.ok(result.x>input.x+input.width&&Math.abs(result.y-input.y)<2,`${width} ${id}: desktop columns`);
    else assert.ok(result.y>=input.y+input.height,`${width} ${id}: mobile order`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${id}/${mode}: overflow`);
    assert.ok(!/NaN|Infinity/.test(await page.locator('.result').innerText()));
    await page.locator('.workspace-breakdown > summary').click();assert.ok(await page.locator('.workspace-breakdown .metric').count()>0);
    await page.locator('.workspace-details > summary').click();
    if(chart) {
     await page.locator('.table-scroll').waitFor();
     await page.getByRole('button',{name:'Yearly',exact:true}).click();
     assert.equal(await page.getByRole('button',{name:'Yearly',exact:true}).getAttribute('aria-pressed'),'true');
     const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();
     const csv=await fs.readFile(await (await pending).path(),'utf8');assert.ok(csv.includes('Year')||csv.includes('Loan year'));
    }
    await page.locator('.workspace-breakdown > summary').click();await page.locator('.workspace-details > summary').click();
    if([390,1440].includes(width)&&chart) {await page.locator('.calculator-workspace').scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/${id}-${mode}-${width}.png`,fullPage:true});}
    checks.push({width,id,mode,chart,layout:true,breakdown:true,details:true,csv:chart});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 for(const [id,mode] of [['compound-interest','growth'],['investment','starting'],['loan','amortized']]) {
  await page.goto(`${base}/${id}-calculator.html?mode=${mode}`);await page.locator('.result-trend svg').waitFor();
  await page.locator('.workspace-sharing > summary').click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();
  const image=await pending;const bytes=await fs.readFile(await image.path());assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),1680);
  await image.saveAs(`${dir}/${id}-export.png`);
  const input=page.locator('.calculator-form input[type=number]').first();await input.fill('');
  assert.equal(await page.locator('.result-trend').count(),0);assert.equal(await page.locator('.result').count(),0);
  await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await page.locator('.result').count(),0);
  await page.getByRole('button',{name:'Reset',exact:true}).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result-trend svg').waitFor();
  checks.push({id,mode,sharedLink:true,png:'1200x1680',editingClearsChart:true,invalidClearsChart:true,reset:true});
 }
 for(const [name,query,expected] of [
  ['loss','principal=1000&years=2&rate=-10&compound=Annually&monthly=0&annual=0','-$190.00'],
  ['zero','principal=0&years=10&rate=0&monthly=0&annual=0','$0.00'],
  ['tax','principal=10000&years=2&rate=10&tax=100&monthly=0&annual=0','$0.00'],
  ['long','principal=10000&years=100&rate=5&monthly=100&annual=0',null],
 ]) {
  await page.goto(`${base}/compound-interest-calculator.html?mode=growth&${query}`);await page.locator('.result-trend svg').waitFor();
  if(expected)assert.ok((await page.locator('.result-context').textContent()).includes(expected));
  const d=await page.locator('.trend-balance').getAttribute('d');assert.ok(!/NaN|Infinity/.test(d));assert.ok(d.length<10000);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  checks.push({name,finiteSvg:true,boundedSvg:true});
 }
 // Native detail disclosures must remain usable from the keyboard.
 await page.locator('.workspace-details > summary').focus();await page.keyboard.press('Enter');
 assert.ok(await page.locator('.workspace-details').evaluate(el=>el.open));
 checks.push({keyboardDisclosure:true});
 await page.locator('.workspace-details > summary').click();
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 assert.ok(await page.locator('.workspace-details').evaluate(el=>el.open));assert.ok(await page.locator('.workspace-breakdown').evaluate(el=>el.open));
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 assert.equal(await page.locator('.workspace-details').evaluate(el=>el.open),false);
 assert.equal(await page.locator('.workspace-breakdown').evaluate(el=>el.open),false);
 checks.push({printOpensDetailsAndRestoresDisclosures:true});
 // Default investment and loan charts must already be in server-rendered HTML.
 const staticPage=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const id of ['investment','loan']) {await staticPage.goto(`${base}/${id}-calculator.html`);await staticPage.locator('.result-trend svg').waitFor();checks.push({id,serverRenderedSvg:true});}
 await staticPage.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await fs.writeFile(`${dir}/browser.json`,JSON.stringify({passed:true,checks,errors,external},null,2));console.log({checks:checks.length,errors:errors.length,external:external.length});
} finally {await browser.close();}
