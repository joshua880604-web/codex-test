import fs from 'node:fs/promises';
const insights=JSON.parse(await fs.readFile('src/lib/guide-insights.json','utf8')),catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage(),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const id of Object.keys(insights)){
  const route=catalog.find(c=>c.id===id).local_route;await page.goto('http://127.0.0.1:3000'+route);
  await page.getByRole('navigation',{name:'Calculation guide sections'}).getByRole('link',{name:'Reading results',exact:true}).click();
  if(new URL(page.url()).hash!=='#reading-results')throw Error(id+' anchor');
  await page.locator('.result-definitions dt').first().waitFor();
  for(const width of [390,768]){await page.setViewportSize({width,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error(id+' overflow '+width);}
  checks.push({id,navigation:'passed',widths:[390,768]});
 }
 if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile('docs/financial-clone/evidence/browser-guide-insights-qa.json',JSON.stringify({passed:true,checks,errors,tested_at:new Date().toISOString()},null,2)+'\n');console.log({pages:checks.length,errors:errors.length});
}finally{await browser.close();}
