// Optional authoring tool, not part of site build/runtime. Requires Playwright and Chromium.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_PATH=/path/to/chromium node scripts/render-pinterest-covers.mjs
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const copy=JSON.parse(await fs.readFile(root+'scripts/pinterest-cover-copy.json','utf8'));
const catalog=JSON.parse(await fs.readFile(root+'src/lib/catalog-data.json','utf8'));
const font=(await fs.readFile(root+'public/fonts/inter-latin-variable-3100e775.woff2')).toString('base64');
const logo=await fs.readFile(root+'public/favicon.svg','utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
await fs.mkdir(root+'public/social/pinterest',{recursive:true});
for(const [id,c] of Object.entries(copy)){
 const tool=catalog.find(t=>t.id===id);if(!tool)throw Error('Unknown cover tool '+id);
 const page=await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:1});
 await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
 @font-face{font-family:Inter;src:url(data:font/woff2;base64,${font});font-weight:100 900}*{box-sizing:border-box}body{margin:0;background:#f5f4fb;font-family:Inter,sans-serif;color:#171d32}main{height:1500px;padding:66px 72px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 100% 72%,#ddd5ff 0%,transparent 50%),#f5f4fb}.brand{display:flex;align-items:center;gap:16px;font-size:32px;font-weight:800;letter-spacing:-1px}.brand svg{width:48px;height:54px}.brand b{color:#7365d6}.brand i{color:#b9530b;font-style:normal}.category{margin:100px 0 26px;color:#6554b6;font-size:22px;font-weight:750;letter-spacing:3px}h1{font-size:88px;line-height:1.05;letter-spacing:-4px;font-weight:850;margin:0;white-space:pre-line;max-width:850px}.type{font-size:62px;font-weight:500;letter-spacing:-2px;color:#7365d6;margin:14px 0 32px}.description{font-size:32px;line-height:1.45;max-width:790px;margin:0;color:#4a5268}.plan{position:absolute;left:72px;right:72px;bottom:250px;padding:40px 44px;border:1px solid #e2dcf4;border-radius:30px;background:#ffffffdc;box-shadow:0 18px 48px #35275b08}.plan h2{font-size:25px;font-weight:700;margin:0 0 30px;letter-spacing:-.6px}.step{display:flex;align-items:center;gap:20px;font-size:26px;font-weight:600;margin:22px 0}.step:last-child{margin-bottom:0}.number{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#eee9ff;color:#7365d6;font-size:18px;font-weight:750;flex:none}.footer{position:absolute;bottom:70px;left:72px;right:72px;border-top:1px solid #dcd5ee;padding-top:28px;display:flex;align-items:center;justify-content:space-between;gap:24px}.free{font-size:19px;color:#6554b6;font-weight:650}.address{font-size:24px;font-weight:800;color:#171d32;letter-spacing:-.5px}.note{position:absolute;left:72px;bottom:168px;font-size:18px;color:#666c7d}.ornament{position:absolute;top:60px;right:-105px;border:1px solid #dfd6f4;width:320px;height:320px;border-radius:50%;pointer-events:none}.ornament:after{content:'';position:absolute;inset:25px;border:1px solid #e4ddf4;border-radius:50%}
 </style></head><body><main><div class="ornament"></div><div class="brand">${logo}<span><b>Calculator</b><i>Free</i>.io</span></div><p class="category">${esc(c.category)}</p><h1>${esc(c.headline)}</h1><p class="type">Calculator</p><p class="description">${esc(c.description)}</p><section class="plan"><h2>Make your next decision with clearer numbers.</h2><div class="step"><span class="number">01</span>Set your assumptions</div><div class="step"><span class="number">02</span>Calculate an estimate</div><div class="step"><span class="number">03</span>Review your options</div></section><p class="note">Educational estimates. Not financial advice.</p><div class="footer"><span class="free">Free to use · No account required</span><span class="address">calculatorfree.io</span></div></main></body></html>`);
 await page.evaluate(()=>document.fonts.ready);
 const overlap=await page.evaluate(()=>document.querySelector('.description').getBoundingClientRect().bottom>document.querySelector('.plan').getBoundingClientRect().top-30);if(overlap)throw Error('Cover layout overlap '+id);
 await page.screenshot({path:root+`public/social/pinterest/${id}-v1.png`});await page.close();console.log('Rendered',id);
}
await browser.close();
