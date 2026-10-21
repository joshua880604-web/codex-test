import fs from 'node:fs/promises';
const {chromium}=await import('playwright').catch(()=>import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:3000';
try{
 for(const [route,param,value] of [['compound-interest','compound','Daily'],['compound-interest','compound','Monthly'],['tax','year','2026']]){
  await page.goto(`${base}/${route}-calculator.html`);
  await page.locator(`.search-tasks a[href*="${param}=${value}"]`).first().click();
  await page.waitForFunction(({param,value})=>document.querySelector(`form [id$="-${param}"]`)?.value===value,{param,value});
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();checks.push({route,param,value});
 }
 for(const [route,mode] of [['debt-payoff','snowball'],['margin','markup']]){
  await page.goto(`${base}/${route}-calculator.html`);await page.locator(`.search-tasks a[href*="mode=${mode}"]`).first().click();
  await page.waitForFunction(mode=>new URLSearchParams(location.search).get('mode')===mode,mode);
  await page.getByRole('tab',{name:mode==='snowball'?'Debt Snowball':'Markup from Cost',exact:true}).waitFor();
  await page.waitForFunction(title=>[...document.querySelectorAll('[role="tab"]')].some(t=>t.textContent===title&&t.getAttribute('aria-selected')==='true'),mode==='snowball'?'Debt Snowball':'Markup from Cost');
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();checks.push({route,mode,result:'rendered'});
 }
 for(const width of [390,768])for(const route of ['mortgage-payoff','auto-loan','debt-payoff','margin']){
  await page.setViewportSize({width,height:844});await page.goto(`${base}/${route}-calculator.html`);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+route+width);checks.push({route,width,overflow:false});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile('docs/financial-clone/evidence/browser-demand-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2)+'\n');console.log({checks:checks.length,errors:errors.length});
}finally{await browser.close();}
