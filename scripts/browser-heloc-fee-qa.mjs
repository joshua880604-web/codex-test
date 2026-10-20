import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const checks=[],errors=[];
try{const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 const base='http://localhost:3000/heloc-calculator.html';
 await page.goto(base+'?mode=draw-repay&principal=12000&rate=0&draw=1&years=2&closing=50&charge=120');
 await page.waitForFunction(()=>document.querySelector('[id$="-charge"]')?.value==='120');
 const fee=page.getByLabel('Annual fee',{exact:true});assert.ok(await fee.getAttribute('aria-describedby'));
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 const val=async label=>Number((await page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong').innerText()).replace(/[^\d.-]/g,''));
 assert.equal(await val('Fees and annual charges'),170);assert.equal(await val('Annual fees during draw'),120);assert.equal(await val('Monthly repayment'),500);assert.equal(await val('Monthly draw payment'),10);
 const rows=page.locator('.table-scroll tbody tr');assert.equal(await rows.count(),36);assert.equal(await rows.nth(11).locator('td').nth(1).innerText(),'10');assert.equal(await rows.nth(12).locator('td').nth(1).innerText(),'500');checks.push('Annual fee appears in draw rows only; repayment and total fees are correct');
 await fee.fill('0');await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await val('Fees and annual charges'),50);assert.equal(await val('Annual fees during draw'),0);checks.push('No-fee input zero is supported');
 await page.getByRole('tab',{name:'Maximum Credit',exact:true}).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await val('Estimated maximum HELOC'),190000);checks.push('Maximum-credit mode preserved');
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});await page.goto(base);assert.ok(await page.getByLabel('Annual fee',{exact:true}).isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({width,overflow:false});}
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-heloc-fee-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
