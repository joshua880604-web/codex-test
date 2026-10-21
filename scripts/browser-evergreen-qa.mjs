import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const checks=[],errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));context.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3000')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
await fs.mkdir('/workspace/work/evergreen',{recursive:true});
try{
 for(const id of ['markup','cagr','emergency-fund','break-even','investment-fee','real-return']){
  await page.goto('http://127.0.0.1:3000/'+id+'-calculator.html');const tabs=page.getByRole('tab');const count=await tabs.count();
  for(let i=0;i<count;i++){await tabs.nth(i).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error').count(),0);assert.ok(!/NaN|Infinity/.test(await page.locator('.result').innerText()));checks.push({id,mode:await tabs.nth(i).innerText(),passed:true});}
  await tabs.first().click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.share-panel').waitFor();
  const first=await page.locator('.metric.primary strong').innerText();await page.locator('.share-options > summary').click();await page.getByLabel('Include current inputs in the link',{exact:true}).check();await page.getByRole('button',{name:'Copy link',exact:true}).click();await page.getByText('Recalculable link copied. It includes your input values.',{exact:true}).waitFor();const link=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(link.includes('#calc='));await page.goto(link);await page.locator('.metric.primary strong').waitFor();assert.equal(await page.locator('.metric.primary strong').innerText(),first);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await(await download).saveAs('/workspace/work/evergreen/'+id+'.png');
  for(const width of [1440,390]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.result').screenshot({path:`/workspace/work/evergreen/${id}-${width}.png`});}
  checks.push({id,sharing:'roundtrip',png:true,desktopMobile:true});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await fs.writeFile('docs/financial-clone/evidence/browser-evergreen-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors,external},null,2));console.log({checks:checks.length,modes:19,errors:errors.length,external:external.length});
}finally{await browser.close();}
