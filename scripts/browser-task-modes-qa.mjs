import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000',targets={
 'student-loan':['normal','solve-payment','solve-principal','solve-rate','solve-term','extra','all','projection'],
 margin:['revenue','cost','margin','profit','stock','currency','markup'],
 commission:['any-two','commission','sales','rate','tiered'],
 savings:['accumulation','goal-contribution','goal-time'],
};
const field=key=>page.locator(`.calculator-form [id$="-${key}"]`);
const open=id=>page.goto(`${base}/${id}-calculator.html`);
const value=async(key,expected)=>assert.equal(await field(key).inputValue(),expected,key);
const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error[role=alert]').count(),0);};
await fs.mkdir('/workspace/work/task-modes',{recursive:true});
try{
 for(const width of [320,390,700,768,1440]){
  await page.setViewportSize({width,height:844});
  for(const [id,modes] of Object.entries(targets)){
   await open(id);await page.locator('.calculator-form').waitFor();
   assert.equal(await page.locator('.mobile-mode-picker').isVisible(),width<=700);
   if(width<=700){assert.equal(await page.getByRole('tab').count(),0);if(id==='savings'){const h=await page.locator('.mobile-mode-picker').evaluate(el=>el.getBoundingClientRect().height);assert.ok(h<96);checks.push({id,width,selectorHeight:h,oneRowButtons:true});}}
   if(width===390){await page.screenshot({path:`/workspace/work/task-modes/${id}-390.png`});}
   for(const mode of [320,390,1440].includes(width)?modes:[modes[0]]){
    await selectCalculatorMode(page,mode);
    if(mode!=='any-two')await page.getByRole('button',{name:'Reset',exact:true}).click();
    await calculate();
    assert.ok(!/NaN|Infinity/.test(await page.locator('.result').innerText()));
    const bad=await page.locator('.mobile-mode-picker select,.mobile-mode-picker button,.calculator-form input,.calculator-form select').evaluateAll(els=>els.filter(el=>el.getClientRects().length).filter(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth+1}));
    assert.equal(bad.length,0,id+' '+mode+' '+width);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    checks.push({id,width,mode,calculated:true,noOverflow:true});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 await open('savings');await field('principal').fill('23456');await field('monthly').fill('250');await field('years').fill('12');
 await selectCalculatorMode(page,'goal-contribution');await value('principal','23456');await field('end').fill('80000');
 await selectCalculatorMode(page,'goal-time');await value('monthly','250');await value('end','80000');await selectCalculatorMode(page,'accumulation');await value('years','12');await value('monthly','250');
 await page.getByRole('button',{name:'Reset',exact:true}).click();await selectCalculatorMode(page,'goal-time');await value('monthly','100');
 checks.push({savingsPreservesKnownAndHiddenInputs:true,resetClearsSavedValues:true});
 await open('student-loan');await field('principal').fill('45678');await field('months').fill('5');await selectCalculatorMode(page,'extra');await value('principal','45678');await value('months','5');await field('extra_monthly').fill('-25');
 await selectCalculatorMode(page,'normal');await calculate();await selectCalculatorMode(page,'extra');await value('extra_monthly','-25');
 await selectCalculatorMode(page,'all');await value('principal','30000');await field('principal').fill('12000');await selectCalculatorMode(page,'projection');await value('principal','0');
 await selectCalculatorMode(page,'normal');await value('principal','45678');await selectCalculatorMode(page,'all');await value('principal','12000');
 await selectCalculatorMode(page,'extra');await page.getByRole('button',{name:'Reset',exact:true}).click();await selectCalculatorMode(page,'normal');await selectCalculatorMode(page,'extra');await value('extra_monthly','0');
 checks.push({studentPreservesOriginalLoanInputs:true,separateBalanceMeanings:true,irrelevantInvalidExtraDoesNotBlock:true,resetClearsHiddenExtra:true});
 await open('margin');await field('cost').fill('240');await field('margin').fill('40');await selectCalculatorMode(page,'cost');await value('margin','40');await field('revenue').fill('400');await selectCalculatorMode(page,'margin');await value('cost','240');await value('revenue','400');await calculate();
 await selectCalculatorMode(page,'stock');await field('price').fill('75');await selectCalculatorMode(page,'markup');await value('cost','100');await field('cost').fill('80');await selectCalculatorMode(page,'profit');await value('cost','240');await value('revenue','400');await selectCalculatorMode(page,'stock');await value('price','75');
 checks.push({marginPreservesBusinessValues:true,tradingAndMarkupDraftsSeparate:true});
 await open('commission');assert.equal(await page.locator('.specific-mode').evaluate(el=>el.open),false);await field('sales').fill('20000');await field('rate').fill('10');await calculate();await selectCalculatorMode(page,'tiered');await field('sales').fill('45');await field('tier_unit').selectOption('Amount per item');await selectCalculatorMode(page,'any-two');await value('sales','20000');await value('rate','10');await value('commission','');await calculate();
 await selectCalculatorMode(page,'sales');await value('commission','');await field('commission').fill('2000');await calculate();await selectCalculatorMode(page,'any-two');await value('sales','');await value('rate','10');await value('commission','2000');await calculate();
 await page.getByRole('button',{name:'Clear',exact:true}).click();await value('sales','');await value('rate','');await value('commission','');await selectCalculatorMode(page,'tiered');await selectCalculatorMode(page,'any-two');await value('sales','');await value('rate','');await value('commission','');
 checks.push({simpleCommissionHasNoDuplicatePrimaryChoices:true,explicitUnknownIsOptional:true,anyTwoRemainsValid:true,itemQuantityNeverBecomesSalesAmount:true,clearSurvivesModeChanges:true});
 await page.goto(`${base}/commission-calculator.html?mode=sales&rate=10&commission=2000`);await page.locator('.result h2').waitFor();await selectCalculatorMode(page,'tiered');await field('sales').fill('45');await field('tier_unit').selectOption('Amount per item');await selectCalculatorMode(page,'any-two');await value('sales','');await value('rate','10');await value('commission','2000');await calculate();
 checks.push({legacySolverViaTieredKeepsUnknownBlank:true});
 // Every existing shared mode must reveal its correct task and fields, including legacy commission solvers.
 for(const [id,modes] of Object.entries(targets))for(const mode of modes){
  await page.goto(`${base}/${id}-calculator.html#calc=share_version=1&mode=${mode}`);
  await page.waitForFunction(mode=>document.querySelector('.calculator-form [id]')?.id.startsWith(`${mode.id}-${mode.mode}-`),{id,mode});
  await page.locator('.result h2').waitFor();
  if(id==='commission'&&['commission','sales','rate'].includes(mode))assert.ok(await page.locator('#task-mode').isVisible());
  await page.setViewportSize({width:1440,height:844});assert.equal(await page.locator('#tab-'+mode).getAttribute('aria-selected'),'true');await page.setViewportSize({width:390,height:844});
  checks.push({id,sharedMode:mode,hydrated:true,resizeSynchronized:true});
 }
 await open('student-loan');await page.locator('#task-group').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.locator('#task-group').inputValue(),'solve');assert.equal(await page.locator('#task-mode').inputValue(),'solve-payment');
 await open('savings');await page.getByRole('button',{name:'Savings balance',exact:true}).focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Deposit');await page.keyboard.press('Enter');assert.equal(await page.getByRole('button',{name:'Required monthly deposit',exact:true}).getAttribute('aria-pressed'),'true');
 checks.push({nativeKeyboardNavigation:true});
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-task-modes-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();}
