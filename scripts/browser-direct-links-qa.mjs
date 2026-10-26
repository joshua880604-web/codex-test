import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3630';const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[],errors=[];
try{
 const ctx=await browser.newContext();await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.fulfill({body:'',contentType:'text/javascript'}));const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
 for(const tool of catalog){for(const path of [tool.local_route,tool.local_route.slice(0,-5)]){const r=await ctx.request.get(base+path,{maxRedirects:0});assert.equal(r.status(),200);}}
 checks.push({oldAndFinalToolURLs:catalog.length*2,status:200});
 for(const [width,height] of [[320,480],[390,844],[768,900],[1440,900]]){
  await page.setViewportSize({width,height});await page.goto(base+'/financial-calculator',{waitUntil:'networkidle'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width<400){const quick=await page.locator('.quick-calculator').boundingBox();assert.ok(quick.y+quick.height<=height);}
  const input=page.locator('main input[type="search"]').first();await input.fill('recast');
  const option=page.getByRole('option').filter({hasText:'Mortgage Recast Calculator'}).first();assert.ok((await option.getAttribute('href')).startsWith('/mortgage-recast-calculator'));assert.ok(!(await option.getAttribute('href')).includes('.html'));
  await input.press('ArrowDown');await input.press('Enter');await page.waitForURL(u=>u.pathname==='/mortgage-recast-calculator');await page.locator('.result h2').waitFor();
  assert.equal(await page.locator('a[href*=".html"]').count(),0);
  checks.push({width,searchKeyboardFinalURL:true,noOverflow:true});
 }
 await page.goto(base+'/cd-calculator');await page.getByRole('link',{name:'Use a 14-month term',exact:true}).click();await page.waitForLoadState('networkidle');assert.equal(new URL(page.url()).pathname,'/cd-calculator');assert.equal(await page.getByLabel('Deposit length',{exact:false}).inputValue(),'1');assert.equal(await page.getByLabel('Additional months',{exact:false}).inputValue(),'2');checks.push({presetQueryAndFragmentPreserved:true});
 await page.goto(base+'/mortgage-calculator.html?mode=monthly&loan_basis=Loan+amount&loan_amount=12000&years=1&months=0&rate=0&pmi_method=Manual&pmi=0&tax=0&insurance=0&hoa=0&other=0');await page.waitForLoadState('networkidle');assert.equal(await page.locator('.error[role=alert]').count(),0);assert.equal(await page.locator('form [id$="-loan_amount"]').inputValue(),'12000');checks.push({oldQueryLinkStillCalculates:true});
 const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(base+'/financial-calculator');assert.equal(await p.locator('a[href*=".html"]').count(),0);checks.push({serverLinksWithoutJavaScript:true});await nojs.close();assert.deepEqual(errors,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-direct-links-qa.json',JSON.stringify({checks,errors,passed:true},null,2)+'\n');console.log({checks:checks.length,passed:true});
}finally{await browser.close();}
