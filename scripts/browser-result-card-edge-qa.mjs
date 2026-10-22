import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({acceptDownloads:true,viewport:{width:390,height:844}}),page=await context.newPage(),checks=[];
// Serve the local build under the production origin; never contact the live site.
await context.route('https://calculatorfree.io/**',async route=>{
 const url=new URL(route.request().url());url.protocol='http:';url.host='127.0.0.1:3000';
 const response=await route.fetch({url:url.href});await route.fulfill({response});
});
await page.addInitScript(()=>{window.cardText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){window.cardText.push({text,x,y,width:this.measureText(text).width,font:this.font});return original.call(this,text,x,y,...args);};});
try{
 for(const [name,route,key,value] of [
  ['large-loan','loan-calculator.html?mode=amortized&principal=99999999999999&rate=0&years=1&months=0','principal','99999999999999'],
  ['leap-date','date-calculator.html?mode=add&start=2024-02-28&days=1','start','2024-02-28'],
  ['yen','tip-bill-split-calculator.html?mode=split&currency=JPY','currency','JPY'],
 ]){
  await page.goto('https://calculatorfree.io/'+route);
  await page.waitForFunction(({key,value})=>document.querySelector(`form [id$="-${key}"]`)?.value===value,{key,value});
  await page.locator('.result h2').waitFor();
  const numbers=await page.locator('.result .metric strong').allTextContents();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const download=await pending;
  const file='/workspace/work/result-cards/'+name+'.png';await download.saveAs(file);
  const png=await fs.readFile(file);assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),1680);
  const drawn=await page.evaluate(()=>window.cardText),text=drawn.map(x=>x.text).join(' '),compact=drawn.map(x=>x.text).join('').replace(/\s/g,'');
  for(const number of numbers.slice(0,5))assert.ok(compact.includes(number.replace(/\s/g,'')),name+' preserves displayed value '+number);
  assert.ok(drawn.every(t=>t.x>=64&&t.x+t.width<=1137&&t.y+parseInt(t.font.match(/\d+px/)[0])<=1656));
  assert.ok(text.includes('https://calculatorfree.io/'));assert.ok(!/LOCAL PREVIEW|\?mode=|#calc=|principal=/.test(text));
  checks.push({name,aspectRatio:'5:7',valuesMatchDisplayedResult:true,productionBrand:true,cleanToolAddress:true,textWithinCard:true});
 }
 const preview=await browser.newPage({viewport:{width:390,height:546},deviceScaleFactor:1});
 for(const name of ['mortgage','scientific']){
  const png=await fs.readFile('/workspace/work/result-cards/'+name+'.png');
  await preview.setContent('<style>html,body{margin:0}img{display:block;width:390px;height:546px}</style><img src="data:image/png;base64,'+png.toString('base64')+'">');
  await preview.locator('img').evaluate(img=>img.decode());await preview.screenshot({path:'/workspace/work/result-cards/'+name+'-mobile.png'});
 }
 await fs.writeFile('docs/financial-clone/evidence/browser-result-card-edge-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,mobilePreview:{width:390,height:546}},null,2));console.log({checks:checks.length});
}finally{await browser.close();}
