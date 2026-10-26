import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {compatibleJavaScript} from '../scripts/prepare-browser-compat.mjs';
const require=createRequire(import.meta.url),{parse}=require('next/dist/compiled/acorn');
const source=fs.readFileSync('public/browser-compat.js','utf8');
function legacy(){const c=vm.createContext({});vm.runInContext('delete Array.prototype.at;delete String.prototype.at;delete Object.hasOwn;delete Promise.withResolvers;',c);vm.runInContext(source,c);return c;}
test('Compatibility bootstrap itself parses as ES5 and is safe to inline',()=>{parse(source,{ecmaVersion:5});assert.ok(!/<\/script/i.test(source));});
for(const [index,expected] of [[0,'a'],[1,'b'],[-1,'c'],[-3,'a'],[-4,undefined],[3,undefined],[1.9,'b'],[-1.9,'c'],[Infinity,undefined],[-Infinity,undefined],[NaN,'a']] as const)test(`Legacy Array.at supports relative index ${index}`,()=>{const c=legacy();c.i=index;assert.equal(vm.runInContext('Array.prototype.at.call(["a","b","c"],i)',c),expected);});
test('Legacy Array.at honors generic lengths, sparse values, limits and abrupt conversions',()=>{
 const c=legacy();assert.equal(vm.runInContext('Array.prototype.at.call({0:4,length:1.9},0)',c),4);assert.equal(vm.runInContext('[,].at(0)',c),undefined);assert.equal(vm.runInContext('Array.prototype.at.call({get 0(){throw Error("not read")},length:0},0)',c),undefined);
 for(const code of ['Array.prototype.at.call(null,0)','[1].at(1n)','[1].at(Symbol())'])assert.throws(()=>vm.runInContext(code,c));
 assert.equal(vm.runInContext('Object.getOwnPropertyDescriptor(Array.prototype,"at").enumerable',c),false);
});
test('Legacy String.at preserves UTF16 indexing and validates receivers',()=>{
 const c=legacy();assert.equal(vm.runInContext('"abc".at(-1)',c),'c');assert.equal(vm.runInContext('"abc".at(3)',c),undefined);assert.equal(vm.runInContext('"😀".at(0).charCodeAt(0)',c),0xd83d);assert.throws(()=>vm.runInContext('String.prototype.at.call(Symbol(),0)',c));
});
test('Legacy Object.hasOwn handles shadowing, inherited properties and symbol keys',()=>{
 const c=legacy();assert.equal(vm.runInContext('Object.hasOwn({hasOwnProperty:0},"hasOwnProperty")',c),true);assert.equal(vm.runInContext('Object.hasOwn(Object.create({x:1}),"x")',c),false);assert.equal(vm.runInContext('Object.hasOwn("abc",1)',c),true);assert.equal(vm.runInContext('var s=Symbol();Object.hasOwn({[s]:1},s)',c),true);assert.throws(()=>vm.runInContext('Object.hasOwn(undefined,"x")',c));
});
test('Legacy Promise.withResolvers resolves, rejects and preserves subclass construction',async()=>{
 const c=legacy();assert.equal(await vm.runInContext('var a=Promise.withResolvers();a.resolve(7);a.promise',c),7);await assert.rejects(vm.runInContext('var b=Promise.withResolvers();b.reject(Error("expected"));b.promise',c),/expected/);assert.equal(vm.runInContext('class P extends Promise{};P.withResolvers().promise instanceof P',c),true);
});
test('Bootstrap does not replace native methods and can execute twice',()=>{
 const c=vm.createContext({});vm.runInContext('var nativeAt=Array.prototype.at,nativeOwn=Object.hasOwn;',c);vm.runInContext(source,c);vm.runInContext(source,c);assert.equal(vm.runInContext('nativeAt===Array.prototype.at&&nativeOwn===Object.hasOwn',c),true);
});
test('Final-export compiler lowers framework class initialization and logical assignment without changing results',()=>{
 const code='class A { static { this.x=5 } static y=2; #z=3; value(){return this.#z} }; var v;v??=4;globalThis.answer=A.x+A.y+new A().value()+v;';
 assert.throws(()=>parse(code,{ecmaVersion:2020}));const out=compatibleJavaScript(code);parse(out,{ecmaVersion:2020});const c=vm.createContext({});vm.runInContext(out,c);assert.equal(c.answer,14);
});
test('Final-export compiler preserves dynamic imports and fixes Safari destructuring collisions',()=>{
 const code='var f=function a({a}){return a};globalThis.answer=f({a:12});globalThis.load=()=>import("./lazy.js");';const out=compatibleJavaScript(code);const c=vm.createContext({});vm.runInContext(out,c);assert.equal(c.answer,12);assert.match(out,/import\(/);
});
