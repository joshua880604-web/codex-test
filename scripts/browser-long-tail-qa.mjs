import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:3000';
const data=JSON.parse(await fs.readFile('src/lib/long-tail-content.json','utf8'));
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const route=id=>catalog.find(item=>item.id===id).local_route;
const href=link=>route(link.id)+'?'+new URLSearchParams({mode:link.mode,...link.values})+'#calculator-panel';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],unexpected=[],checks=[];
const allow=async request=>{
  const url=request.request().url();
  if(url.startsWith(base+'/'))return request.continue();
  if(url==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return request.fulfill({contentType:'text/javascript',body:''});
  unexpected.push(url);return request.abort();
};
try {
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await plain.route('**/*',allow);const staticPage=await plain.newPage();let answers=0,links=0;
  for(const [id,content] of Object.entries(data)) {
    await staticPage.goto(base+route(id));
    for(const item of content.items){
      const section=staticPage.locator('#'+item.anchor);
      assert.equal(await section.locator('h3').innerText(),item.question);
      assert.equal(await section.locator('p').first().innerText(),item.answer);
      for(const link of item.links){assert.equal(await section.getByRole('link',{name:link.label,exact:true}).getAttribute('href'),href(link));links++;}
      answers++;
    }
    assert.ok(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' static overflow');
  }
  checks.push({serverRenderedPages:Object.keys(data).length,answers,links,noJavaScriptRequiredToRead:true,mobileOverflow:false});
  await plain.close();
  const context=await browser.newContext({reducedMotion:'reduce'});await context.route('**/*',allow);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const targets=[...new Map(Object.values(data).flatMap(content=>content.items.flatMap(item=>item.links)).map(link=>[href(link),link])).values()];
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    for(const link of targets) {
      await page.goto(base+href(link));
      await page.locator('[id^="'+link.id+'-'+link.mode+'-"]').first().waitFor({state:'attached'});
      const tab=page.locator('#tab-'+link.mode);
      if(await tab.count())assert.equal(await tab.getAttribute('aria-selected'),'true');
      for(const [key,value] of Object.entries(link.values??{}))assert.equal(await page.locator('[id="'+link.id+'-'+link.mode+'-'+key+'"]').inputValue(),value);
      await page.locator('.result h2').waitFor();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),href(link)+' overflow');
    }
    // Exercise a real question link, including its anchor and hydration-selected mode.
    await page.goto(base+route('cagr'));
    const question=data.cagr.items.find(item=>item.links.some(link=>link.id==='average-return'));
    await page.locator('#'+question.anchor).getByRole('link').click();
    await page.waitForURL('**/average-return-calculator.html?mode=cashflows#calculator-panel');
    await page.locator('#tab-cashflows[aria-selected="true"]').waitFor();
    checks.push({width,uniqueModeTargets:targets.length,realQuestionLink:true,modeSelection:true,overflow:false});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  const report={passed:true,checks,errors,unexpected,tested_at:new Date().toISOString(),adLoader:'Exact existing publisher loader stubbed; no live-ad claim'};
  await fs.writeFile('docs/financial-clone/evidence/browser-long-tail-qa.json',JSON.stringify(report,null,2)+'\n');console.log(report);
} finally {await browser.close();}
