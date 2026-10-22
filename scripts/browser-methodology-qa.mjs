import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {defaultAssumptions,validationExamples,exampleLink} from '../src/lib/methodology.ts';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),context=await browser.newContext(),page=await context.newPage();
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3002',checks=[],errors=[],external=[];
context.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('data:'))external.push(request.url());});
await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
page.on('pageerror',error=>errors.push(error.message));
await fs.mkdir('/workspace/work/methodology-preview',{recursive:true});
try{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/methodology.html');
  assert.equal(await page.locator('h1').innerText(),'Calculation methodology and sources');
  assert.equal(await page.locator('.sidebar').count(),0);assert.equal(await page.locator('.method-default').count(),9);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const anchors=await page.getByRole('navigation',{name:'Methodology sections'}).locator('a').evaluateAll(links=>links.map(link=>link.hash.slice(1)));
  for(const id of anchors)assert.equal(await page.locator('[id="'+id+'"]').count(),1);
  await page.locator('.method-more-defaults > summary').click();assert.equal(await page.locator('.method-default:visible').count(),9);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(schema['@graph'][0]['@type'],'WebPage');
  assert.ok(!/reviewedBy|aggregateRating/.test(JSON.stringify(schema)));
  if(width===390){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'/workspace/work/methodology-preview/top-390.png'});await page.locator('#default-assumptions').scrollIntoViewIfNeeded();await page.screenshot({path:'/workspace/work/methodology-preview/defaults-390.png'});}
  if(width===1440){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'/workspace/work/methodology-preview/top-1440.png'});}
  checks.push({width,noOverflow:true,allSectionsLinked:true,defaultsReadable:true});
 }
 // Compare the displayed defaults with the actual form configurations and modes.
 for(const [index,item] of defaultAssumptions().entries()){
  await page.goto(base+'/methodology.html');await page.locator('.method-more-defaults > summary').click();
  const card=page.locator('.method-default').nth(index),display=String(item.value)+(item.unit==='%'?'%':item.unit?' '+item.unit:'');
  assert.ok((await card.locator('.method-default-value').innerText()).startsWith(display));
  await card.locator('dt a').click();
  await page.waitForFunction(({key,value})=>document.querySelector(`form [id$="-${key}"]`)?.value===value,{key:item.key,value:String(item.value)});
  checks.push({calculator:item.id,mode:item.mode,field:item.key,publishedDefaultMatchesForm:true});
 }
 for(const example of validationExamples){
  await page.goto(base+'/methodology.html');await page.locator('.method-examples section').filter({has:page.getByRole('heading',{name:example.title,exact:true})}).getByRole('link').click();
  assert.equal(new URL(page.url()).pathname,new URL(exampleLink(example),base).pathname);
  for(const [key,value] of Object.entries(example.values))await page.waitForFunction(({key,value})=>document.querySelector(`form [id$="-${key}"]`)?.value===value,{key,value:String(value)});
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
  const metric=page.locator('.metric').filter({has:page.getByText(example.label,{exact:true})});
  const actual=Number((await metric.locator('strong').innerText()).replace(/[^0-9.+-]/g,''));assert.ok(Math.abs(actual-example.expected)<.005);
  checks.push({example:example.title,publishedResultReproduced:true});
 }
 for(const [inflation,expected] of [['2.5','3.4146%'],['3.5','2.4155%']]){
  await page.goto(base+'/methodology.html');await page.getByRole('link',{name:inflation==='2.5'?'the 2.5% inflation example':'the 3.5% example',exact:true}).click();
  await page.waitForFunction(value=>document.querySelector('form [id$="-inflation"]')?.value===value,inflation);
  await page.locator('.result h2').waitFor();assert.equal(await page.locator('.metric.primary strong').innerText(),expected);
  checks.push({inflation,realReturn:expected});
 }
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/retirement-calculator.html','/investment-calculator.html','/investment-fee-calculator.html']){
  await page.goto(base+route);const help=page.locator('.assumption-help');await help.waitFor();
  assert.equal(await help.locator('a').getAttribute('href'),'/methodology.html#default-assumptions');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 checks.push('Investment and retirement forms link directly to default-assumption explanations');
 const alias=await page.request.get(base+'/methodology');assert.equal(alias.status(),200);assert.ok((await alias.text()).includes('Calculation methodology and sources'));
 await page.goto(base+'/methodology.html');
 const internal=await page.locator('main a[href^="/"]').evaluateAll(links=>[...new Set(links.map(link=>link.getAttribute('href')))]);
 for(const href of internal)assert.equal((await page.request.get(base+href)).status(),200,href);
 assert.equal(await page.locator('.method-report').getAttribute('href'),'https://github.com/joshua880604-web/codex-test/issues/new');
 checks.push('Clean methodology alias and all internal links resolve; report is an explicit external link');
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),plain=await noJS.newPage();await plain.goto(base+'/methodology.html');
 await plain.locator('.method-more-defaults > summary').click();assert.equal(await plain.locator('.method-default:visible').count(),9);await noJS.close();
 checks.push('Definitions, data sources and expandable defaults work without JavaScript');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-methodology-qa.json',JSON.stringify({tested_at:new Date().toISOString(),passed:true,checks,errors,external_requests:external.length},null,2));
 console.log({passed:true,checks:checks.length,errors:errors.length,external_requests:external.length});
}finally{await browser.close();}
