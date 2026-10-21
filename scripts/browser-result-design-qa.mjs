import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({acceptDownloads:true});const checks=[];
await fs.mkdir('/workspace/work/result-design',{recursive:true});
try {
 for(const route of ['mortgage','retirement','marriage','scientific','vat']){
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:3000/'+route+'-calculator.html');await page.locator('.result h2').waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.equal(await page.locator('.summary-preview').count(),0);assert.equal(await page.locator('.share-options').evaluate(n=>n.open),false);
   assert.equal(await page.locator('.result').evaluate(n=>{const share=n.querySelector('.share-panel');return [...n.querySelectorAll('.result-note,.table-scroll')].every(el=>Boolean(el.compareDocumentPosition(share)&Node.DOCUMENT_POSITION_FOLLOWING));}),true);
   const clipped=await page.locator('.metric strong').evaluateAll(nodes=>nodes.some(n=>n.scrollWidth>n.clientWidth+1));assert.equal(clipped,false);
   if(width===1440){const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download result PNG',exact:true}).click();await(await download).saveAs('/workspace/work/result-design/'+route+'.png');}
   await page.locator('.result').screenshot({path:`/workspace/work/result-design/${route}-${width}.png`});checks.push({route,width,overflow:false,clipped:false});
  }
 }
 await fs.writeFile('docs/financial-clone/evidence/browser-result-design-qa.json',JSON.stringify({date:new Date().toISOString(),checks},null,2));console.log(JSON.stringify({checks:checks.length}));
}finally{await browser.close();}
