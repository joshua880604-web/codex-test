import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:3000',dir='/workspace/work/policy-fixes-20261025';
await fs.mkdir(dir,{recursive:true});
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],unexpected=[],checks=[];
try{
 const context=await browser.newContext({reducedMotion:'reduce'});
 await context.route('**/*',r=>{
  const url=r.request().url();if(url.startsWith(base+'/'))return r.continue();
  if(url==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({contentType:'text/javascript',body:''});
  unexpected.push(url);return r.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const visit=async(id,mode,values={})=>{await page.goto(base+catalog.find(c=>c.id===id).local_route+'?'+new URLSearchParams({mode,...values}),{waitUntil:'networkidle'});await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 const figure=label=>page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
 const row=label=>page.locator('tr').filter({has:page.getByText(label,{exact:true})});
 const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 const more=async()=>{for(const box of await page.locator('.calculator-form details.advanced').all())if(await box.getAttribute('open')===null)await box.locator(':scope > summary').click();};
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  await visit('income-tax','federal',{wages:'200000',passive:'100000',withheld:'0'});
  assert.match(await row('Net investment income tax').innerText(),/3,800/);assert.equal(await figure('Adjusted gross income').innerText(),'$300,000.00');
  await more();await page.locator('#income-tax-federal-passive_niit').selectOption('No');await calculate();assert.equal((await row('Net investment income tax').innerText()).split('\t').at(-1),'0');
  await visit('income-tax','federal',{filing:'Married filing separately',wages:'80000',mfs_spouse_itemizes:'Yes',withheld:'0'});
  assert.equal(await figure('Estimated federal income tax').innerText(),'$12,312.00');await more();assert.equal(await page.locator('#income-tax-federal-mfs_spouse_itemizes').inputValue(),'Yes');
  await page.locator('#income-tax-federal-filing').selectOption('Single');assert.equal(await page.locator('#income-tax-federal-mfs_spouse_itemizes').count(),0);await calculate();assert.equal(await figure('Estimated federal income tax').innerText(),'$8,770.00');
  await visit('income-tax','federal',{year:'2025',filing:'Married filing separately',wages:'100000',amt:'820350'});
  assert.equal(await figure('Estimated federal income tax').innerText(),'$256,707.00');assert.match(await row('MFS special AMTI increase').innerText(),/5,000/);
  await visit('income-tax','federal',{year:'2026',filing:'Married filing separately',wages:'100000',amt:'650000'});
  assert.equal(await figure('Estimated federal income tax').innerText(),'$222,927.00');assert.match(await row('MFS special AMTI increase').innerText(),/54,900/);
  await visit('income-tax','federal',{wages:'50000',business:'1500',qbi:'Yes',qbi_active:'Yes'});
  assert.equal((await row('Eligible QBI deduction').innerText()).split('\t').at(-1),'400');await more();assert.equal(await page.locator('#income-tax-federal-qbi_active').inputValue(),'Yes');assert.equal(await page.locator('#income-tax-federal-spouse_qbi_active').count(),0);
  await page.locator('#income-tax-federal-year').selectOption('2025');assert.equal(await page.locator('#income-tax-federal-qbi_active').count(),0);await calculate();assert.match(await row('Eligible QBI deduction').innerText(),/278\.81/);
  await page.locator('#income-tax-federal-year').selectOption('2026');await calculate();assert.equal((await row('Eligible QBI deduction').innerText()).split('\t').at(-1),'400');
  await page.locator('.result').screenshot({path:dir+'/qbi-result-'+width+'.png'});
  await visit('take-home-paycheck','source-paycheck',{file_status:'Married filing separately',salary:'80000',pretax:'0',state_rate:'0',mfs_spouse_itemizes:'Yes'});
  await more();assert.equal(await page.locator('#take-home-paycheck-source-paycheck-mfs_spouse_itemizes').inputValue(),'Yes');
  await page.locator('#take-home-paycheck-source-paycheck-file_status').selectOption('Single');assert.equal(await page.locator('#take-home-paycheck-source-paycheck-mfs_spouse_itemizes').count(),0);await calculate();
  await visit('take-home-paycheck','paycheck',{wages:'200000',passive:'100000',pretax:'0',state_rate:'0'});assert.ok(await figure('Annual take-home pay').isVisible());
  await visit('marriage-tax','comparison',{wages:'50000',p2_wages:'50000',business:'600',p2_business:'600',qbi:'Yes',p2_qbi:'Yes',qbi_active:'Yes',p2_qbi_active:'Yes'});
  assert.equal(await figure('Married filing jointly tax').innerText(),'$7,895.38');await more();assert.equal(await page.locator('#marriage-tax-comparison-qbi_active').count(),1);assert.equal(await page.locator('#marriage-tax-comparison-p2_qbi_active').count(),1);
  // The paired layout must remain intact when only one partner elects QBI.
  await page.locator('#marriage-tax-comparison-qbi').selectOption('No');await calculate();assert.equal(await page.locator('#marriage-tax-comparison-p2_qbi_active').count(),1);
  await page.locator('#marriage-tax-comparison-p2_qbi').selectOption('No');assert.equal(await page.locator('#marriage-tax-comparison-p2_qbi_active').count(),0);await calculate();
  checks.push({width,niitIncomeAndExclusion:true,mfsStandardDeduction:true,amt2025And2026:true,qbiEligibilityAndYear:true,sharedPaycheck:true,pairedMarriageFields:true});

  await visit('va-mortgage','monthly',{price:'400000',down:'0',repeat:'Only a manufactured home'});
  await more();assert.equal(await page.locator('#va-mortgage-monthly-repeat').inputValue(),'Only a manufactured home');assert.equal(await page.locator('#va-mortgage-monthly-pmi').count(),0);
  const breakdown=page.locator('.workspace-breakdown');if(await breakdown.count()&&await breakdown.getAttribute('open')===null)await breakdown.locator('summary').click();assert.equal(await figure('Upfront fee').innerText(),'$8,600.00');
  await page.locator('#va-mortgage-monthly-repeat').selectOption('Yes');await calculate();if(await breakdown.count()&&await breakdown.getAttribute('open')===null)await breakdown.locator('summary').click();assert.equal(await figure('Upfront fee').innerText(),'$13,200.00');
  await visit('va-mortgage','biweekly',{price:'400000',down:'0',repeat:'Only a manufactured home'});assert.ok(await figure('Biweekly payment').isVisible());
  await visit('social-security','ideal');assert.equal(await figure('Highest present-value application age').innerText(),'70');assert.match(await page.locator('.calculator-scope').innerText(),/age-62 dollars/);
  await page.locator('.result').screenshot({path:dir+'/social-result-'+width+'.png'});
  await visit('social-security','compare',{age1:'62',monthly1:'1000',age2:'63',monthly2:'1100',life:'64',return:'0',cola:'2'});
  assert.equal(await figure('First option present value').innerText(),'$24,240.00');assert.equal(await figure('Second option present value').innerText(),'$13,200.00');
  await visit('rmd','annual');assert.match(await page.locator('.calculator-scope').innerText(),/non-Roth/);
  await visit('401k','projection');assert.match(await page.locator('.calculator-scope').innerText(),/catch-up must be Roth/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440){assert.equal(Math.round((await page.locator('.page-wrap').boundingBox()).width),1120);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);}
  checks.push({width,vaPriorUse:true,vaBiweekly:true,vaIgnoresPmi:true,socialColaBasis:true,claimDateQuotes:true,rmdRothScope:true,catchupScope:true,layoutPreserved:true});
 }
 const plainContext=await browser.newContext({javaScriptEnabled:false});await plainContext.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const plain=await plainContext.newPage();await plain.goto(base+catalog.find(c=>c.id==='social-security').local_route);assert.equal(await plain.locator('.metric').filter({has:plain.getByText('Highest present-value application age',{exact:true})}).locator('strong').innerText(),'70');await plainContext.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 const report={passed:true,checks,noJavaScriptDefault:true,errors,unexpected,tested_at:new Date().toISOString(),ads:'Exact existing AdSense loader stubbed; no live-ad claim.'};
 await fs.writeFile('docs/financial-clone/evidence/browser-policy-fixes-qa.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{await fs.writeFile(dir+'/browser-progress.json',JSON.stringify({checks,errors,unexpected},null,2));await browser.close();}
