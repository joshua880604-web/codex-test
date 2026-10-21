import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/financial-calculator.html');
 await page.getByLabel('Find a calculator').fill('');
 assert.equal(await page.locator('.directory-grid li').count(),76);
 assert.equal(await page.locator('.featured-grid a').count(),8);
 assert.equal(await page.locator('.directory-categories a').count(),6);
 assert.equal(await page.locator('aside.sidebar').count(),0);checks.push('Full directory, eight shortcuts, six category links and full-width layout');
 for(const link of await page.locator('.directory-categories a').all()){const href=await link.getAttribute('href');assert.equal(await page.locator(href).count(),1);}checks.push('Every category jump resolves');for(const anchor of ['investment','everyday-tools','auto','other','mortgage-and-real-estate','tax-and-salary'])assert.equal(await page.locator('[id="'+anchor+'"]').count(),1);checks.push('Legacy category anchors remain valid');
 const search=page.getByLabel('Find a calculator');
 for(const [term,route] of [['car payment','/auto-loan-calculator.html'],['401(k)','/401k-calculator.html'],['required minimum distribution','/rmd-calculator.html']]){await search.fill(term);assert.ok(await page.locator(`.directory-grid a[href="${route}"]`).count());}await search.fill('');checks.push('Common aliases find their calculators');
 const hrefs=await page.locator('.directory-grid li a').evaluateAll(els=>els.map(el=>el.getAttribute('href')));assert.equal(new Set(hrefs).size,76);checks.push('All 76 directory entries appear once');
await search.fill('  mortgage  ');assert.ok(await page.locator('.directory-grid li').count()>0);assert.equal(await page.locator('.featured-grid').count(),0);checks.push('Trimmed search and focused results');
 await search.fill('no-calculator-matches-this');await page.getByRole('heading',{name:'No calculators found',exact:true}).waitFor();assert.equal(await page.locator('.directory-categories').count(),0);
 await page.getByRole('button',{name:'Show all calculators'}).click();assert.equal(await page.locator('.directory-grid li').count(),76);await search.fill('scientific');await page.getByRole('button',{name:'Clear search',exact:true}).click();assert.equal(await search.inputValue(),'');assert.ok(await search.evaluate(el=>el===document.activeElement));checks.push('Empty search recovery, reset and keyboard focus');
 for(const width of [320,390,550,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const links=await page.locator('.directory-grid li a').evaluateAll(els=>els.map(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width})));assert.ok(links.every(r=>r.height>=40&&r.width>100));const groupColumns=await page.locator('.directory-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(groupColumns,width<=600?1:2);const toolColumns=await page.locator('.directory-grid ul').first().evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(toolColumns,width<=1050?1:2);checks.push({width,overflow:false,links:links.length,groupColumns,toolColumns});}
 await page.setViewportSize({width:1440,height:900});await fs.mkdir('/workspace/work/directory-layout',{recursive:true});await page.screenshot({path:'/workspace/work/directory-layout/desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/workspace/work/directory-layout/mobile.png',fullPage:true});
 const noJS=await browser.newContext({javaScriptEnabled:false});const plain=await noJS.newPage();await plain.goto('http://localhost:3000/financial-calculator.html');assert.equal(await plain.locator('.directory-grid li a').count(),76);await noJS.close();checks.push('All tool links available without JavaScript');
 await page.goto('http://localhost:3000/mortgage-calculator.html');assert.equal(await page.locator('aside.sidebar').count(),1);assert.equal(await page.locator('.directory-page').count(),0);checks.push('Calculator detail retains sidebar and original layout');
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-homepage-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
