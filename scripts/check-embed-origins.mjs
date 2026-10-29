// Run: node --import tsx scripts/check-embed-origins.mjs [report.json]
// All HTTPS requests are intercepted and served from out/. No production fetches.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {embedCode} from '../src/lib/embed-code.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const root=process.cwd(),reportFile=process.argv[2]??'docs/financial-clone/evidence/embed-origins-qa.json';
const headers=await fs.readFile('out/_headers','utf8');
const policy=headers.split('/embed/*')[1].match(/Content-Security-Policy: ([^\n]+)/)[1];
assert.ok(!/(?:^|;)\s*frame-ancestors\b/.test(policy));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[];
try {
  for(const id of ['roi','coast-fire'])for(const parent of ['https','opaque'])for(const negativeControl of [false,true]){
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    const html='<!doctype html><html><body>'+embedCode(id,'light',1000)+'</body></html>';
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.route('https://publisher.example/**',route=>route.fulfill({body:html,contentType:'text/html'}));
    await page.route('https://www.calculatorfree.io/**',async route=>{
      const url=new URL(route.request().url());
      let file=path.join(root,'out',url.pathname);if(url.pathname.endsWith('/'))file=path.join(file,'index.html');
      await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html',headers:{'content-security-policy':policy+(negativeControl?'; frame-ancestors *':'')}});
    });
    // Managed browser policy prohibits file:// navigation here. about:blank has
    // an opaque origin, reproducing the same ancestor-matching class as file://.
    if(parent==='opaque'){await page.setContent(html);assert.equal(await page.evaluate(()=>location.origin),'null');}
    else await page.goto('https://publisher.example/');
    const frame=page.frameLocator('iframe');let loaded=false;
    try{await frame.locator('#embed-credit').waitFor({timeout:2000});loaded=true;}catch{}
    const blocked=parent==='opaque'&&negativeControl;
    assert.equal(loaded,!blocked,JSON.stringify({id,parent,negativeControl,errors}));
    if(blocked)assert.ok(errors.some(error=>error.includes('frame-ancestors')));
    else{
      const values=id==='roi'?{cost:10000,returned:12000,years:1}:{age:40,retire:50,balance:180000,spending:12000,monthly:1000,return:0,inflation:0,withdrawal:4};
      for(const[key,value]of Object.entries(values))await frame.locator('[name="'+key+'"]').fill(String(value));
      await frame.locator('button[type=submit]').click();
      await frame.locator('#embed-status').filter({hasText:'Calculation updated.'}).waitFor();
      const label=id==='roi'?'Return on investment':'Coast FIRE number today';
      const value=await frame.locator('.metrics > div').filter({has:page.locator('dt').filter({hasText:label})}).locator('dd').innerText();
      assert.equal(value,id==='roi'?'20%':'$300,000.00');
      assert.equal(await frame.locator('script[src*="adsbygoogle"]').count(),0);
      await frame.locator('#embed-credit').evaluate(node=>node.remove());await frame.locator('#embed-credit').waitFor();
    }
    checks.push({id,parent,negativeControl,loaded,errors});await context.close();
  }
  const report={passed:true,checks,scope:'Exported widget documents/assets and actual shipped CSP under HTTPS and opaque about:blank parents. file:// navigation is blocked by managed browser policy, so literal local-file navigation and production headers are not claimed.'};
  await fs.mkdir(path.dirname(reportFile),{recursive:true});await fs.writeFile(reportFile,JSON.stringify(report,null,2));console.log({passed:true,checks:checks.length,blockedNegativeControls:checks.filter(c=>!c.loaded).length});
}finally{await browser.close();}
