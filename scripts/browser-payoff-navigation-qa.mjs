import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000',path='/mortgage-payoff-calculator.html';
const field=key=>page.locator(`.calculator-form [id$="-${key}"]`);
await fs.mkdir('/workspace/work/payoff-navigation',{recursive:true});
try {
 for(const width of [320,390,700,1440]){
  await page.setViewportSize({width,height:844});await page.goto(base+path);
  await page.getByRole('button',{name:'Calculate',exact:true}).waitFor();
  assert.equal(await page.locator('.mobile-mode-picker').isVisible(),width<=700);
  if(width<=700){
   assert.equal(await page.getByRole('tab').count(),0);
   const bounds=await page.locator('.mobile-mode-picker').boundingBox();
   assert.ok(bounds.height<=175,JSON.stringify(bounds));
   if(width===390){checks.push({width,selectorHeight:bounds.height,formTop:await page.locator('.calculator-form').evaluate(el=>el.getBoundingClientRect().top)});await page.screenshot({path:'/workspace/work/payoff-navigation/after-390.png'});}
  }else assert.equal(await page.getByRole('tab').count(),8);
  for(const basis of ['remaining','known'])for(const strategy of ['extra','normal','biweekly','all']){
   await selectCalculatorMode(page,basis+'-'+strategy);
   assert.equal(await field('extra_monthly').count(),strategy==='extra'?1:0);
   await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
   assert.equal(await page.locator('.error[role=alert]').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  checks.push({width,allEightModesCalculate:true,noOverflow:true,onlyRelevantFields:true});
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+path);
 await field('principal').fill('280000');await field('payment').fill('2100');await field('rate').fill('5.5');await field('extra_monthly').fill('250');
 for(const strategy of ['normal','biweekly','all','extra']){
  await page.locator('#payoff-strategy').selectOption(strategy);
  assert.equal(await field('principal').inputValue(),'280000');assert.equal(await field('payment').inputValue(),'2100');assert.equal(await field('rate').inputValue(),'5.5');
 }
 assert.equal(await field('extra_monthly').inputValue(),'250');
 await page.getByRole('radio',{name:'Original loan',exact:true}).check();assert.equal(await field('principal').inputValue(),'100000');
 await field('principal').fill('190000');
 await page.getByRole('radio',{name:'Current balance',exact:true}).check();assert.equal(await field('principal').inputValue(),'280000');
 await page.getByRole('radio',{name:'Original loan',exact:true}).check();assert.equal(await field('principal').inputValue(),'190000');
 await page.locator('#payoff-strategy').selectOption('normal');await page.getByRole('button',{name:'Reset',exact:true}).click();
 await page.locator('#payoff-strategy').selectOption('extra');assert.equal(await field('principal').inputValue(),'100000');assert.equal(await field('extra_monthly').inputValue(),'0');
 await field('extra_monthly').fill('-1');await page.locator('#payoff-strategy').selectOption('normal');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error[role=alert]').count(),0);
 checks.push({preservesStrategyInputs:true,separateBasisDrafts:true,resetClearsHiddenExtras:true,hiddenInvalidExtraDoesNotBlock:true});
 await page.goto(base+path+'#calc=share_version=1&mode=known-biweekly&principal=180000&years=20&months=0&rate=5&elapsed=36');
 await page.locator('.result h2').waitFor();assert.equal(await page.locator('#payoff-strategy').inputValue(),'biweekly');assert.ok(await page.getByRole('radio',{name:'Original loan',exact:true}).isChecked());assert.equal(await field('principal').inputValue(),'180000');
 await page.setViewportSize({width:1440,height:844});assert.equal(await page.getByRole('tab',{selected:true}).innerText(),'Original loan · Biweekly');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#payoff-strategy').inputValue(),'biweekly');
 checks.push({sharedModeHydratesBothControls:true,resizePreservesMode:true});
 // Arrow keys on the native radio group and select; visible focus must remain usable.
 await page.getByRole('radio',{name:'Original loan',exact:true}).focus();await page.keyboard.press('ArrowLeft');assert.ok(await page.getByRole('radio',{name:'Current balance',exact:true}).isChecked());
 await page.locator('#payoff-strategy').focus();await page.keyboard.press('Home');await page.keyboard.press('Enter');assert.equal(await page.locator('#payoff-strategy').inputValue(),'extra');
 checks.push({nativeKeyboardNavigation:true});
 assert.deepEqual(errors,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-payoff-navigation-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
}finally{await browser.close();}
