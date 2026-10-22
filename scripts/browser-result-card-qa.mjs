import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {selectCalculatorMode} from './browser-mode-controls.mjs';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({acceptDownloads:true,viewport:{width:390,height:844}});const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.cardText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){window.cardText.push({text,x,y,width:this.measureText(text).width,font:this.font,height:this.canvas.height});return original.call(this,text,x,y,...args);};});
await fs.mkdir('/workspace/work/result-cards',{recursive:true});
try{
 for(const [name,route,expected] of [
  ['mortgage','mortgage-calculator.html','READING YOUR RESULT'],
  ['retirement','retirement-calculator.html?mode=saving&age=35&retire=67&target=600000&balance=30000&return=6','alternative plan'],
  ['loss','compound-interest-calculator.html?mode=growth&principal=1000&years=2&monthly=0&annual=0&rate=-10&compound=Annually','consider your next step'],
  ['tax','tax-calculator.html?mode=federal&year=2025&wages=50000&withheld=0','remains owed'],
  ['vat','vat-calculator.html','gross amount includes VAT'],
  ['percentage','percentage-calculator.html','heavy lifting'],
  ['scientific','scientific-calculator.html','selected angle setting'],
 ]){
  await page.goto('http://127.0.0.1:3000/'+route);await page.locator('.result h2').waitFor();
  if(name==='loss')await page.waitForFunction(()=>document.querySelector('form [id$="-rate"]')?.value==='-10'&&document.querySelector('.result-context')?.textContent?.includes('-$190.00'));
  if(name==='tax')await page.waitForFunction(()=>document.querySelector('.result-context')?.textContent?.includes('tax year 2025'));
  if(name==='retirement')await page.waitForFunction(()=>document.querySelector('.result-context')?.textContent?.includes('$362.74'));
  const pending=page.waitForEvent('download',{timeout:10000});await page.getByRole('button',{name:'Download result PNG',exact:true}).click();const download=await pending;const file='/workspace/work/result-cards/'+name+'.png';await download.saveAs(file);
  const drawn=await page.evaluate(()=>window.cardText),text=drawn.map(x=>x.text).join(' ');assert.ok(text.includes(expected));assert.ok(text.includes('LOCAL PREVIEW'));assert.ok(text.includes('calculatorfree.io'));assert.ok(!text.includes('#calc=')&&!text.includes('?mode='));
  assert.ok(drawn.every(t=>t.x>=64&&t.x+t.width<=1137&&t.y+parseInt(t.font.match(/\d+px/)[0])<=t.height-24));
  const png=await fs.readFile(file);assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),1680);
  assert.ok(drawn.every(t=>parseInt(t.font.match(/\d+px/)[0])>=30));assert.ok(drawn.some(t=>t.text==='calculatorfree.io'&&parseInt(t.font.match(/\d+px/)[0])>=64));
  checks.push({name,width:1200,height:1680,aspectRatio:'5:7',minimumFont:30,brandFont:64,copy:true,textWithinCard:true,cleanToolAddress:true});
 }
 const inventory=JSON.parse(await fs.readFile('docs/financial-clone/inventory.json','utf8')),modeChecks=[];
 for(const item of inventory.filter(x=>x.id!=='real-estate')){
  await page.goto('http://127.0.0.1:3000'+item.local_route);await page.locator('.result h2').waitFor();
  const modes=item.implemented_modes;
  for(let i=0;i<modes.length;i++){
   await selectCalculatorMode(page,modes[i].id);
    // Default-model checks start independently; draft continuity has focused coverage.
    if(['student-loan','margin','commission','savings'].includes(item.id)&&modes[i].id!=='any-two')await page.getByRole('button',{name:'Reset',exact:true}).click();
   await page.getByRole('button',{name:/^Calculate/}).click();await page.locator('.result h2').waitFor();
   await page.evaluate(()=>window.cardText=[]);
   const pending=page.waitForEvent('download',{timeout:10000});await page.getByRole('button',{name:'Download result PNG',exact:true}).click();
   const download=await pending;const bytes=await fs.readFile(await download.path());
   assert.equal(bytes.readUInt32BE(16),1200,item.id);assert.equal(bytes.readUInt32BE(20),1680,item.id);
   const text=await page.evaluate(()=>window.cardText);
   assert.ok(text.every(t=>t.x>=64&&t.x+t.width<=1137&&t.y+parseInt(t.font.match(/\d+px/)[0])<=t.height-24),item.id+' text bounds');
   const ordered=[...text].sort((a,b)=>a.y-b.y);for(let j=1;j<ordered.length;j++){
    const a=ordered[j-1],b=ordered[j];if(a.x===b.x)assert.ok(a.y+parseInt(a.font.match(/\d+px/)[0])<=b.y,item.id+' overlapping lines');
   }
   modeChecks.push({id:item.id,mode:modes[i].title,width:1200,height:1680,textWithinCard:true});
  }
 }
 assert.deepEqual(errors,[]);await fs.writeFile('docs/financial-clone/evidence/browser-result-card-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,modeChecks,errors},null,2));console.log({checks:checks.length,modeExports:modeChecks.length,errors:errors.length});
}finally{await browser.close();}
