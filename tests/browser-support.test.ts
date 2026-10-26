import test from 'node:test';import assert from 'node:assert/strict';
import vm from 'node:vm';import {createRequire} from 'node:module';
import {browserSupportScript} from '../src/lib/browser-support';
const require=createRequire(import.meta.url),{parse}=require('next/dist/compiled/acorn');
function check(ua:string,loading=false){
 const notice={hidden:true};let ready:(()=>void)|undefined;
 const context=vm.createContext({navigator:{userAgent:ua},document:{readyState:loading?'loading':'complete',getElementById:(id:string)=>id==='browser-support-notice'?notice:null,addEventListener:(event:string,callback:()=>void)=>{assert.equal(event,'DOMContentLoaded');ready=callback;}}});
 vm.runInContext('var nativeAt=Array.prototype.at,nativeOwn=Object.hasOwn;',context);vm.runInContext(browserSupportScript,context);
 assert.equal(vm.runInContext('nativeAt===Array.prototype.at&&nativeOwn===Object.hasOwn',context),true);
 const before=notice.hidden;ready?.();return {visible:!notice.hidden,hiddenBeforeReady:before,listener:!!ready};
}
const cases:[string,string,boolean][]=[
 ['XR iOS14.4.2','Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 Version/14.0.3 Mobile/15E148 Safari/604.1',true],
 ['iOS16.3','Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 Version/16.3 Mobile/15E148 Safari/604.1',true],
 ['iOS16.4 boundary','Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 Version/16.4 Mobile/15E148 Safari/604.1',false],
 ['iOS18','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',false],
 ['Chrome iOS uses OS engine','Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 CriOS/120.0 Mobile/15E148 Safari/604.1',true],
 ['desktop Safari15','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/15.6 Safari/605.1.15',true],
 ['desktop Safari16.4','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/16.4 Safari/605.1.15',false],
 ['Chrome110','Mozilla/5.0 Chrome/110.0.0.0 Safari/537.36',true],
 ['Chrome111','Mozilla/5.0 Chrome/111.0.0.0 Safari/537.36',false],
 ['Edge current','Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36 Edg/130.0',false],
 ['Firefox110','Mozilla/5.0 Gecko/20100101 Firefox/110.0',true],
 ['Firefox111','Mozilla/5.0 Gecko/20100101 Firefox/111.0',false],
 ['Android Chrome','Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',false],
 ['unknown crawler','ExampleBot/1.0',false],
];
for(const [name,ua,visible] of cases)test('Browser support notice: '+name,()=>assert.equal(check(ua).visible,visible));
test('Upgrade notice has an ES5 script and waits for server-rendered markup',()=>{
 parse(browserSupportScript,{ecmaVersion:5});assert.ok(!/<\/script/i.test(browserSupportScript));
 assert.deepEqual(check(cases[0][1],true),{visible:true,hiddenBeforeReady:true,listener:true});assert.deepEqual(check(cases[3][1],true),{visible:false,hiddenBeforeReady:true,listener:false});
});
