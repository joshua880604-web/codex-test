import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:3000',dir='/workspace/work/automatic-pmi-20261026';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],unexpected=[];
const route=r=>{const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();if(u==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({body:'',contentType:'text/javascript'});unexpected.push(u);return r.abort();};
try {
 const ctx=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce'});await ctx.route('**/*',route);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 const visit=async(v={},mode='monthly')=>{await page.goto(base+'/mortgage-calculator.html?'+new URLSearchParams({mode,...v}),{waitUntil:'networkidle'});};
 const result=async()=>{await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 const metric=label=>page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
 const more=async()=>{const d=page.locator('.calculator-form details.advanced');if(await d.getAttribute('open')===null)await d.locator(':scope > summary').click();};
 const breakdown=async()=>{const d=page.locator('.workspace-breakdown');if(await d.count()&&await d.getAttribute('open')===null)await d.locator(':scope > summary').click();};
 const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();};
 const csv=async(name)=>{const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const d=await pending,p=dir+'/'+name+'.csv';await d.saveAs(p);return (await fs.readFile(p,'utf8')).trim().split(/\r?\n/).map(line=>line.split(',').map(cell=>cell.replace(/^"|"$/g,'')));};
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});await visit();await result();await more();
  assert.equal(await page.getByLabel('PMI calculation',{exact:true}).inputValue(),'Automatic estimate');assert.equal(await page.getByLabel('Credit score range for PMI',{exact:true}).inputValue(),'740-759');assert.equal(await page.getByLabel('Annual PMI',{exact:true}).count(),0);assert.equal(await metric('Initial monthly PMI').innerText(),'$0.00');
  checks.push({width,case:'default automatic, explicit credit assumption, hidden manual premium',passed:true});

  await page.locator('#mortgage-monthly-down').fill('4');await page.locator('#mortgage-monthly-down').press('Enter');await result();await breakdown();
  assert.equal(await metric('Initial monthly PMI').innerText(),'$224.00');assert.equal(await metric('Estimated annual PMI rate').innerText(),'0.70%');assert.equal(await metric('Initial monthly total').innerText(),'$3,051.27');assert.match(await page.locator('.result').innerText(),/credit score 740-759.*actual lender pricing may differ/);
  await page.locator('.workspace-report-chart .result-trend').waitFor();await page.locator('.workspace-report-details .workspace-details > summary').click();const monthly=await csv('automatic-monthly-'+width);const pmi=monthly[0].indexOf('PMI');assert.equal(pmi,8);assert.equal(monthly.length,361);assert.equal(Number(monthly[1][pmi]),224);
  await page.getByRole('button',{name:'Yearly',exact:true}).click();const yearly=await csv('automatic-yearly-'+width);assert.equal(yearly.length,31);assert.ok(Math.abs(monthly.slice(1).reduce((s,row)=>s+Number(row[pmi]),0)-yearly.slice(1).reduce((s,row)=>s+Number(row[pmi]),0))<.005);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('.result').evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
  if(width===1440){assert.equal(Math.round((await page.locator('.page-wrap').boundingBox()).width),1120);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);}
  await page.locator('.calculator-workspace').screenshot({path:dir+'/automatic-4-'+width+'.png'});checks.push({width,case:'4% down, keyboard calculation, PMI rate/amount, chart, monthly/yearly CSV and preserved frame',passed:true});

  await page.locator('#mortgage-monthly-down').fill('15');await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$56.67');assert.equal(await metric('Initial monthly total').innerText(),'$2,620.14');
  await page.locator('#mortgage-monthly-down').fill('20');await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$0.00');assert.equal(await metric('Initial monthly total').innerText(),'$2,443.56');checks.push({width,case:'15% and 20% down update PMI without changing home insurance',passed:true});

  await visit({down:'4'});await result();await more();await page.getByLabel('Credit score range for PMI',{exact:true}).selectOption('760+');await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$185.60');checks.push({width,case:'credit score changes sourced estimate',passed:true});
  await visit({down:'60000',down_unit:'Dollars'});await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$56.67');checks.push({width,case:'dollar down payment gives same LTV estimate',passed:true});
  await visit({down:'20',appraised_value:'350000'});await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$141.33');checks.push({width,case:'original lower purchase appraisal changes automatic PMI',passed:true});

  await visit({down:'4'});await result();await more();await page.getByLabel('PMI calculation',{exact:true}).selectOption('Manual');assert.equal(await page.getByLabel('Credit score range for PMI',{exact:true}).count(),0);await page.getByLabel('Annual PMI',{exact:true}).fill('1200');await page.getByLabel('PMI duration',{exact:true}).fill('1');await calculate();await result();await breakdown();assert.equal(await metric('Initial monthly PMI').innerText(),'$100.00');assert.equal(await metric('Total PMI').innerText(),'$1,200.00');
  await more();await page.getByLabel('PMI cancellation',{exact:true}).selectOption('Cancel at 80% original LTV');assert.equal(await page.getByLabel('PMI duration',{exact:true}).count(),0);await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$100.00');
  await more();await page.getByLabel('PMI calculation',{exact:true}).selectOption('Automatic estimate');await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$224.00');checks.push({width,case:'manual quote/duration/cancellation and switching back to automatic',passed:true});

  await visit({down:'0'});assert.match(await page.locator('.error[role="alert"]').innerText(),/up to 97%/);await more();await page.getByLabel('PMI calculation',{exact:true}).selectOption('Manual');await calculate();await result();assert.equal(await metric('Initial monthly PMI').innerText(),'$0.00');checks.push({width,case:'unsupported automatic LTV errors and manual recovery',passed:true});
  await visit({down:'4',years:'41'});assert.match(await page.locator('.error[role="alert"]').innerText(),/up to 40 years/);checks.push({width,case:'unsupported automatic term does not silently extrapolate',passed:true});
  await visit({down:'100'});await result();assert.match(await page.locator('.result').innerText(),/No mortgage loan is needed/);assert.equal(await page.getByRole('button',{name:'Download CSV',exact:true}).count(),0);checks.push({width,case:'cash purchase keeps no-loan state',passed:true});
  await visit({down:'0',pmi_method:'Automatic estimate',pmi_credit:'bad',pmi:'bad'},'biweekly');await result();await more();assert.equal(await page.getByLabel('PMI calculation',{exact:true}).count(),0);assert.equal(await page.getByLabel('Annual PMI',{exact:true}).count(),0);checks.push({width,case:'biweekly excludes PMI controls and ignores stale values',passed:true});
  await visit({down:'4',pmi:'0',pmi_years:'1'});await result();await more();assert.equal(await page.getByLabel('PMI calculation',{exact:true}).inputValue(),'Manual');assert.equal(await metric('Initial monthly PMI').innerText(),'$0.00');checks.push({width,case:'legacy explicit zero quote is preserved',passed:true});
 }
 for(const id of ['fha-loan','va-mortgage']){await page.goto(base+'/'+id+'-calculator.html',{waitUntil:'networkidle'});await result();assert.equal(await page.getByLabel('PMI calculation',{exact:true}).count(),0);checks.push({case:id+' keeps program-specific rules',passed:true});}
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.route('**/*',route);const np=await nojs.newPage();await np.goto(base+'/mortgage-calculator.html');assert.equal(await np.getByLabel('PMI calculation',{exact:true}).inputValue(),'Automatic estimate');assert.ok((await np.locator('.result').innerText()).includes('Initial monthly PMI'));checks.push({case:'server-rendered automatic defaults without JavaScript',passed:true});await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-automatic-pmi-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors,unexpected,passed:true,scope:'Local production build; exact existing publisher loader stubbed. Direct live-origin and reference-site parity unverified.'},null,2)+'\n');console.log({checks:checks.length,passed:true});
} finally {await browser.close();}
