import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage();const checks=[];await fs.mkdir('/workspace/work/home-first-screen',{recursive:true});
try{
 for(const [width,height] of [[320,480],[320,568],[360,640],[375,667],[390,664],[390,844],[412,915]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:3000/financial-calculator.html');await page.getByRole('button',{name:'Basic',exact:true}).waitFor();
  assert.equal((await page.locator('.brand').innerText()).replace('▦','').trim(),'calculatorfree.io');assert.ok((await page.title()).includes('calculatorfree.io'));assert.ok((await page.locator('footer').innerText()).includes('calculatorfree.io'));
  const rect=await page.locator('.quick-calculator').boundingBox(),search=await page.locator('.directory-search').boundingBox();assert.ok(search.y+search.height<=rect.y);assert.ok(rect.y>=0);const fits=rect.y+rect.height<=height;if(height>=800)assert.ok(fits);assert.equal(await page.evaluate(()=>scrollY),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const key of ['2','+','3'])await page.locator('.quick-keys').getByRole('button',{name:key,exact:true}).click();await page.getByRole('button',{name:'Calculate =',exact:true}).click();await page.locator('.quick-answer').getByText('5',{exact:true}).waitFor();if(fits)assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.getByLabel('Expression',{exact:true}).evaluate(el=>el===document.activeElement),false);
  await page.screenshot({path:`/workspace/work/home-first-screen/${width}-${height}.png`});checks.push({width,height,cardBottom:rect.y+rect.height,searchBeforeCalculator:true,entireCardInFirstViewport:fits,noKeyboardAutofocus:true});
 }
 await fs.writeFile('docs/financial-clone/evidence/browser-home-first-screen-qa.json',JSON.stringify({checks,tested_at:new Date().toISOString()},null,2));console.log({checks:checks.length});
}finally{await browser.close();}
