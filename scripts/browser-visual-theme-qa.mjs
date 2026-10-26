import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const project=process.cwd(),dir=process.env.UI_EVIDENCE_DIR??'/workspace/work/amortio-ui-release-20261026';
const base='http://127.0.0.1:3500',old='http://127.0.0.1:3501';
const servers=[];let browser;const checks=[],errors=[],unexpected=[],fontResponses=[];
const ad='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
try {
 for(const [port,cwd] of [['3500',project],['3501',dir+'/baseline']]){
  const server=spawn(process.execPath,[project+'/scripts/serve-static.mjs'],{cwd,env:{...process.env,PORT:port},stdio:['ignore','pipe','pipe']});servers.push(server);await once(server.stdout,'data');
 }
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});
 await context.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base+'/')||u.startsWith(old+'/')||u.startsWith('blob:'))return r.continue();if(u===ad)return r.fulfill({body:'',contentType:'text/javascript'});unexpected.push(u);return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().endsWith('.woff2'))fontResponses.push({url:r.url(),status:r.status()});});
 const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
 const geometry=()=>page.evaluate(()=>{const rect=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {width:r.width,x:r.x}};return Object.fromEntries(['.page-wrap','main','.sidebar','.calculator-workspace','.calculator-form','.result','.quick-calculator'].map(s=>[s,rect(s)]));});
 async function loaded(origin,path){await page.goto(origin+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
 async function noOverflow(){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),page.url()+' horizontal overflow');}
 for(const width of [320,390,768,1440])for(const id of ['financial','mortgage','cd','fha-loan','401k','compound-interest']){
  await page.setViewportSize({width,height:width<=390?844:1024});const path='/'+id+'-calculator.html';await loaded(old,path);if(id!=='financial')await page.locator('.result h2').waitFor();const before=await geometry(),metrics=id==='financial'?null:await page.locator('.result .metric').allTextContents();
  await loaded(base,path);if(id!=='financial')await page.locator('.result h2').waitFor();const after=await geometry();
  for(const key in before)if(before[key]&&after[key])assert.ok(Math.abs(before[key].width-after[key].width)<=1,`${id} ${width} ${key} width changed`);
  if(metrics)assert.deepEqual(await page.locator('.result .metric').allTextContents(),metrics,`${id} default result changed`);
  const font=await page.locator('h1').evaluate(e=>({family:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight}));assert.ok(font.family.startsWith('Inter'));assert.equal(font.weight,'900');
  const doc=await cdp.send('DOM.getDocument');const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'h1'});const rendered=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});assert.ok(rendered.fonts.some(f=>f.isCustomFont&&/^Inter/.test(f.familyName)&&f.glyphCount>0));
  await noOverflow();if(width>=1120){assert.equal(Math.round(after['.page-wrap'].width),1120);if(after['.sidebar'])assert.equal(Math.round(after['.sidebar'].width),320);}
  if(width===390||width===1440)await page.screenshot({path:`${dir}/${id}-${width}.png`});
  if(id==='mortgage'&&width<=390){const r=await page.getByRole('button',{name:'Calculate',exact:true}).boundingBox();assert.ok(r.y+r.height<=844);}
  checks.push({kind:'unchangedWidthsAndResults',id,width,customInter:true,h1Weight:900});
 }
 for(const [width,height] of [[320,480],[320,568],[360,540],[360,560],[360,561],[360,600],[360,640],[375,667],[390,600],[390,664],[390,844],[412,732],[412,915],[700,700]]){
  await page.setViewportSize({width,height});await loaded(base,'/financial-calculator.html');await page.getByRole('button',{name:'Basic',exact:true}).waitFor();
  const card=await page.locator('.quick-calculator').boundingBox(),search=await page.locator('.directory-search').boundingBox();assert.ok(search.y+search.height<=card.y);assert.ok(search.height<=46);assert.ok(card.y+card.height<=height,JSON.stringify({width,height,bottom:card.y+card.height}));await noOverflow();
  for(const key of ['2','+','3'])await page.locator('.quick-keys').getByRole('button',{name:key,exact:true}).click();await page.getByRole('button',{name:'Calculate =',exact:true}).click();await page.locator('.quick-answer').getByText('5',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>scrollY),0);
  checks.push({kind:'homeFirstScreen',width,height,bottom:card.y+card.height,arithmetic:true});
 }
 await page.setViewportSize({width:390,height:844});await loaded(base,'/mortgage-calculator.html');await page.locator('.mobile-menu > summary').click();assert.ok(await page.locator('.mobile-menu nav').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-menu nav').isVisible(),false);
 const search=page.locator('.sidebar-search input');await search.fill('401');await page.getByRole('option',{name:'401K Calculator',exact:true}).waitFor();await page.getByRole('option',{name:'401K Calculator',exact:true}).click();await page.waitForURL('**/401k-calculator.html');checks.push({kind:'menuAndInstantSearch',passed:true});
 for(const width of [320,390,768,1440])for(const id of ['mortgage','cd']){
  await page.setViewportSize({width,height:1000});await loaded(base,'/'+id+'-calculator.html');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();
  if(id==='cd')await page.locator('.workspace-chart > summary').click();await page.locator('.workspace-report-chart svg:visible').waitFor();
  await page.locator('.workspace-details > summary').click();const r=await page.locator('main').boundingBox();for(const s of ['.workspace-report-chart','.workspace-report-details']){const box=await page.locator(s).boundingBox();assert.ok(Math.abs(box.width-r.width)<1);assert.ok(Math.abs(box.x-r.x)<1);}
  const table=page.locator('.table-scroll');const dims=await table.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));if(width===1440)assert.ok(dims.scroll<=dims.width+1);
  if(dims.scroll>dims.width){await table.evaluate(e=>e.scrollLeft=e.scrollWidth);assert.ok(await table.evaluate(e=>e.scrollLeft>0));await table.evaluate(e=>e.scrollLeft=0);}
  await page.getByRole('button',{name:'Yearly',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Yearly',exact:true}).getAttribute('aria-pressed'),'true');
  if(width===390||width===1440){await page.locator('.result').screenshot({path:`${dir}/${id}-result-${width}.png`});await page.locator('.workspace-report-chart').screenshot({path:`${dir}/${id}-chart-${width}.png`});await page.locator('.workspace-report-details').screenshot({path:`${dir}/${id}-table-${width}.png`});}
  if(width===1440){const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();assert.match(await fs.readFile(await (await download).path(),'utf8'),/year/i);await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});assert.equal(await page.locator('.sidebar').isVisible(),false);assert.ok(await table.isVisible());assert.equal(await page.locator('.result').evaluate(e=>getComputedStyle(e).boxShadow),'none');await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));await page.emulateMedia({media:'screen'});}
  await noOverflow();checks.push({kind:'wideReports',id,width,fullMainWidth:true,scrollableTable:true,periodSwitch:true});
 }
 await page.setViewportSize({width:390,height:844});for(const path of ['/about.html','/methodology.html','/glossary/']){await loaded(base,path);await noOverflow();assert.equal(await page.locator('h1').count(),1);checks.push({kind:'contentPage',path});}
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);assert.ok(fontResponses.length);assert.ok(fontResponses.every(r=>r.status===200&&r.url===base+'/fonts/inter-latin-variable-3100e775.woff2'));
 const headers=await fs.readFile('public/_headers','utf8');assert.match(headers,/\/fonts\/\*\.woff2\n  Cache-Control: public, max-age=31536000, immutable/);
 const result={passed:true,checks,errors,unexpected,localFontBytes:(await fs.stat('public/fonts/inter-latin-variable-3100e775.woff2')).size,fontResponses,testedAt:new Date().toISOString(),limits:'Chromium local exported build; exact existing AdSense loader stubbed. No physical iPhone or live ad claim.'};await fs.writeFile(dir+'/browser-qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,checks:checks.length,errors,unexpected,localFontBytes:result.localFontBytes}));
}finally{await browser?.close();for(const server of servers)server.kill();await fs.writeFile(dir+'/browser-progress.json',JSON.stringify({checks,errors,unexpected},null,2));}
