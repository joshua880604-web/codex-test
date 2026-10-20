import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[],errors=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/scientific-calculator.html');
 const input=page.locator('form textarea');await input.waitFor();
 for(const [expression,angle,expected] of [['2+3*4','Degrees',14],['sin(30)','Degrees',.5],['sin(pi/2)','Radians',1],['5!','Degrees',120],['2^3^2','Degrees',512]]){
 await input.fill(expression);await page.locator('form select').selectOption(angle);await input.press('Enter');await page.locator('.result').waitFor();assert.equal(Number((await page.locator('.metric strong').first().innerText()).replaceAll(',','')),expected);checks.push(expression);
 }
 await page.getByRole('button',{name:'Clear expression',exact:true}).click();
 for(const name of ['2','+','3','Evaluate expression'])await page.getByRole('button',{name,exact:true}).click();
 await page.locator('.result').waitFor();assert.equal(await input.inputValue(),'2+3');assert.equal(await page.locator('.metric strong').first().innerText(),'5');checks.push('keypad');
 await page.getByRole('button',{name:'x²',exact:true}).click();await input.press('Enter');await page.locator('.result').waitFor();assert.equal(await page.locator('.metric strong').first().innerText(),'25');checks.push('square whole expression');
 for(const expression of ['1/0','sqrt(-1)']){await input.fill(expression);await input.press('Enter');await page.locator('.error[role=alert]').waitFor();assert.equal(await page.locator('.result').count(),0);checks.push(expression+' rejected');}
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push('width '+width);}
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-scientific-qa.json',JSON.stringify({passed:true,checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
