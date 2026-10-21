import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage();const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('/workspace/work/result-context',{recursive:true});
try{
 for(const width of [1440,390])for(const [route,query,phrase,key] of [
  ['mortgage','mode=monthly','initial modeled monthly outlay',null],
  ['loan','mode=amortized&pay=Annually','payments made annually','pay'],
  ['compound-interest','mode=growth&principal=1000&monthly=0&annual=0&years=2&rate=-10&compound=Annually','loss is -$190.00','annual'],
  ['retirement','mode=saving&target=600000&balance=30000&age=35&retire=67&return=6','alternative plan','return'],
  ['retirement','mode=required','modeled retirement target','replacement'],
  ['tax','mode=federal&year=2025&wages=50000&withheld=0','remains owed','year'],
 ]){
  await page.setViewportSize({width,height:950});await page.goto('http://127.0.0.1:3000/'+route+'-calculator.html?'+query);
  await page.getByText(phrase,{exact:false}).first().waitFor();assert.equal(await page.locator('.result-context').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  if(key){const input=page.locator(`form [id$="-${key}"]`);const described=await input.getAttribute('aria-describedby');assert.ok(described?.includes('-hint'));assert.ok(await page.locator(`[id="${await input.getAttribute('id')}-hint"]`).textContent());}
  if(route==='retirement'&&query.includes('saving')){await page.locator('.result').screenshot({path:`/workspace/work/result-context/retirement-${width}.png`});const field=page.locator('form [id$="-target"]');await field.fill('700000');assert.equal(await page.locator('.result-context').count(),0);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result-context').waitFor();}
  checks.push({route,query,width,passed:true});
 }
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-result-context-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors},null,2));console.log({checks:checks.length,errors:errors.length});
}finally{await browser.close();}
