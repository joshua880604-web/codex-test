import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
import {calculatorPresetHref} from '../src/lib/preset-links.ts';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3630';
const dir=process.env.QA_EVIDENCE_DIR??'/workspace/work/preset-links-20261027';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[],errors=[],external=[],documents=[];
const ad='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
try{
 const context=await browser.newContext({reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.request().url()===ad?r.fulfill({body:'',contentType:'text/javascript'}):(external.push(r.request().url()),r.abort()));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.resourceType()==='document')documents.push(r.url());});
 const field=key=>page.locator(`form [id$="-${key}"]`);
 const value=async(key,value)=>page.waitForFunction(({key,value})=>document.querySelector(`form [id$="-${key}"]`)?.value===value,{key,value});
 const ready=async()=>{await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error[role=alert]').count(),0);};
 for(const width of [320,390,768,1440]){
  console.log('Preset navigation at '+width);
  await page.setViewportSize({width,height:900});await page.goto(base+'/cd-calculator',{waitUntil:'networkidle'});await ready();
  const first=page.getByRole('link',{name:'Use a 14-month term',exact:true});
  const href=await first.getAttribute('href');assert.equal(new URL(href,base).search,'');assert.ok(href.includes('#calc='));
  const n=documents.length;await page.evaluate(()=>window.__presetDocument='unchanged');
  await first.click();await value('years','1');await value('months','2');await ready();
  await page.waitForFunction(()=>document.activeElement?.id==='calculator-panel');
  assert.equal(await page.evaluate(()=>window.__presetDocument),'unchanged');assert.equal(documents.length,n);
  checks.push({width,samePageFragment:true,inputs:true,keyboardFocus:true,noDocumentReload:true});
  const second=page.locator('.search-tasks').getByRole('link',{name:'Open this calculation',exact:true}).first();
  await second.click();await value('years','3');await ready();
  await page.goBack();await value('years','1');await value('months','2');await ready();
  await page.goForward();await value('years','3');await ready();
  await page.goBack();await value('years','1');await page.goBack();await value('years','3');await ready();assert.equal(new URL(page.url()).hash,'');
  assert.equal(documents.length,n);checks.push({width,backForwardAndOriginalDefaults:true,noReload:true});
  await first.click();await value('years','1');await field('years').fill('4');await first.click();await value('years','1');await ready();
  assert.equal(documents.length,n);checks.push({width,repeatedPresetRestoresEditedInputs:true});
  await field('principal').fill('12345');await page.getByRole('navigation',{name:'Calculation guide sections'}).getByRole('link',{name:'Examples',exact:true}).click();await value('principal','12345');
  assert.equal(await page.locator('.result').count(),0);
  await first.click();await value('principal','10000');await ready();checks.push({width,guideAnchorPreservesEdits:true,newPresetResetsDefaults:true});
  const search=page.locator('.sidebar-search');await search.getByRole('combobox').fill('14 month CD calculator');await search.getByRole('button',{name:'Search',exact:true}).click();await ready();
  await field('principal').fill('54321');await search.getByRole('combobox').fill('14 month CD calculator');await search.getByRole('button',{name:'Search',exact:true}).click();await value('principal','10000');await ready();
  checks.push({width,repeatedSameToolSearchPreset:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===390||width===1440)await page.screenshot({path:dir+'/preset-'+width+'.png'});
 }
 // Actual static glossary and methodology anchors navigate to working presets.
 for(const [path,selector] of [['/glossary/compound-interest/','.glossary-cta'],['/methodology','.method-examples a']]){
  await page.goto(base+path,{waitUntil:'networkidle'});const a=page.locator(selector).first(),href=await a.getAttribute('href'),u=new URL(href,base),params=new URLSearchParams(u.hash.slice(6));
  assert.equal(u.search,'');await a.click();await page.waitForURL(url=>url.pathname===u.pathname&&url.hash===u.hash);await ready();
  for(const [key,v] of params)if(!['mode','share_version'].includes(key)&&await field(key).count())await value(key,v);
  checks.push({path,crossPagePresetLoads:true,noQuery:true});
 }
 await page.goto(base+'/irr-calculator',{waitUntil:'networkidle'});await page.locator('.dated-cash-flow-link a').click();await page.waitForURL(u=>u.pathname==='/average-return-calculator'&&u.hash.includes('mode=cashflows'));await page.locator('#tab-cashflows[aria-selected=true]').waitFor();await ready();checks.push({datedCashFlowCrossLink:true});
 // Legacy links keep their original parser and financial interpretation.
 await page.goto(base+'/mortgage-calculator.html?mode=monthly&loan_basis=Loan+amount&loan_amount=12000&years=1&months=0&rate=0&pmi_method=Manual&pmi=0&tax=0&insurance=0&hoa=0&other=0',{waitUntil:'networkidle'});await value('loan_amount','12000');await ready();assert.match(await page.locator('.metric.primary').innerText(),/1,000/);checks.push({legacyHTMLAndQuery:true,zeroRatePayment1000:true});
 await page.goto(base+calculatorPresetHref('/vat-calculator.html','any-two',{gross:120,rate:20}),{waitUntil:'networkidle'});await value('gross','120');await value('net','');await ready();assert.match(await page.locator('.metric.primary strong').innerText(),/100\.00/);checks.push({blankUnknownAndVATCalculationPreserved:true});
 const sharing=page.locator('.workspace-sharing');if(await sharing.count())await sharing.locator('summary').click();
 const links=page.locator('.share-options');await links.locator('summary').click();assert.equal(await page.getByLabel('Include current inputs in the link',{exact:true}).isChecked(),false);
 await page.getByRole('button',{name:'Copy link',exact:true}).click();await page.getByText('Tool link copied. No input values included.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),base+'/vat-calculator');
 await page.getByLabel('Include current inputs in the link',{exact:true}).check();await page.getByRole('button',{name:'Copy link',exact:true}).click();await page.getByText('Recalculable link copied. It includes your input values.',{exact:true}).waitFor();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(new URL(copied).search,'');await page.goto(copied,{waitUntil:'networkidle'});await value('gross','120');await value('net','');await ready();checks.push({sharingPrivateByDefault:true,optInFragmentRoundTrip:true});
 await page.goto(base+calculatorPresetHref('/marriage-calculator.html','comparison',{wages:80000,p2_wages:70000,interest:1234}),{waitUntil:'networkidle'});await value('interest','1234');await ready();assert.ok(await field('interest').isVisible());checks.push({marriageAdvancedFragmentInputsVisible:true});
 await page.goto(base+'/cd-calculator#calc=share_version=1&mode=missing',{waitUntil:'networkidle'});await page.locator('.error[role=alert]').waitFor();assert.equal(await page.locator('.result').count(),0);checks.push({invalidFragmentRemovesStaleResult:true});
 const plain=await browser.newContext({javaScriptEnabled:false});await plain.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());const p=await plain.newPage();await p.goto(base+'/cd-calculator');assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/cd-calculator');assert.ok(await p.locator('.worked-example h3').count()>0);assert.ok(await p.locator('a[href*="#calc="]').count()>0);assert.equal(await p.locator('a[href^="/"][href*="?"]').count(),0);checks.push({staticGuidesAndCanonicalWithoutJavaScript:true});await plain.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const queryDocuments=documents.filter(u=>new URL(u).search);assert.equal(queryDocuments.length,1);assert.ok(queryDocuments[0].includes('/mortgage-calculator.html?'));
 const report={passed:true,testedAt:new Date().toISOString(),checks,errors,external,legacyQueryDocuments:queryDocuments.length,scope:'Local production export in Chromium; native Safari and live domain unverified'};
 await fs.writeFile(dir+'/browser-qa.json',JSON.stringify(report,null,2)+'\n');console.log({passed:true,checks:checks.length,errors:errors.length});
}finally{await browser.close();}
