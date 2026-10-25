import fs from 'node:fs';
import assert from 'node:assert/strict';
import { longTailContent, longTailHref } from '../src/lib/long-tail-content.ts';
import { routeFor } from '../src/lib/catalog.ts';
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
let answers = 0, links = 0;
for (const [id, content] of Object.entries(longTailContent)) {
  const html = fs.readFileSync('out' + routeFor(id), 'utf8');
  for (const item of content.items) {
    assert.equal(html.split('id="' + item.anchor + '"').length - 1, 1, id + '/' + item.anchor);
    assert.ok(html.includes('<h3>' + escape(item.question) + '</h3>'), id + ' static question');
    assert.ok(html.includes('<p>' + escape(item.answer) + '</p>'), id + ' static answer');
    for (const link of item.links) {
      assert.ok(html.includes('href="' + escape(longTailHref(link)) + '"'), id + ' contextual mode link');
      assert.ok(fs.existsSync('out' + routeFor(link.id)), id + ' existing target');
      links++;
    }
    answers++;
  }
}
console.log({passed: true, pages: Object.keys(longTailContent).length, answers, links, serverRendered: true});
