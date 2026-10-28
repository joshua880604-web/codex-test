import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';import {resultTrend}from'../src/lib/result-trend';import {workspaceMetrics}from'../src/lib/workspace-layout';
const c=calculators.find(c=>c.id==='coast-fire')!,m=c.modes[0];const run=(changes:Record<string,string|number>={})=>{const values={...defaults(m),...Object.fromEntries(Object.entries(changes).map(([k,v])=>[k,String(v)]))};return {values,result:runCalculation(c.id,m.id,values)}};
const metric=(r:ReturnType<typeof run>['result'],label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};const val=(r:ReturnType<typeof run>['result'],label:string)=>metric(r,label).value;const close=(a:number,b:number,tol=.00001)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('Coast threshold uses exact real effective growth and today-dollar budget once',()=>{
 const r=run().result;close(val(r,'Coast FIRE number today'),275551.4059009077);close(val(r,'Full FIRE portfolio target'),1000000);close(val(r,'Real annual return assumption'),4.390243902439024);
 assert.ok(workspaceMetrics(c.id,m.id,r).highlights.some(x=>x.label==='Age at Coast FIRE'));close(val(r,'Retirement balance without new investments'),544363.0363981601);close(val(r,'Time until Coast FIRE'),14);close(val(r,'Age at Coast FIRE'),49);close(val(r,'New investments on modeled path'),168000);close(val(r,'Retirement balance on modeled path'),1001701.2273836092);
});
test('Zero real growth is not a singularity and contributions can reach the target exactly',()=>{
 const r=run({age:40,retire:50,balance:180000,spending:12000,monthly:1000,return:5,inflation:5}).result;
 close(val(r,'Coast FIRE number today'),300000);close(val(r,'Real annual return assumption'),0);close(val(r,'New investments on modeled path'),120000);close(val(r,'Retirement balance on modeled path'),300000);
 assert.equal(metric(r,'Time until Coast FIRE').displayValue,'At target retirement age');assert.equal(val(r,'Modeled Coast status'),2);
});
test('First whole-month crossing is retained and investments stop immediately after it',()=>{
 const r=run({age:40,retire:50,balance:180000,spending:12000,monthly:1100,return:0,inflation:0}).result;
 close(val(r,'Time until Coast FIRE'),110/12);close(val(r,'Age at Coast FIRE'),40+110/12);close(val(r,'New investments on modeled path'),121000);close(val(r,'Retirement balance on modeled path'),301000);
 const crossing=r.rows!.find(row=>Math.abs(Number(row[0])-(40+110/12))<1e-9)!;assert.ok(crossing);close(Number(crossing[3]),121000);assert.ok(r.rows!.filter(row=>Number(row[0])>Number(crossing[0])).every(row=>Number(row[3])===121000));
});
test('Already-funded path ignores future investments but does not claim current retirement',()=>{
 const r=run({age:40,retire:50,balance:400000,spending:40000,monthly:10000,return:10,inflation:0}).result;
 close(val(r,'Coast FIRE number today'),385543.2894295317);close(val(r,'New investments on modeled path'),0);close(val(r,'Time until Coast FIRE'),0);close(val(r,'Retirement balance on modeled path'),1037496.98404);assert.equal(metric(r,'Time until Coast FIRE').displayValue,'Now');assert.ok(r.notes!.some(n=>n.includes('not proof that you can retire today')));
});
test('Unreached milestone has explicit display values rather than a fake zero-year success',()=>{
 const r=run({age:40,retire:50,balance:10000,spending:12000,monthly:0,return:0,inflation:0}).result;
 assert.equal(val(r,'Modeled Coast status'),0);assert.equal(metric(r,'Time until Coast FIRE').displayValue,'Not reached by target age');assert.equal(metric(r,'Age at Coast FIRE').displayValue,'Not reached by target age');close(val(r,'Retirement balance on modeled path'),10000);
 const z=run({balance:0,monthly:0}).result;assert.equal(val(z,'Modeled Coast status'),0);close(val(z,'Retirement balance on modeled path'),0);
});
test('Negative real growth is supported without assuming that every portfolio must rise',()=>{
 const r=run({age:40,retire:50,balance:510000,spending:12000,monthly:0,return:-5,inflation:0}).result;
 close(val(r,'Coast FIRE number today'),501054.7710345281);close(val(r,'Real annual return assumption'),-5);close(val(r,'Retirement balance on modeled path'),305355.8390115732);assert.equal(val(r,'Modeled Coast status'),1);
 close(val(run({return:-2,inflation:-2}).result,'Real annual return assumption'),0);
});
test('Threshold boundary is recognized now, while one unit below it is not',()=>{
 const shared={age:40,retire:50,spending:12000,withdrawal:4,return:0,inflation:0,monthly:0};
 assert.equal(val(run({...shared,balance:300000}).result,'Modeled Coast status'),1);assert.equal(val(run({...shared,balance:299999}).result,'Modeled Coast status'),0);
});
test('Coast chart uses the calculated stop-and-coast path and ends at target age',()=>{
 const {values,result}=run();const t=resultTrend(c.id,m.id,values,result)!;assert.ok(t);assert.equal(t.xLabel,'Age');close(t.points[0].x,35);close(t.points[0].balance,150000);close(t.points.at(-1)!.x,65);close(t.points.at(-1)!.balance,val(result,'Retirement balance on modeled path'));close(t.points.at(-1)!.comparison!,1000000);assert.ok(t.points.some(p=>p.x===49));assert.match(t.help,/stop/);assert.ok(t.points.length<=122);
});
test('Invalid ages, budgets, withdrawal rates, rates and nonfinite values are rejected',()=>{
 const invalid:Record<string,string|number>[]=[{age:65,retire:65},{age:70,retire:65},{age:35.5},{retire:65.5},{retire:121},{age:-1},{spending:0},{withdrawal:0},{withdrawal:101},{return:-100},{inflation:-100},{monthly:-1},{balance:-1},{balance:''},{return:'Infinity'},{age:0,retire:120,return:1000,inflation:-99.99}];for(const changes of invalid)assert.throws(()=>run(changes),JSON.stringify(changes));
});
