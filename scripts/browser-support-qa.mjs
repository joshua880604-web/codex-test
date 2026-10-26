import fs from 'node:fs/promises';import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const dir='/workspace/work/browser-support-20261026',base='http://127.0.0.1:3000';
const plan=JSON.parse(await fs.readFile(dir+'/qa-plan.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],unexpected=[],checks=[];
function route(r){const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();if(u==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({body:'',contentType:'text/javascript'});if(u.startsWith('data:')||u.startsWith('blob:'))return r.continue();unexpected.push(u);return r.abort();}
try {
 const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true,reducedMotion:'reduce'});await ctx.route('**/*',route);
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
 const result=async()=>{await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
 for(const [index,item] of plan.entries()){
  await page.goto(base+item.route+'?'+new URLSearchParams({mode:item.mode}),{waitUntil:'networkidle'});await result();
  assert.equal(await page.locator('#browser-support-notice').isVisible(),false);
  await page.evaluate(()=>{window.__supportSubmits=[];document.querySelector('.calculator-form').addEventListener('submit',event=>{setTimeout(()=>window.__supportSubmits.push(event.defaultPrevented),0);},{capture:true});});
  await page.getByRole('button',{name:/^Calculate/}).click();await page.waitForFunction(()=>window.__supportSubmits?.includes(true));await result();
  assert.ok(!/NaN|Infinity/.test(await page.locator('.result').innerText()));checks.push({id:item.id,mode:item.mode,hydratedCalculation:true,noticeHidden:true});
  if((index+1)%25===0){console.log('modes',index+1,'/',plan.length);await fs.writeFile(dir+'/browser-progress.json',JSON.stringify({completed:index+1,total:plan.length,errors}));}
 }
 for(const width of [390,414,768,1440]){
  await page.setViewportSize({width,height:896});await page.goto(base+'/mortgage-calculator.html?mode=monthly&down=5',{waitUntil:'networkidle'});await result();assert.equal(await page.locator('#browser-support-notice').isVisible(),false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.result').screenshot({path:dir+'/result-'+width+'.png'});checks.push({case:'modern mortgage viewport '+width,passed:true});
 }
 await page.locator('.workspace-report-chart .result-trend').waitFor();await page.locator('.workspace-report-details .workspace-details > summary').click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const d=await pending;await d.saveAs(dir+'/mortgage.csv');assert.equal((await fs.readFile(dir+'/mortgage.csv','utf8')).trim().split(/\r?\n/).length,361);checks.push({case:'modern chart and CSV',passed:true});
 await page.goto(base+'/scientific-calculator.html',{waitUntil:'networkidle'});const input=page.locator('form textarea');await input.fill('2+3*4');await input.press('Enter');await result();assert.equal(await page.locator('.metric strong').first().innerText(),'14');checks.push({case:'modern scientific Enter',passed:true});
 const old=await browser.newContext({viewport:{width:414,height:896},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 Version/14.0.3 Mobile/15E148 Safari/604.1',isMobile:true,hasTouch:true});
 await old.route('**/*',r=>r.request().url().includes('/_next/')?r.abort():route(r));const op=await old.newPage();await op.goto(base+'/mortgage-calculator.html',{waitUntil:'networkidle'});await op.locator('#browser-support-notice').waitFor();assert.match(await op.locator('#browser-support-notice').innerText(),/update iOS or use a newer device/);assert.equal(await op.locator('script[data-browser-compat]').count(),0);assert.ok(await op.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await op.screenshot({path:dir+'/old-browser-notice.png'});checks.push({case:'old iOS notice without application bundles',passed:true});await old.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 await fs.writeFile('docs/financial-clone/evidence/browser-support-qa.json',JSON.stringify({tested_at:new Date().toISOString(),passed:true,calculator_modes:plan.length,checks,errors,unexpected,scope:'Modern Chromium runtime; old-iOS UA is used only to verify the notice with application bundles blocked. No Safari/WebKit device run.',ads:'Exact existing publisher loader stubbed.'},null,2)+'\n');console.log({passed:true,modes:plan.length,checks:checks.length,errors:0});
}finally{await browser.close();}
