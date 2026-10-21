import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {searchTasks} from '../src/lib/keyword-targets';
const run=(id:string,mode:string,values:Record<string,string|number>)=>{const m=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(values).map(([k,v])=>[k,String(v)]))});};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Snowball and avalanche have different priorities and conserve monthly cash flows',()=>{
 const values={debts:'Small, 100, 10, 0\nLarge, 1000, 100, 12',extra:100,yearly:0,once:0,once_month:1,rollover:'Yes'};
 const snow=run('debt-payoff','snowball',values),av=run('debt-payoff','avalanche',values);
 assert.deepEqual(snow.rows![0],[1,210,10,900,0,900]);assert.deepEqual(av.rows![0],[1,210,10,900,90,810]);
 // Independently derived: 900 -> 699 -> 495.99 -> 290.9499 -> 83.859399 -> 0.
 close(Number(snow.rows!.at(-1)![1]),84.69799299);close(snow.metrics.find(m=>m.label==='Total paid')!.value,5*210+84.69799299);
 for(const result of [snow,av]){let opening=1100;for(const row of result.rows!){close(opening+Number(row[2])-Number(row[1]),Number(row[3]));opening=Number(row[3]);}close(opening,0);}
});
test('Markup mode uses cost while margin uses revenue, and supports markup above 100 percent',()=>{
 for(const markup of [0,25,200]){
  const r=run('margin','markup',{cost:100,markup});close(r.metrics[0].value,100+markup);close(r.metrics.find(m=>m.label==='Gross margin')!.value,100*markup/(100+markup));
 }
 assert.throws(()=>run('margin','markup',{cost:0,markup:25}));
});
test('All researched query aliases and presets belong to valid executable modes',()=>{
 const seen=new Set<string>();
 for(const [id,tasks] of Object.entries(searchTasks))for(const task of tasks){
  const mode=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===task.mode)!;assert.ok(mode,id+task.mode);
  for(const key of [task.keyword,...task.aliases??[]]){assert.ok(!seen.has(key.toLowerCase()),key);seen.add(key.toLowerCase());}
  if(task.values){for(const key of Object.keys(task.values))assert.ok(mode.fields.some(f=>f.key===key));assert.ok(run(id,task.mode,task.values).metrics.every(m=>Number.isFinite(m.value)));}
 }
});
