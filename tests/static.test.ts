import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
test('Static currency retains manual and dated snapshot modes without a live feed',()=>{
 const calc=calculators.find(c=>c.id==='currency')!;
 assert.deepEqual(calc.modes.map(m=>m.id),['manual','snapshot']);
 const manual=calc.modes[0];
 const result=runCalculation('currency','manual',{...defaults(manual),from:'BTC',to:'USD',amount:'2',rate:'100000'});
 assert.equal(result.metrics[0].value,200000);
 const saved=runCalculation('currency','snapshot',defaults(calc.modes[1]));
 assert.ok(saved.notes!.some(n=>n.includes('not live')));
});
test('Static source has no external API fetches or server API route',()=>{
 assert.equal(fs.existsSync('src/app/api/rates/route.ts'),false);
 const visit=(dir:string)=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);if(entry.isDirectory())visit(name);else if(/\.tsx?$/.test(name))assert.doesNotMatch(fs.readFileSync(name,'utf8'),/\bfetch\s*\(|\/api\/rates|XMLHttpRequest|new\s+WebSocket\s*\(/,name);}};
 visit('src');assert.match(fs.readFileSync('next.config.ts','utf8'),/output:\s*"export"/);
});
