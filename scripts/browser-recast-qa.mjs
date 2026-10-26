import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3620',dir=process.env.QA_EVIDENCE_DIR??'/workspace/work/recast-20261026';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],external=[];
const ad='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
const route='/mortgage-recast-calculator.html';
try{
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();if(u!==ad&&!u.startsWith('blob:')&&!u.startsWith('data:'))external.push(u);return r.fulfill({body:'',contentType:'text/javascript'});});
  const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/mortgage-recast-calculator');
  assert.equal(await page.locator('h1').innerText(),'Mortgage Recast Calculator');
  assert.equal(await page.getByRole('region',{name:'Three repayment choices table',exact:true}).locator('tbody tr').count(),3);
  assert.equal(await page.locator('.calculator-disclaimer').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const report=await page.getByRole('region',{name:'Three repayment choices',exact:true}).boundingBox();assert.ok(report.width>250);
  if(width===1440){assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);assert.ok((await page.locator('.page-wrap').boundingBox()).width<=1120);}
  checks.push({width,initial:true,comparisonRows:3,noOverflow:true,canonical:true});
  await page.screenshot({path:dir+'/recast-'+width+'.png',fullPage:true});
  for(const [label,value] of [['Current principal balance','12000'],['Current annual interest rate','0'],['Remaining term','1'],['Additional remaining months','0'],['Lump-sum principal payment now','3000'],['Recast fee (cash paid now)','100']])await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.waitForLoadState('networkidle');
  await page.locator('.metric.primary strong').filter({hasText:'$750.00'}).waitFor();
  const table=page.getByRole('region',{name:'Three repayment choices table',exact:true});
  assert.match(await table.innerText(),/750.00/);assert.match(await table.innerText(),/12,100.00/);
  assert.equal(await page.locator('.error[role=alert]').count(),0);
  checks.push({width,zeroRateRecast750:true,feeIncluded:true});
  if(width===390){
   const csvPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download comparison CSV',exact:true}).click();const csv=await csvPromise;assert.match(csv.suggestedFilename(),/comparison/);await csv.saveAs(dir+'/recast-comparison.csv');
   const contents=await fs.readFile(dir+'/recast-comparison.csv','utf8');assert.ok(contents.includes('Lump sum only; keep payment'));assert.ok(contents.includes('12100'));
   await page.locator('.workspace-details > summary').click();
   await page.getByRole('button',{name:'Yearly',exact:true}).click();assert.ok(await page.getByRole('region',{name:'Calculation detail table'}).innerText().then(t=>t.includes('Loan year')));
   await page.locator('.workspace-sharing > summary').click();
   assert.equal(await page.getByLabel('Include input details in PNG').isChecked(),false);
   const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const png=await pngPromise;await png.saveAs(dir+'/recast-result.png');
   checks.push({width,comparisonCSV:true,yearlySchedule:true,pngWithoutInputs:true});
   await page.getByLabel('Include input details in PNG').check();const detailedPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await (await detailedPromise).saveAs(dir+'/recast-inputs-result.png');
   await page.getByLabel('Lump-sum principal payment now',{exact:true}).fill('12000');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.error[role=alert]').waitFor();assert.match(await page.locator('.error[role=alert]').innerText(),/full payoff/);assert.equal(await page.locator('.metric.primary').count(),0);
   checks.push({width,fullPayoffValidation:true,noStaleResult:true,pngWithInputs:true});
  }
  await page.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false});await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());const p=await ctx.newPage();await p.goto(base+route);assert.equal(await p.getByRole('region',{name:'Three repayment choices table',exact:true}).locator('tbody tr').count(),3);assert.ok(await p.locator('.calculator-guide').innerText().then(t=>t.includes('Fannie Mae')));checks.push({serverRenderedWithoutJS:true});await ctx.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const result={passed:true,checks,errors,external,scope:'Local production export in Chromium; not native Safari or lender quote parity'};await fs.writeFile(dir+'/recast-browser-qa.json',JSON.stringify(result,null,2)+'\n');console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
