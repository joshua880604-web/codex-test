import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE??'http://127.0.0.1:3100',dir='/workspace/work/mortgage-inputs-20261026';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],unexpected=[];
const route=r=>{const u=r.request().url();if(u.startsWith(base+'/')||u.startsWith('blob:')||u.startsWith('data:'))return r.continue();if(u==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({body:'',contentType:'text/javascript'});unexpected.push(u);return r.abort();};
try {
 const ctx=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce'});await ctx.route('**/*',route);
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
 const visit=async(v={})=>page.goto(base+'/mortgage-calculator.html?'+new URLSearchParams({mode:'monthly',...v}),{waitUntil:'networkidle'});
 const result=async()=>{await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 const metric=label=>page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
 const open=async(group)=>{const d=page.locator(`[data-mortgage-group="${group}"]`);if(await d.getAttribute('open')===null)await d.locator(':scope > summary').click();};
 const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();};
 const input=key=>page.locator('#mortgage-monthly-'+key);
 const csv=async(name)=>{const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const d=await pending;await d.saveAs(dir+'/'+name+'.csv');return (await fs.readFile(dir+'/'+name+'.csv','utf8')).trim().split(/\r?\n/).map(line=>line.split(',').map(cell=>cell.replace(/^"|"$/g,'')));};
 for(const width of [320,390,414,768,1440]) {
  const height=width===768?1024:width>=1024?900:844;
  await page.setViewportSize({width,height});await visit();await result();await page.evaluate(()=>scrollTo(0,0));
  assert.equal(await page.locator('.mortgage-options[open]').count(),0);assert.equal(await metric('Monthly principal & interest').innerText(),'$1,918.56');assert.equal(await metric('Total interest').isVisible(),true);
  const action=await page.getByRole('button',{name:'Calculate',exact:true}).boundingBox();
  assert.ok(action.y+action.height<=height,`Calculate outside first screen at ${width}: ${action.y+action.height}`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440){assert.equal(Math.round((await page.locator('.page-wrap').boundingBox()).width),1120);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);}
  assert.equal(await page.locator('.calculator-form').evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
  await page.screenshot({path:dir+'/purchase-'+width+'.png'});checks.push({width,case:'compact purchase default, closed groups, visible interest, first-screen Calculate, no overflow, preserved frame',calculateBottom:action.y+action.height,passed:true});

  await input('down').fill('4');await input('down').press('Enter');await result();await open('pmi');assert.equal(await input('pmi_method').inputValue(),'Automatic estimate');assert.equal(await input('pmi_credit').inputValue(),'740-759');
  assert.match(await page.locator('.result-context').innerText(),/\$224\.00/);checks.push({width,case:'purchase automatic PMI and keyboard submit',passed:true});

  await page.getByRole('radio',{name:'Loan amount',exact:true}).check();assert.equal(await input('loan_amount').inputValue(),'384000');assert.equal(await input('price').count(),0);assert.equal(await page.locator('.result').count(),0);
  await input('loan_amount').fill('100000');await calculate();await result();assert.equal(await metric('Monthly principal & interest').innerText(),'$599.55');await open('pmi');assert.equal(await input('pmi_method').inputValue(),'Manual');assert.equal(await input('property_value').inputValue(),'');
  assert.equal(await input('pmi_credit').count(),0);checks.push({width,case:'direct amount preserves principal on switch, defaults manual PMI, clears stale result',passed:true});

  await page.getByRole('radio',{name:'Home price + down payment',exact:true}).check();assert.equal(await input('pmi_method').inputValue(),'Automatic estimate');
  await page.getByRole('radio',{name:'Loan amount',exact:true}).check();assert.equal(await input('pmi_method').inputValue(),'Manual');
  assert.equal(await input('loan_amount').inputValue(),'100000');checks.push({width,case:'returning to either input basis restores its own PMI settings',passed:true});

  await input('loan_amount').fill('340000');await input('property_value').fill('400000');await input('pmi_method').selectOption('Automatic estimate');await calculate();await result();assert.match(await page.locator('.result-context').innerText(),/\$56\.67/);
  await input('property_value').fill('');await calculate();await page.locator('.error').waitFor();assert.match(await page.locator('.error').innerText(),/original home value/);assert.equal(await page.locator('[data-mortgage-group="pmi"]').getAttribute('open'),'');
  await input('pmi_method').selectOption('Manual');await input('loan_amount').fill('100000');await open('housing');await input('tax').fill('0');await input('insurance').fill('0');
  await open('extras');await input('extra_monthly').fill('100');await calculate();await result();assert.equal(await metric('Interest saved with extra payments').innerText(),'$39,900.25');assert.equal(await metric('Payments avoided').innerText(),'108');
  checks.push({width,case:'explicit home value controls PMI, missing value errors, manual recovery, independent savings control',passed:true});

  await page.locator('.workspace-report-chart .result-trend').waitFor();await page.locator('.workspace-report-details .workspace-details > summary').click();
  const chart=await page.locator('.workspace-report-chart').boundingBox(),workspace=await page.locator('.calculator-workspace').boundingBox();assert.ok(chart.width>=workspace.width-2);assert.ok(chart.y>=workspace.y);
  const monthly=await csv('monthly-'+width);assert.equal(monthly.length,253);assert.equal(monthly[0].at(-1),'PMI');
  await page.getByRole('button',{name:'Yearly',exact:true}).click();const yearly=await csv('yearly-'+width);assert.equal(yearly.length,22);
  const interest=rows=>rows.slice(1).reduce((sum,row)=>sum+Number(row[3]),0);assert.ok(Math.abs(interest(monthly)-interest(yearly))<.005);
  await page.locator('.workspace-report-chart').screenshot({path:dir+'/chart-'+width+'.png'});checks.push({width,case:'full-width chart and reconciled monthly/yearly CSV',passed:true});

  await page.getByRole('tab',{name:'Biweekly Comparison'}).click();assert.equal(await page.locator('#mortgage-biweekly-loan_amount').inputValue(),'100000');assert.equal(await page.locator('[data-mortgage-group="pmi"]').count(),0);assert.equal(await page.locator('[data-mortgage-group="housing"]').count(),0);
  await calculate();await result();assert.equal(await metric('Biweekly payment').innerText(),'$299.78');
  await page.getByRole('tab',{name:'Monthly Mortgage'}).click();assert.equal(await input('extra_monthly').inputValue(),'100');
  await page.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await page.getByRole('radio',{name:'Home price + down payment',exact:true}).isChecked(),true);assert.equal(await input('price').inputValue(),'400000');assert.equal(await page.locator('.result').count(),0);
  checks.push({width,case:'biweekly shares loan draft and excludes costs; reset restores purchase defaults',passed:true});
 }
 await visit({loan_basis:'Loan amount',loan_amount:'12000',years:'1',rate:'0',tax:'0',insurance:'0'});await result();assert.equal(await metric('Monthly principal & interest').innerText(),'$1,000.00');await open('pmi');assert.equal(await input('pmi_method').inputValue(),'Manual');checks.push({case:'direct query hydrates with manual PMI',passed:true});
 for(const id of ['fha-loan','va-mortgage','cd','loan']){await page.goto(base+'/'+id+'-calculator.html',{waitUntil:'networkidle'});await result();assert.equal(await page.locator('.mortgage-fields').count(),0);checks.push({case:id+' retained',passed:true});}
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.route('**/*',route);const np=await nojs.newPage();await np.goto(base+'/mortgage-calculator.html');assert.equal(await np.locator('.mortgage-fields').count(),1);assert.equal(await np.locator('.result').count(),1);checks.push({case:'server-rendered form and default result remain available',passed:true});await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-mortgage-inputs-qa.json',JSON.stringify({tested_at:new Date().toISOString(),passed:true,checks,errors,unexpected,scope:'Production static export in Chromium. Native Safari/iPhone not tested. Existing publisher loader stubbed.'},null,2)+'\n');console.log({passed:true,checks:checks.length});
} catch(error) {await fs.writeFile(dir+'/browser-failure.json',JSON.stringify({error:String(error),checks,errors,unexpected},null,2));throw error;} finally {await browser.close();}
