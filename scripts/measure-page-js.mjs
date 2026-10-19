import fs from 'node:fs/promises';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const report=[];
try { for(const route of ['financial-calculator.html','mortgage-calculator.html','401k-calculator.html','vat-calculator.html']) {
 const page=await browser.newPage(); const resources=[]; const jobs=[];
 page.on('response',r=>{if(new URL(r.url()).pathname.endsWith('.js'))jobs.push(r.body().then(b=>resources.push({path:new URL(r.url()).pathname,decoded_bytes:b.length})));});
 await page.goto('http://127.0.0.1:3000/'+route); await page.waitForLoadState('networkidle'); await Promise.all(jobs);
 const initial={script_count:resources.length,decoded_js_bytes:resources.reduce((n,r)=>n+r.decoded_bytes,0)};
 if(route!=='financial-calculator.html') { await page.getByRole('button',{name:'Calculate',exact:true}).click(); await page.locator('.result h2').waitFor(); await page.waitForLoadState('networkidle'); await Promise.all(jobs); }
 report.push({route,...initial,after_calculation_decoded_js_bytes:resources.reduce((n,r)=>n+r.decoded_bytes,0),resources}); await page.close();
} await fs.writeFile(process.argv[2],JSON.stringify({method:'Fresh Chromium context per route, production server, decoded JS response bytes; not field Core Web Vitals',pages:report},null,2));console.log(report.map(({resources,...r})=>r)); } finally {await browser.close();}
