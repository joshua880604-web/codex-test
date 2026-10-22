import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('/workspace/work/mobile-layout',{recursive:true});
try{
 for(const width of [320,390,700])for(const route of ['financial','mortgage','retirement','401k','marriage','tax','investment-fee','cagr','scientific','vat']){
  await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:3000/'+route+'-calculator.html');await page.locator('h1').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' '+width+' page overflow');
  const controls=await page.locator('.calculator-form input,.calculator-form select,.calculator-form textarea').evaluateAll(els=>els.filter(el=>el.getClientRects().length).map(el=>({id:el.id,width:el.getBoundingClientRect().width,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,height:el.getBoundingClientRect().height,font:parseFloat(getComputedStyle(el).fontSize)})));
  assert.ok(controls.every(r=>r.left>=0&&r.right<=width+1&&r.font>=16),JSON.stringify({route,width,controls}));
  const frames=await page.locator('.calculator-form .field-entry').evaluateAll(els=>els.filter(el=>el.getClientRects().length).map(el=>({height:el.getBoundingClientRect().height,radius:getComputedStyle(el).borderRadius,border:getComputedStyle(el).borderTopWidth})));assert.ok(frames.every(f=>f.height>=44&&f.radius==='6px'&&f.border==='1px'));
  if(route!=='financial'){await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();assert.equal(await page.locator('.error[role="alert"]').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  if(width===390&&['mortgage','marriage','scientific'].includes(route)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`/workspace/work/mobile-layout/${route}.png`,fullPage:true});await page.locator('.calculator-form').screenshot({path:`/workspace/work/mobile-layout/${route}-form.png`});}
  checks.push({route,width,overflow:false,controls:controls.length,inputFontAtLeast16:true});
 }
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-mobile-layout-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors},null,2));console.log({checks:checks.length,errors:errors.length});
}finally{await browser.close();}
