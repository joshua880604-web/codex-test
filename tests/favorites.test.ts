import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFavorites,toggleFavorite,FAVORITES_KEY} from '../src/lib/favorites';
function memory(){const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};}
test('Favorites persist calculator IDs only and preserve unrelated browser data',()=>{
 const store=memory();store.setItem('calculatorfree.theme','dark-pro');store.setItem('calculatorfree.plans.v1','leave untouched');
 assert.equal(toggleFavorite(store,'mortgage'),true);assert.equal(toggleFavorite(store,'cd'),true);assert.deepEqual(readFavorites(store),['mortgage','cd']);
 assert.equal(toggleFavorite(store,'mortgage'),false);assert.deepEqual(readFavorites(store),['cd']);assert.equal(store.getItem('calculatorfree.theme'),'dark-pro');assert.equal(store.getItem('calculatorfree.plans.v1'),'leave untouched');
 assert.deepEqual([...store.data.keys()].sort(),['calculatorfree.theme','calculatorfree.plans.v1',FAVORITES_KEY].sort());
});
test('Corrupt favorites are rejected without overwriting the original data',()=>{
 const store=memory();for(const raw of ['broken','{}','["javascript:alert(1)"]','[1]','x'.repeat(10001)]){store.setItem(FAVORITES_KEY,raw);assert.throws(()=>toggleFavorite(store,'mortgage'));assert.equal(store.getItem(FAVORITES_KEY),raw);}
});
test('Favorite limits, duplicates and invalid identifiers are handled safely',()=>{
 const store=memory();store.setItem(FAVORITES_KEY,'["cd","cd"]');assert.deepEqual(readFavorites(store),['cd']);toggleFavorite(store,'cd');assert.deepEqual(readFavorites(store),[]);
 for(let i=0;i<100;i++)toggleFavorite(store,'tool-'+i);const before=store.getItem(FAVORITES_KEY);assert.throws(()=>toggleFavorite(store,'one-more'),/full/);assert.equal(store.getItem(FAVORITES_KEY),before);
 assert.throws(()=>toggleFavorite(store,'//example.com'));toggleFavorite(store,'tool-0');assert.equal(toggleFavorite(store,'one-more'),true);
});
test('Unavailable storage does not report a successful favorite change',()=>{
 assert.throws(()=>toggleFavorite({getItem(){throw new DOMException('Blocked','SecurityError');},setItem(){}},'mortgage'),/Blocked/);
 assert.throws(()=>toggleFavorite({getItem:()=>null,setItem(){throw new DOMException('Full','QuotaExceededError');}},'mortgage'),/Full/);
});
