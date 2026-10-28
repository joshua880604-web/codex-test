import fs from 'node:fs/promises';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('playwright').catch(()=>import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs'));
const inventory=JSON.parse(await fs.readFile('docs/financial-clone/inventory.json','utf8'));
const base='http://127.0.0.1:3000',browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext(),page=await context.newPage({viewport:{width:Number(process.env.QA_VIEWPORT_WIDTH??1440),height:900}}),external=[],api=[],errors=[],failed=[],checks=[];
context.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());if(r.url().includes('/api/'))api.push(r.url());});
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
try{
 for(const item of inventory){
  const res=await page.goto(base+item.local_route);if(res.status()!==200)throw Error('Route failed '+item.local_route);
  await page.getByRole('heading',{name:item.title,exact:true,level:1}).waitFor();
  const record={route:item.local_route,modes:[]};
  if(item.id!=='real-estate'){
   const modes=item.implemented_modes;
   for(let i=0;i<modes.length;i++){
    await selectCalculatorMode(page,modes[i].id);
    // Default-model checks start independently; draft continuity has focused coverage.
    if(['student-loan','margin','commission','savings'].includes(item.id)&&modes[i].id!=='any-two')await page.getByRole('button',{name:'Reset',exact:true}).click();
    await page.getByRole('button',{name:/^Calculate/}).click();
    await page.locator('.result h2').waitFor({timeout:10000});
    if(await page.locator('.error[role=alert]').count())throw Error(await page.locator('.error[role=alert]').innerText());
    if(/NaN|Infinity/.test(await page.locator('.result').innerText()))throw Error('Nonfinite '+item.id);
    if(process.env.QA_VIEWPORT_WIDTH&&await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile overflow '+item.id+' mode '+i);
    record.modes.push(modes[i].title);
   }
  }
  checks.push(record);
 }
 await page.goto(base+'/currency-converter.html?mode=live&amount=100&from=USD&to=EUR');
 await page.getByRole('tab',{name:'Saved Reference Rates'}).waitFor();await page.locator('.result h2').waitFor();
 if(!await page.getByRole('tab',{name:'Saved Reference Rates'}).evaluate(el=>el.getAttribute('aria-selected')==='true'))throw Error('Legacy live link not migrated');
 if(external.length||api.length||errors.length||failed.length)throw Error(JSON.stringify({external,api,errors,failed}));
 console.log(JSON.stringify({routes:checks.length,modes:checks.reduce((n,r)=>n+r.modes.length,0),external_requests:external.length,api_requests:api.length,errors:errors.length}));
 await fs.writeFile('docs/financial-clone/evidence/'+(process.env.QA_VIEWPORT_WIDTH?'browser-static-mobile-qa.json':'browser-static-qa.json'),JSON.stringify({tested_at:new Date().toISOString(),viewport_width:Number(process.env.QA_VIEWPORT_WIDTH??1440),passed:true,checks,external,api,errors,failed,legacy_live_link:'mapped to dated snapshot'},null,2));
}finally{await browser.close();}
