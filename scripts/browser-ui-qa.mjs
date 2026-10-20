import fs from 'node:fs/promises';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[];const errors=[];
try {
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000/financial-calculator.html');
 const search=page.getByLabel('Find a calculator');await search.fill('  mortgage  ');if(await page.locator('.directory-grid li').count()<1)throw Error('Trimmed search failed');await page.getByRole('button',{name:'Clear search'}).click();if(await page.locator('.directory-grid li').count()!==75)throw Error('Directory reset');checks.push('Directory search trims whitespace and clears back to all 75 entries');
 await page.goto('http://127.0.0.1:3000/401k-calculator.html');
 if(!(await page.getByLabel('Employer match',{exact:true}).getAttribute('aria-describedby')))throw Error('No accessible matching help');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.getByRole('columnheader',{name:'Year-end balance',exact:true}).waitFor();
 if(await page.locator('.field-control input').first().evaluate(el=>el.getBoundingClientRect().height)<44)throw Error('Small input');
 checks.push('401k matching help, year-end table labels, 44px mobile inputs');
 await page.getByRole('tab').first().focus();await page.keyboard.press('ArrowRight');if(await page.getByRole('tab',{selected:true}).innerText()!=='Early Withdrawal Cost')throw Error('Keyboard tabs');checks.push('Arrow-key mode navigation');
 await page.getByRole('tab').first().click();await page.getByLabel('Annual salary',{exact:true}).fill('90000');await page.getByRole('button',{name:'Reset',exact:true}).click();if(await page.getByLabel('Annual salary',{exact:true}).inputValue()!=='80000')throw Error('Reset');checks.push('Reset restores starting values');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(const route of ['financial-calculator.html','401k-calculator.html','mortgage-calculator.html','vat-calculator.html']){await page.goto('http://127.0.0.1:3000/'+route);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+width+route);checks.push({route,width,overflow:false});}}
 if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile('docs/financial-clone/evidence/browser-ui-qa.json',JSON.stringify({passed:true,tested_at:new Date().toISOString(),checks,errors},null,2));console.log({passed:true,checks:checks.length});
}finally{await browser.close();}
