import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const terms=JSON.parse(await fs.readFile('src/lib/glossary-data.json','utf8'));
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3001',origin=process.env.QA_EXPECT_ORIGIN;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),context=await browser.newContext();
const page=await context.newPage(),checks=[],errors=[],external=[];
context.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('data:'))external.push(request.url());});
await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
page.on('pageerror',error=>errors.push(error.message));
await fs.mkdir('/workspace/work/glossary-preview',{recursive:true});
try{
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});
  for(const term of [null,...terms]){
   const path=term?'/glossary/'+term.slug+'/':'/glossary/';
   const response=await page.goto(base+path);assert.equal(response.status(),200,path);
   assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('h1').innerText());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' overflow at '+width);
   const robots=await page.locator('meta[name="robots"]').getAttribute('content');assert.equal(robots.includes('noindex'),!origin);
   if(origin)assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),origin+path);
   const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
   assert.equal(schema['@graph'][0]['@type'],term?'DefinedTerm':'DefinedTermSet');
   if(term){
    assert.equal(await page.locator('.glossary-definition').innerText(),term.definition);
    assert.ok((await page.locator('.glossary-example').innerText()).includes(term.example.answer));
    assert.equal(await page.locator('.glossary-sources time').getAttribute('datetime'),term.checkedOn);
   }else assert.equal(await page.locator('.glossary-grid article').count(),8);
   const anchors=await page.locator('main a[href^="#"]').evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1)));
   for(const id of anchors)assert.equal(await page.locator('[id="'+id+'"]').count(),1,path+' anchor '+id);
   if(width===390&&(!term||term.slug==='dollar-cost-averaging'))await page.screenshot({path:'/workspace/work/glossary-preview/'+(term?.slug??'index')+'-390.png',fullPage:!!term});
   checks.push({path,width,staticContent:true,noOverflow:true,metadataAndSchema:true});
  }
 }
 // All in-article internal links resolve, including canonical directories and calculator presets.
 for(const term of terms){
  await page.goto(base+'/glossary/'+term.slug+'/');
  const hrefs=await page.locator('main a[href^="/"]').evaluateAll(links=>[...new Set(links.map(link=>link.getAttribute('href')))]);
  for(const href of hrefs)assert.equal((await page.request.get(base+href)).status(),200,href);
  if(term.example.calculator){
   await page.getByRole('link',{name:'Try these example inputs',exact:false}).click();
   const example=term.example.calculator;
   for(const [key,value] of Object.entries(example.values))await page.waitForFunction(({key,value})=>document.querySelector(`form [id$="-${key}"]`)?.value===value,{key,value:String(value)});
   await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
   for(const expected of example.expected){
    const metric=page.locator('.result .metric').filter({has:page.getByText(expected.label,{exact:true})});
    const actual=Number((await metric.locator('strong').innerText()).replace(/[^0-9.+-]/g,''));
    assert.ok(Math.abs(actual-expected.value)<Math.max(.005,expected.tolerance??0),term.slug+' '+expected.label);
   }
   checks.push({term:term.slug,example:'loads inputs and reproduces published result'});
  }else{
   assert.equal(await page.getByRole('link',{name:'Try these example inputs',exact:false}).count(),0);
   assert.ok((await page.locator('main').innerText()).includes('does not replay share prices'));
   checks.push({term:term.slug,scope:'DCA share-price example not presented as a calculator backtest'});
  }
 }
 const toolIds=[...new Set(terms.flatMap(term=>term.tools.map(tool=>tool.id)))];
 for(const id of toolIds){
  await page.goto(base+catalog.find(tool=>tool.id===id).local_route);
  for(const term of terms.filter(term=>term.tools.some(tool=>tool.id===id)))assert.equal(await page.locator('.guide-terms a[href="/glossary/'+term.slug+'/"]').count(),1,id+' backlink');
 }
 checks.push({calculatorPagesWithBacklinks:toolIds.length});
 for(const path of ['/glossary','/glossary/cagr']){
  const response=await page.request.get(base+path+'?from=test',{maxRedirects:0});assert.equal(response.status(),301);assert.equal(response.headers().location,path+'/?from=test');
 }
 assert.equal((await page.request.get(base+'/glossary/not-a-term/')).status(),404);
 const plainContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),plain=await plainContext.newPage();
 await plain.goto(base+'/glossary/');await plain.getByRole('link',{name:'Dollar-cost averaging',exact:true}).click();assert.ok((await plain.locator('main').innerText()).includes('$64 loss'));
 const cta=await plain.getByRole('link',{name:'Investment Calculator',exact:true}).getAttribute('href');assert.ok(cta);await plainContext.close();
 checks.push({directoryRedirects:true,unknownTerm404:true,noJSReadingAndToolLinks:true});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-glossary-qa.json',JSON.stringify({tested_at:new Date().toISOString(),passed:true,configuration:origin?'local build with production metadata':'local noindex preview',checks,errors,external_requests:external.length},null,2));
 console.log({passed:true,checks:checks.length,errors:errors.length,external_requests:external.length});
}finally{await browser.close();}
