import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {searchTasks,keywordTitles} from '../src/lib/keyword-targets.ts';
import {routeFor} from '../src/lib/catalog.ts';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const checks=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 for(const [id,tasks] of Object.entries(searchTasks)){
  await page.goto('http://localhost:3000'+routeFor(id));
  assert.ok((await page.title()).includes(keywordTitles[id]));
  for(const task of tasks){
   const link=page.locator('.search-tasks > div').filter({has:page.getByRole('heading',{name:task.keyword,exact:true})}).getByRole('link',{name:'Open this calculation',exact:true});
   await link.click();if(await page.getByRole('tab').count())await page.waitForFunction(mode=>document.querySelector(`[id="tab-${mode}"]`)?.getAttribute('aria-selected')==='true',task.mode);else await page.locator(`form [id^="${id}-${task.mode}-"]`).first().waitFor();
   assert.equal(await page.locator('link[rel=canonical]').count(),0);
   checks.push({id,keyword:task.keyword,mode:task.mode,result:'correct mode selected'});
  }
 }
 await page.goto('http://localhost:3000/savings-calculator.html');await page.getByRole('button',{name:'Savings goal calculator',exact:true}).click();assert.equal(await page.getByRole('tab',{selected:true}).innerText(),'Savings Goal: Monthly Deposit');checks.push('Shortcut switches savings mode');
 for(const query of ['retirement withdrawal','savings goal','extra payments','compound interest calculator with monthly deposits']){
  await page.goto('http://localhost:3000/financial-calculator.html');await page.getByLabel('Find a calculator').fill(query);assert.ok(await page.locator('.directory-grid li').count()>0);checks.push({query,result:'directory intent search matches'});
 }
 for(const width of [320,390,768]){await page.setViewportSize({width,height:844});for(const id of ['savings','repayment','compound-interest','401k']){await page.goto('http://localhost:3000'+routeFor(id));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({id,width,result:'no overflow'});}}
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-keyword-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
