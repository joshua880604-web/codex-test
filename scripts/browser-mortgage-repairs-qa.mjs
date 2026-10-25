import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '/opt/codex/cua_node/lib/node_modules/playwright/index.mjs';
const base='http://127.0.0.1:3000',dir='/workspace/work/mortgage-fixes-20261025';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[],unexpected=[],checks=[];
try {
  const context=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce'});
  await context.route('**/*',r=>{
    const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();
    if(u==='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659')return r.fulfill({body:'',contentType:'text/javascript'});
    unexpected.push(u);return r.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const visit=async(mode='monthly',values={},id='mortgage')=>{await page.goto(`${base}/${id==='fha-loan'?'fha-loan':id==='va-mortgage'?'va-mortgage':'mortgage'}-calculator.html?`+new URLSearchParams({mode,...values}),{waitUntil:'networkidle'});};
  const metric=label=>page.locator('.metric').filter({has:page.getByText(label,{exact:true})}).locator('strong');
  const more=async()=>{for(const d of await page.locator('.calculator-form details.advanced').all())if(await d.getAttribute('open')===null)await d.locator(':scope > summary').click();};
  const breakdown=async()=>{const d=page.locator('.workspace-breakdown');if(await d.count()&&await d.getAttribute('open')===null)await d.locator(':scope > summary').click();};
  const result=async()=>{await page.locator('.result h2').waitFor();assert.deepEqual(await page.locator('.error[role="alert"]').allTextContents(),[]);};
  const calculate=async()=>{await page.getByRole('button',{name:'Calculate',exact:true}).click();};
  const csv=async(name)=>{const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download CSV',exact:true}).click();const d=await pending;const p=`${dir}/${name}.csv`;await d.saveAs(p);return (await fs.readFile(p,'utf8')).trim().split(/\r?\n/).map(line=>line.split(',').map(cell=>cell.replace(/^"|"$/g,'')));};
  for(const width of [390,768,1440]) {
    await page.setViewportSize({width,height:900});await visit();await result();
    assert.equal(await metric('Monthly principal & interest').innerText(),'$1,918.56');assert.equal(await metric('Initial monthly total').innerText(),'$2,443.56');
    await page.locator('.workspace-report-chart .result-trend').waitFor();await page.locator('.workspace-report-details .workspace-details > summary').click();
    assert.equal((await csv(`default-monthly-${width}`)).length,361);await page.getByRole('button',{name:'Yearly',exact:true}).click();assert.equal((await csv(`default-yearly-${width}`)).length,31);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await page.locator('.calculator-form').evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    assert.equal(await page.locator('.result').evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
    if(width===1440){assert.equal(Math.round((await page.locator('.page-wrap').boundingBox()).width),1120);assert.equal(Math.round((await page.locator('.sidebar').boundingBox()).width),320);}
    await page.locator('.calculator-workspace').screenshot({path:`${dir}/default-${width}.png`});checks.push({width,case:'default payments, chart, full monthly/yearly CSV and no overflow',passed:true});

    await visit('monthly',{years:'1',months:'.5'});assert.match(await page.locator('.error[role="alert"]').innerText(),/whole number of months/);
    await page.locator('#mortgage-monthly-years').fill('1.5');await page.locator('#mortgage-monthly-months').fill('0');await page.locator('#mortgage-monthly-months').press('Enter');await result();await breakdown();assert.equal(await metric('Number of payments').innerText(),'18');
    checks.push({width,case:'fractional total rejected; partial-year recovery by keyboard',passed:true});

    await visit('monthly',{dated:'\n1,100\n\n2,100,999'});assert.match(await page.locator('.error[role="alert"]').innerText(),/row 4.*exactly two/);
    await more();await page.locator('#mortgage-monthly-dated').fill('1,\n');await calculate();assert.match(await page.locator('.error[role="alert"]').innerText(),/row 1.*nonempty/);
    await page.locator('#mortgage-monthly-dated').fill('1,100\n1,200');await calculate();await result();assert.equal(await metric('Initial monthly total').innerText(),'$2,743.56');
    checks.push({width,case:'malformed extras identify original row; valid duplicates add',passed:true});

    for(const mode of ['monthly','biweekly']) {
      await visit(mode,{down:'100',tax:'4800',insurance:'1500',hoa:'1200',other:'2400',pmi:'1200'});await result();await breakdown();
      assert.equal(await metric('Financed loan amount').innerText(),'$0.00');assert.equal(await metric('Initial monthly total').innerText(),'$825.00');assert.equal(await metric('Initial annual ownership costs').innerText(),'$9,900.00');
      assert.match(await page.locator('.result').innerText(),/No mortgage loan is needed/);
      assert.equal(await page.locator('.workspace-report-chart .result-trend').count(),0);assert.equal(await page.getByRole('button',{name:'Download CSV',exact:true}).count(),0);
      assert.equal(await metric('Total taxes and other costs').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(mode==='monthly')await page.locator('.calculator-workspace').screenshot({path:`${dir}/cash-purchase-${width}.png`});
      checks.push({width,case:`zero loan ${mode}: ongoing costs, explicit context, no fabricated schedule`,passed:true});
    }

    await visit('monthly',{pmi_policy:'Cancel at 80% original LTV',appraised_value:'350000',pmi:'1200',tax:'0',insurance:'0'});await result();await more();await breakdown();
    assert.equal(await page.locator('#mortgage-monthly-appraised_value').inputValue(),'350000');assert.equal(await metric('Original value for PMI').innerText(),'$350,000.00');assert.equal(await metric('Initial monthly total').innerText(),'$2,018.56');
    await page.locator('.workspace-report-details .workspace-details > summary').click();const monthly=await csv(`pmi-monthly-${width}`);
    const cost=monthly[0].indexOf('Taxes & costs');assert.ok(cost>=0);assert.equal(monthly.length,361);assert.equal(Number(monthly[98][cost]),100);assert.equal(Number(monthly[99][cost]),0);assert.equal(monthly.slice(1).reduce((s,r)=>s+Number(r[cost]),0),9800);
    await page.getByRole('button',{name:'Yearly',exact:true}).click();const yearly=await csv(`pmi-yearly-${width}`);assert.equal(yearly.length,31);assert.equal(yearly.slice(1).reduce((s,r)=>s+Number(r[cost]),0),9800);
    await page.locator('#mortgage-monthly-appraised_value').fill('450000');await calculate();await result();await breakdown();assert.equal(await metric('Original value for PMI').innerText(),'$400,000.00');assert.equal(await metric('Initial monthly total').innerText(),'$1,918.56');
    await more();await page.locator('#mortgage-monthly-appraised_value').fill('0');await page.locator('#mortgage-monthly-pmi_policy').selectOption('Fixed duration');assert.equal(await page.locator('#mortgage-monthly-appraised_value').count(),0);await calculate();await result();assert.equal(await metric('Initial monthly total').innerText(),'$2,018.56');
    checks.push({width,case:'lower original appraisal restored in links; PMI 98 months/9800; yearly reconciles; fixed policy hides/ignores appraisal',passed:true});

    await visit('biweekly');await result();await breakdown();assert.equal(await metric('Biweekly payment').innerText(),'$959.28');assert.equal(await metric('Payments').innerText(),'638');
    checks.push({width,case:'ordinary 26-period biweekly unchanged',passed:true});
    for(const id of ['fha-loan','va-mortgage'])for(const mode of ['monthly','biweekly']) {
      await visit(mode,{down:'100'},id);await result();await breakdown();assert.equal(await metric('Initial monthly total').innerText(),'$525.00');assert.equal(await metric('Financed loan amount').innerText(),'$0.00');
      if(id==='fha-loan')assert.equal(await metric('Total FHA MIP').innerText(),'$0.00');
      checks.push({width,case:`${id} ${mode} shared zero-loan behavior`,passed:true});
    }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);
  await fs.writeFile('docs/financial-clone/evidence/browser-mortgage-repairs-qa.json',JSON.stringify({tested_at:new Date().toISOString(),checks,errors,unexpected,passed:true,ads:'Only exact existing publisher loader stubbed; no live-ad assertion.',scope:'Local production build. Reference-site screenshot parity and direct live-origin response are unverified.'},null,2)+'\n');
  console.log({checks:checks.length,passed:true});
} finally {await browser.close();}
