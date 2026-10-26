import {test} from 'node:test';
import assert from 'node:assert/strict';
import {navigationHref} from '../src/lib/navigation';
import catalog from '../src/lib/catalog-data.json';
import {pageMetadata} from '../src/lib/seo';
import {siteName} from '../src/lib/site';

test('Known document links reach final routes while retaining exact query and fragment bytes',()=>{
 for(const tool of catalog) {
  const suffix='?mode=compare&name=A%26B&n=0#calc=share_version=1&x=%2B%23';
  assert.equal(navigationHref(tool.local_route+suffix),tool.local_route.slice(0,-5)+suffix);
 }
 assert.equal(navigationHref('/#mortgage-and-real-estate'),'/financial-calculator#mortgage-and-real-estate');
 assert.equal(navigationHref('https://calculatorfree.io/cd-calculator.html?mode=accumulation#calculator-panel'),'https://www.calculatorfree.io/cd-calculator?mode=accumulation#calculator-panel');
 for(const href of ['#main','?search=loan','mailto:support@example.com','/fonts/inter.woff2','/docs/reference.html','https://example.com/cd-calculator.html','//example.com/page.html'])assert.equal(navigationHref(href),href);
});
test('Long SEO titles retain their complete query meaning without an extra brand suffix',()=>{
 const title='Mortgage Calculator with Taxes, Insurance and Extra Payments';
 assert.deepEqual(pageMetadata('/mortgage-calculator.html',title,'Description').title,{absolute:title});
 assert.equal(pageMetadata('/privacy.html','Privacy','Description').title,'Privacy');
 assert.deepEqual(pageMetadata('/about.html','About '+siteName,'Description').title,{absolute:'About '+siteName});
});
