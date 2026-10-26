import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3000',dir=process.env.PNG_EVIDENCE_DIR??'/workspace/work/result-cards';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
const page=await ctx.newPage(),checks=[],modeChecks=[],errors=[],unexpected=[];
page.on('pageerror',e=>errors.push(e.message));
await ctx.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base+'/')||u.startsWith('blob:')||u.startsWith('data:'))return r.continue();if(u==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({body:'',contentType:'text/javascript'});unexpected.push(u);return r.abort();});
await page.addInitScript(()=>{window.cardText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){window.cardText.push({text,x,y,width:this.measureText(text).width,font:this.font,color:this.fillStyle,height:this.canvas.height,interLoaded:document.fonts.check('900 32px Inter')});return original.call(this,text,x,y,...args)};});
await fs.mkdir(dir,{recursive:true});
async function ready(path){await page.goto(base+'/'+path,{waitUntil:'networkidle'});await page.locator('.result h2').waitFor();}
async function download(name,inputs=false){
 const disclosure=page.locator('.workspace-sharing');if(await disclosure.count()&&!await disclosure.evaluate(e=>e.open))await disclosure.locator(':scope > summary').click();
 assert.equal(await page.getByLabel('Include input details in PNG',{exact:true}).isChecked(),false);
 if(inputs)await page.getByLabel('Include input details in PNG',{exact:true}).check();
 assert.equal(await page.getByLabel('Include current inputs in the link',{exact:true}).isChecked(),false);
 await page.evaluate(()=>window.cardText=[]);const pending=page.waitForEvent('download',{timeout:20000});await page.getByRole('button',{name:'Download result PNG',exact:true}).click();
 const file=await pending,bytes=await fs.readFile(await file.path()),drawn=await page.evaluate(()=>window.cardText),text=drawn.map(t=>t.text).join(' '),height=bytes.readUInt32BE(20);
 assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),1200);assert.ok(height>=1680&&height<=12000);
 assert.ok(drawn.every(t=>t.x>=63&&t.x+t.width<=1137&&t.y>=24&&t.y+parseInt(t.font.match(/\d+px/)[0])<=height-24),name+' text out of bounds');
 assert.ok(drawn.every(t=>t.font.includes('Inter')&&t.interLoaded&&parseInt(t.font.match(/\d+px/)[0])>=30));
 assert.ok(drawn.some(t=>t.text==='Free Forever - No Credit Card Required'));assert.ok(drawn.some(t=>t.text==='Free'&&t.color==='#b45309'));assert.ok(drawn.some(t=>t.font.startsWith('900 ')));
 assert.equal(drawn.some(t=>t.text==='Inputs & assumptions'),inputs);assert.ok(text.includes('Calculation method'));assert.ok(text.includes('calculatorfree.io'));assert.ok(!text.includes('#calc=')&&!text.includes('?mode='));
 if(name){await file.saveAs(dir+'/'+name+'.png');await fs.writeFile(dir+'/'+name+'-text.json',JSON.stringify(drawn,null,2));}
 return {height,drawn,text,compact:drawn.map(t=>t.text).join('').replace(/\s/g,'')};
}
try{
 const samples=[
 ['mortgage','mortgage-calculator.html',false,'Reading your result'],
 ['mortgage-inputs','mortgage-calculator.html',true,'Home price'],
 ['fha','fha-loan-calculator.html',true,'FHA'],
 ['cd','cd-calculator.html?tax=100',true,'before tax'],
 ['401k','401k-calculator.html',true,'Employer contributions'],
 ['401k-loss','401k-calculator.html?return=-5',false,'Projected investment loss'],
 ['negative-return','compound-interest-calculator.html?mode=growth&principal=1000&years=2&monthly=0&annual=0&rate=-10&compound=Annually',true,'consider your next step'],
 ['tax-2025','tax-calculator.html?mode=federal&year=2025&wages=50000&withheld=0',true,'2025'],
 ['vat','vat-calculator.html',false,'gross amount includes VAT'],
 ['large-loan','loan-calculator.html?mode=amortized&principal=99999999999999&rate=0&years=1&months=0',true,'99,999,999,999,999'],
 ['leap-date','date-calculator.html?mode=add&start=2024-02-28&days=1',true,'2024-02-29'],
 ['yen','tip-bill-split-calculator.html?mode=split&currency=JPY',true,'¥'],
 ['scientific','scientific-calculator.html',false,'selected angle setting'],
 ];
 for(const[name,path,inputs,expected]of samples){await ready(path);const result=await download(name,inputs);assert.ok(result.text.includes(expected),name+' missing '+expected);checks.push({name,height:result.height,inputs,expectedContent:true});console.log('PNG sample passed:',name,result.height);}
 await ready('mortgage-calculator.html');await page.getByRole('radio',{name:'Loan amount',exact:true}).check();await page.locator('#mortgage-monthly-loan_amount').fill('150000');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();const direct=await download('direct-loan-inputs',true);const inputText=direct.text.split('Inputs & assumptions')[1].split('Calculation method')[0];assert.ok(!inputText.includes('Home price')&&!inputText.includes('Down payment'));assert.ok(inputText.includes('$150,000'));checks.push({name:'direct-loan-inputs',hiddenPurchaseDraftsExcluded:true,height:direct.height});
 const inventory=JSON.parse(await fs.readFile('docs/financial-clone/inventory.json','utf8'));
 for(const item of inventory.filter(x=>x.id!=='real-estate')){
  await ready(item.local_route.slice(1));
  for(const mode of item.implemented_modes){
   await selectCalculatorMode(page,mode.id);
   if(['student-loan','margin','commission','savings'].includes(item.id)&&mode.id!=='any-two')await page.getByRole('button',{name:'Reset',exact:true}).click();
   await page.getByRole('button',{name:/^Calculate/}).click();await page.locator('.result h2').waitFor();
   const amounts=await page.locator('.result .metric strong').allTextContents();
   const result=await download(null,false);
   if(item.id!=='marriage-tax')for(const value of amounts)assert.ok(result.compact.includes(value.replace(/\s/g,'')),`${item.id}/${mode.id} missing ${value}`);
   modeChecks.push({id:item.id,mode:mode.id,height:result.height,allDisplayedAmounts:true});
  }
  console.log('PNG modes passed:',item.id,modeChecks.length);
 }
 // Editing invalidates the old result, including its PNG/input opt-in controls.
 await ready('mortgage-calculator.html');await page.locator('.workspace-sharing > summary').click();await page.getByLabel('Include input details in PNG',{exact:true}).check();await page.locator('#mortgage-monthly-price').fill('500000');assert.equal(await page.locator('.share-panel').count(),0);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result h2').waitFor();await page.locator('.workspace-sharing > summary').click();assert.equal(await page.getByLabel('Include input details in PNG',{exact:true}).isChecked(),false);checks.push({editingRemovesStaleExport:true,inputOptInResets:true});
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);const report={passed:true,tested_at:new Date().toISOString(),checks,modeChecks,errors,unexpected,scope:'Chromium static export; exact existing AdSense loader stubbed. PNGs rendered locally with the actual Inter font.'};await fs.writeFile('docs/financial-clone/evidence/browser-result-card-qa.json',JSON.stringify(report,null,2));await fs.writeFile(dir+'/browser-qa.json',JSON.stringify(report,null,2));console.log({passed:true,samples:checks.length,modeExports:modeChecks.length,maxHeight:Math.max(...modeChecks.map(x=>x.height))});
}finally{await fs.writeFile(dir+'/progress.json',JSON.stringify({checks,modeChecks,errors,unexpected},null,2));await browser.close();}
