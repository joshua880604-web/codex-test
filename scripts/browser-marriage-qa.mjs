import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators/index.ts';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[];const errors=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 const calc=calculators.find(c=>c.id==='marriage-tax');const mode=calc.modes[0];
 const base='http://localhost:3000/marriage-calculator.html';
 await page.goto(base);
 assert.equal(await page.locator('form input, form select').count(),71);
 assert.equal(await page.locator('.marriage-section[open]').count(),0);
 assert.equal(await page.locator('.marriage-basic input, .marriage-basic select').count(),8);
 const salary=page.getByLabel('You · Annual wages',{exact:true}),partner=page.getByLabel('Partner · Annual wages',{exact:true});
 assert.ok(await salary.isVisible());assert.ok(await partner.isVisible());
 const ownBox=await salary.boundingBox(),partnerBox=await partner.boundingBox();assert.ok(Math.abs(ownBox.y-partnerBox.y)<2);assert.ok(partnerBox.x>ownBox.x);
 checks.push('All 71 fields retained; both salaries and statuses visible side by side; optional groups collapsed');
 for(const [a,b] of [[80000,0],[80000,80000],[500000,500000]]){
  await salary.fill(String(a));await partner.fill(String(b));await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
  const values={...defaults(mode),wages:String(a),p2_wages:String(b)};const metrics=runCalculation(calc.id,mode.id,values).metrics;const delta=metrics.at(-1).value;
  const text=await page.locator('.metric.primary').innerText();assert.ok(text.includes(delta<-.005?'savings':delta>.005?'additional tax':'difference'));
  const actual=Number((await page.locator('.metric.primary strong').innerText()).replace(/[^\d.]/g,''));assert.ok(Math.abs(actual-Math.abs(delta))<.006);
  for(const m of metrics.slice(0,-1)){const row=page.locator('.metric').filter({has:page.getByText(m.label,{exact:true})});assert.ok(await row.count());}
  checks.push({scenario:[a,b],delta,direction:'correct'});
 }
 const q=new URLSearchParams({...defaults(mode),p2_interest:'1200',p2_education0:'2000',p2_education_type0:'American Opportunity'});
 await page.goto(base+'?'+q);await page.waitForFunction(()=>document.querySelector('[id$="-p2_interest"]')?.value==='1200');
 await page.waitForFunction(()=>document.querySelector('[data-section="income"]')?.open&&document.querySelector('[data-section="credits"]')?.open);
 assert.equal(await page.locator('[id$="-p2_education0"]').inputValue(),'2000');checks.push('Shared advanced inputs remain populated and their groups open automatically');
 await page.getByRole('button',{name:'Reset',exact:true}).click();assert.equal(await partner.inputValue(),'0');assert.equal(await page.locator('[id$="-p2_interest"]').inputValue(),'0');checks.push('Reset restores both basic and advanced values');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const detail of await page.locator('.marriage-section').all())await detail.evaluate(el=>el.open=true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const field of await page.locator('form input, form select').all()){const box=await field.boundingBox();assert.ok(box&&box.width>80);if(width<=390)assert.ok(box.height>=44);}
  checks.push({width,all_fields_accessible:true,overflow:false});
 }
 await page.setViewportSize({width:390,height:844});for(const detail of await page.locator('.marriage-section').all())await detail.evaluate(el=>el.open=false);await page.screenshot({path:'work/marriage-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-marriage-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
