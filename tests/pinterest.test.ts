import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pinterestShareURL} from '../src/lib/pinterest';
import {pinterestToolIds} from '../src/lib/share-tools';
import {calculators,routeFor} from '../src/lib/calculators';
test('Pinterest pins always use canonical tool pages and public covers, even when given a calculation link',()=>{
 for(const id of pinterestToolIds){
  const tool=calculators.find(t=>t.id===id)!;
  const link=new URL(pinterestShareURL(routeFor(id)+'?balance=123456#calc=share_version=1&debts=private',tool.title));
  assert.equal(link.origin,'https://www.pinterest.com');assert.equal(link.pathname,'/pin/create/button/');
  assert.equal(link.searchParams.get('url'),'https://www.calculatorfree.io'+routeFor(id).slice(0,-5));
  assert.equal(link.searchParams.get('media'),`https://www.calculatorfree.io/social/pinterest/${id}-v1.png`);
  assert.deepEqual([...link.searchParams.keys()].sort(),['description','media','url']);
  assert.ok(link.searchParams.get('description')!.includes(tool.title));assert.doesNotMatch(link.href,/123456|private|share_version|%23calc/);
 }
 assert.throws(()=>pinterestShareURL('https://example.com/tool','Other'));
 assert.throws(()=>pinterestShareURL('/roi-calculator','ROI'));
});
test('Every selected Pinterest cover is a real public 1000 by 1500 PNG',()=>{
 for(const id of pinterestToolIds){const data=readFileSync(new URL(`../public/social/pinterest/${id}-v1.png`,import.meta.url));assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),1000);assert.equal(data.readUInt32BE(20),1500);assert.ok(data.length>10000&&data.length<600000,id);}
});
