import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base='http://127.0.0.1:3165',dir='/workspace/work/directory-search';
await fs.mkdir(dir,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-static.mjs'],{env:{...process.env,PORT:'3165'},stdio:['ignore','pipe','pipe']});
await once(server.stdout,'data');
let browser;const checks=[],errors=[],unexpected=[];
const ads='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659';
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext();
 await context.route('**/*',async route=>{const url=route.request().url();if(url.startsWith(base+'/'))return route.continue();if(url===ads)return route.fulfill({contentType:'text/javascript',body:''});unexpected.push(url);await route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const input=page.getByRole('combobox',{name:'Find a calculator'}),options=page.getByRole('option');
 for(const width of [320,390,700,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/financial-calculator.html');
  const expression=page.getByLabel('Expression',{exact:true});await expression.fill('2+3');await expression.press('Enter');await page.locator('.quick-answer').getByText('5',{exact:true}).waitFor();
  await input.fill('401');await options.first().waitFor();assert.equal(page.url(),base+'/financial-calculator.html');
  assert.deepEqual(await options.allTextContents(),['401K Calculator']);assert.equal(await input.getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('.directory-grid li').count(),82);assert.equal(await page.getByRole('heading',{name:'Search results',exact:true}).count(),0);
  assert.ok(await page.locator('.quick-calculator').isVisible());
  const field=await input.boundingBox(),popup=await page.locator('.directory-suggestions').boundingBox();
  assert.ok(popup.y>=field.y+field.height&&popup.y-field.y-field.height<8);assert.ok(popup.x>=0&&popup.x+popup.width<=width+1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await input.fill('tax');await options.nth(1).waitFor();await input.press('Enter');assert.equal(page.url(),base+'/financial-calculator.html');
  await input.press('ArrowDown');assert.equal(await input.getAttribute('aria-activedescendant'),'directory-search-option-0');assert.equal(await options.first().getAttribute('aria-selected'),'true');
  await input.press('ArrowUp');assert.equal(await options.last().getAttribute('aria-selected'),'true');
  await input.press('Escape');assert.equal(await input.getAttribute('aria-expanded'),'false');
  await input.press('ArrowDown');assert.equal(await input.getAttribute('aria-expanded'),'true');
  await page.getByRole('heading',{name:'Financial Calculators',exact:true}).click();assert.equal(await input.getAttribute('aria-expanded'),'false');
  await input.focus();assert.equal(await input.getAttribute('aria-expanded'),'true');
  await input.press('Tab');assert.equal(await input.getAttribute('aria-expanded'),'false');
  await input.fill('401');await input.scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/suggestions-${width}.png`});
  await page.getByRole('button',{name:'Clear search',exact:true}).click();assert.equal(await input.inputValue(),'');assert.equal(await input.getAttribute('aria-expanded'),'false');
  assert.equal(await expression.inputValue(),'2+3');assert.equal(await page.locator('.quick-answer').innerText(),'5');
  checks.push({width,instantNames:true,only401k:true,popupPosition:true,keyboardDismissal:true,preservedQuickCalculator:true,noOverflow:true});
 }
 for(const [q,path,action,mode] of [
  ['401','401k','click'],['car payment','auto-loan','enter','payment'],['CAGR Calculator','cagr','button'],
  ['tax','estate-tax','keyboard'],['compound interest calculator with monthly contributions','compound-interest','click','growth'],
  ['savings calculator goal','savings','enter','goal-contribution'],['compound interest calculator daily','compound-interest','click','growth'],['irr calculator with dates','average-return','click','cashflows'],
 ]){
  await page.goto(base+'/financial-calculator.html');await input.fill(q);await options.first().waitFor();
  if(action==='click')await options.first().click();else if(action==='button')await page.getByRole('button',{name:'Search',exact:true}).click();else {if(action==='keyboard')await input.press('ArrowDown');await input.press('Enter');}
  await page.waitForURL(url=>url.pathname===`/${path}-calculator.html`);if(mode){assert.equal(new URL(page.url()).searchParams.get('mode'),mode);await page.waitForFunction(m=>document.getElementById('tab-'+m)?.getAttribute('aria-selected')==='true',mode);}
  if(q==='compound interest calculator daily')assert.equal(await page.locator('#compound-interest-growth-compound').inputValue(),'Daily');
  checks.push({query:q,action,path,mode});
 }
 await page.goto(base+'/financial-calculator.html');await input.fill('calculator');assert.equal(await options.count(),8);await page.getByRole('button',{name:'Show all 82 matching calculators'}).click();assert.equal(await options.count(),82);assert.equal(new Set(await options.allTextContents()).size,82);assert.ok(await page.evaluate(()=>document.querySelector('.directory-suggestions').scrollHeight>document.querySelector('.directory-suggestions').clientHeight));checks.push('Expand all matches in one scrollable list');
 await input.fill('no-match-xyz');await page.getByText('No calculators found.',{exact:false}).waitFor();assert.equal(await options.count(),0);await input.press('Enter');assert.equal(page.url(),base+'/financial-calculator.html');await page.getByRole('button',{name:'Clear search'}).click();checks.push('No-result recovery');
 const nojs=await browser.newContext({javaScriptEnabled:false});await nojs.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());const staticPage=await nojs.newPage();await staticPage.goto(base+'/financial-calculator.html');assert.equal(await staticPage.locator('.directory-grid li a').count(),82);await staticPage.locator('.directory-grid a[href="/401k-calculator.html"]').click();assert.equal(new URL(staticPage.url()).pathname,'/401k-calculator.html');checks.push('All 82 names and links work without JavaScript');await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
 const report={checks,errors,unexpected,tested_at:new Date().toISOString(),ads:'Exact approved loader stubbed; no live advertisement audit'};
 await fs.writeFile('docs/financial-clone/evidence/browser-directory-search-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();server.kill();}
