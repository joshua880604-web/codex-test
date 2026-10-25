import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:3000',dir='/workspace/work/us-formula-fixes-20261025';
await fs.mkdir(dir,{recursive:true});
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const route=id=>catalog.find(c=>c.id===id).local_route;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],unexpected=[],checks=[];
try{
 const context=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});
 await context.route('**/*',r=>{
  const url=r.request().url();
  if(url.startsWith(base+'/'))return r.continue();
  if(url==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({contentType:'text/javascript',body:''});
  unexpected.push(url);return r.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const openAdvanced=async()=>{const box=page.locator('.advanced');if(await box.count()&&(await box.getAttribute('open')===null))await box.locator('summary').click();};
 const openBreakdown=async()=>{const box=page.locator('.workspace-breakdown');if(await box.count()&&(await box.getAttribute('open')===null))await box.locator('summary').click();if(await box.count())await box.locator('.metric').first().waitFor();};
 const figure=label=>page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
 const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 const visit=async(id,mode,values={})=>{await page.goto(base+route(id)+'?'+new URLSearchParams({mode,...values}),{waitUntil:'networkidle'});await page.locator('[id^="'+id+'-'+mode+'-"]').first().waitFor({state:'attached'});await page.locator('.result h2').waitFor();};
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  await visit('fha-loan','monthly');
  assert.equal(await page.locator('#fha-loan-monthly-mip_method').inputValue(),'Automatic');
  assert.equal(await page.locator('#fha-loan-monthly-annual_mip').count(),0);
  await openBreakdown();assert.equal(await figure('Initial monthly FHA MIP').innerText(),'$132.59');assert.equal(await figure('FHA MIP duration in years').innerText(),'11');
  await page.locator('.workspace-report-chart .result-trend').waitFor();
  await page.locator('.calculator-scope').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:dir+'/fha-default-'+width+'.png'});
  await page.locator('.workspace-report-details .workspace-details > summary').click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const download=await downloadPromise;const file=dir+'/fha-schedule-'+width+'.csv';await download.saveAs(file);
  const csv=(await fs.readFile(file,'utf8')).replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.slice(1,-1).split('","'));
  assert.equal(csv[0].at(-1),'FHA MIP');assert.equal(csv.length,361);assert.equal(Number(csv[1].at(-1)),132.59);assert.equal(Number(csv[133].at(-1)),0);
  await page.getByRole('button',{name:'Yearly',exact:true}).click();assert.match(await page.locator('.workspace-report-details table').innerText(),/1,591\.08/);await page.getByRole('button',{name:'Monthly',exact:true}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440){assert.equal(Math.round((await page.locator('.page-wrap').boundingBox()).width),1120);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);}
  await page.locator('#fha-loan-monthly-down').fill('3.5');await calculate();await openBreakdown();assert.equal(await figure('Annual FHA MIP rate').innerText(),'0.5500%');assert.equal(await figure('FHA MIP duration in years').innerText(),'30');
  await page.locator('#fha-loan-monthly-mip_method').selectOption('Manual');await openAdvanced();assert.equal(await page.locator('#fha-loan-monthly-annual_mip').inputValue(),'0.55');
  await page.locator('#fha-loan-monthly-annual_mip').fill('.75');await page.locator('#fha-loan-monthly-mip_years').fill('11');await calculate();await openBreakdown();assert.equal(await figure('Annual FHA MIP rate').innerText(),'0.7500%');assert.equal(await figure('FHA MIP duration in years').innerText(),'11');
  await page.locator('#fha-loan-monthly-upfront').fill('');await page.locator('#fha-loan-monthly-mip_method').selectOption('Automatic');await calculate();await openBreakdown();assert.equal(await figure('Annual FHA MIP rate').innerText(),'0.5500%');
  await page.locator('#fha-loan-monthly-down').fill('20');await page.locator('#fha-loan-monthly-appraised_value').fill('350000');await calculate();await openBreakdown();assert.equal(await figure('FHA MIP duration in years').innerText(),'30');assert.equal(await figure('FHA loan-to-value ratio').innerText(),'91.4286%');
  await visit('fha-loan','monthly',{upfront:'0',annual_mip:'0',mip_years:'0'});assert.equal(await page.locator('#fha-loan-monthly-mip_method').inputValue(),'Manual');await openBreakdown();assert.equal(await figure('Total FHA MIP').innerText(),'$0.00');
  checks.push({width,fhaAutoRatesAndDuration:true,manualOverride:true,invalidManualToAutoRecovery:true,appraisalLtv:true,legacyLink:true,csvPremiums:true,principalCurvePreserved:true});

  await visit('income-tax','federal',{year:'2025',wages:'20000',interest:'13000',children:'1',education0:'4000',education_type0:'American Opportunity',aotc_refundable:'Yes',withheld:'0'});
  assert.equal(await figure('Estimated federal income tax').innerText(),'-$2,700.00');assert.equal(await figure('Estimated refund').innerText(),'$2,700.00');
  await visit('income-tax','federal',{year:'2025',filing:'Married filing separately',wages:'0',business:'10000',children:'1',withheld:'0'});assert.equal(await figure('Estimated federal income tax').innerText(),'$393.93');
  await visit('income-tax','federal',{year:'2025',filing:'Married filing separately',wages:'0',social:'40000',mfs_lived_apart:'Yes',withheld:'0'});assert.equal(await figure('Estimated federal income tax').innerText(),'$0.00');
  await openAdvanced();await page.locator('#income-tax-federal-mfs_lived_apart').selectOption('No');await calculate();assert.equal(await figure('Estimated federal income tax').innerText(),'$125.00');
  await page.locator('#income-tax-federal-filing').selectOption('Single');assert.equal(await page.locator('#income-tax-federal-mfs_lived_apart').count(),0);await calculate();assert.equal(await figure('Estimated federal income tax').innerText(),'$0.00');
  await visit('income-tax','federal',{year:'2026',wages:'1000000',itemized:'100000',withheld:'0'});assert.equal(await figure('Estimated federal income tax').innerText(),'$298,157.25');
  assert.match(await page.locator('tr').filter({hasText:'2026 overall itemized deduction reduction'}).innerText(),/5,405\.41/);
  await page.locator('.result').screenshot({path:dir+'/tax-high-income-'+width+'.png'});
  await visit('take-home-paycheck','paycheck',{filing:'Married filing separately',wages:'0',social:'40000',mfs_lived_apart:'Yes',pretax:'0',state_rate:'0'});assert.equal(await figure('Annual take-home pay').innerText(),'$0.00');
  await visit('marriage-tax','comparison',{wages:'20000',interest:'13000',children:'1',education0:'4000',education_type0:'American Opportunity',aotc_refundable:'Yes',p2_aotc_refundable:'Yes'});assert.equal(await figure('Your unmarried federal tax').innerText(),'-$2,700.00');assert.equal(await figure('Married filing jointly tax').innerText(),'-$2,700.00');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  checks.push({width,childAndEducationCredits:true,selfEmploymentActc:true,mfsResidence:true,section68:true,sharedPaycheckAndMarriageRules:true});
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());const plain=await nojs.newPage();await plain.goto(base+route('fha-loan'));assert.equal(await plain.locator('#fha-loan-monthly-mip_method').inputValue(),'Automatic');await plain.locator('.workspace-breakdown > summary').click();assert.equal(await plain.locator('.metric').filter({has:plain.getByText('Initial monthly FHA MIP',{exact:true})}).locator('strong').innerText(),'$132.59');await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 const report={passed:true,checks,noJavaScriptDefaultPremium:true,errors,unexpected,tested_at:new Date().toISOString(),ads:'Exact existing publisher loader stubbed; no live-ad claim'};
 await fs.writeFile('docs/financial-clone/evidence/browser-us-rule-fixes-qa.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await fs.writeFile(dir+'/browser-progress.json',JSON.stringify({checks,errors,unexpected},null,2));await browser.close();}
