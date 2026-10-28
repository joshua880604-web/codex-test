import test from 'node:test';import assert from 'node:assert/strict';
import fixtureData from './fixtures/noi-fire-mirr.json';
const fixtures=fixtureData as unknown as {id:string;key:string;values:Record<string,string>;expected:Record<string,number>}[];
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultTrend} from '../src/lib/result-trend';
import {runClientCalculation} from '../src/lib/calculate-client';
const modes={noi:'operating-income',fire:'plan',mirr:'cashflows'};
function run(id:keyof typeof modes,changes:Record<string,string|number>={}){const c=calculators.find(c=>c.id===id)!,m=c.modes[0],v={...defaults(m),...Object.fromEntries(Object.entries(changes).map(([k,v])=>[k,String(v)]))};return{c,m,v,r:runCalculation(id,m.id,v)};}
const val=(r:ReturnType<typeof run>['r'],label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
for(const fixture of fixtures)test(`Decimal60 independent ${fixture.id}/${fixture.key}`,()=>{
 const {r}=run(fixture.id as keyof typeof modes,fixture.values);for(const[label,n]of Object.entries(fixture.expected))assert.ok(Math.abs(val(r,label)-n!)<.00001,fixture.key+'/'+label);
});
test('NOI monthly and annual forms reconcile while zero revenue leaves ratios undefined',()=>{
 const a=run('noi').r,b=run('noi',fixtures.find(f=>f.id==='noi'&&f.key==='annual')!.values).r;assert.deepEqual(a.metrics,b.metrics);assert.deepEqual(a.rows,b.rows);
 const z=run('noi',fixtures.find(f=>f.id==='noi'&&f.key==='zero-income')!.values).r;assert.equal(z.metrics.find(m=>m.label==='NOI margin')!.displayValue,'Not defined: zero effective income');assert.equal(val(z,'Annual net operating income'),-1200);
 assert.equal(val(run('noi',{management:0}).r,'Annual net operating income')-val(a,'Annual net operating income'),3600);
});
test('FIRE uses a full target, first-month crossing and exact terminal chart values',()=>{
 const {r,v}=run('fire');assert.equal(val(r,'FIRE portfolio target'),1000000);assert.equal(val(r,'Time to modeled FIRE target'),221/12);assert.equal(val(r,'New investments through endpoint'),442000);
 assert.equal(r.rows!.at(-1)![0],35+221/12);const prior=Number(r.rows!.at(-2)![1]);assert.ok(prior<1000000);const t=resultTrend('fire','plan',v,r)!;assert.equal(t.points.at(-1)!.balance,r.rows!.at(-1)![1]);assert.equal(t.points.at(-1)!.comparison,1000000);assert.equal(t.points[0].x,35);
 const coast=runCalculation('coast-fire','coast',defaults(calculators.find(c=>c.id==='coast-fire')!.modes[0]));assert.ok(val(coast,'Coast FIRE number today')<val(r,'FIRE portfolio target'));
 const z=run('fire',{balance:0,monthly:0}).r;assert.equal(z.metrics.find(m=>m.label==='Age at modeled FIRE target')!.displayValue,'Not reached by projection limit');
 assert.equal(val(run('fire',{balance:1000000}).r,'New investments through endpoint'),0);
});
test('MIRR preserves zero periods, handles signs and is invariant to monetary scale',()=>{
 const a=run('mirr',{flows:'-1000\n0\n1100',finance:0,reinvest:0}).r,b=run('mirr',{flows:'-1000\n1100',finance:0,reinvest:0}).r;assert.equal(val(a,'Number of cash-flow periods'),2);assert.ok(val(a,'Effective annual MIRR')<val(b,'Effective annual MIRR'));
 const initial=run('mirr').r,scaled=run('mirr',{flows:'-10000000\n3000000\n4000000\n5000000'}).r;assert.ok(Math.abs(val(initial,'Effective annual MIRR')-val(scaled,'Effective annual MIRR'))<1e-10);
 const tiny=run('mirr',{flows:'-1e-200\n3e-201\n4e-201\n5e-201'}).r;assert.ok(Math.abs(val(initial,'Effective annual MIRR')-val(tiny,'Effective annual MIRR'))<1e-9);
 const changed=run('mirr',fixtures.find(f=>f.key==='sign-changes')!.values).r;assert.ok(Math.abs(changed.rows!.reduce((s,row)=>s+Number(row[2]),0)+val(changed,'Present value of outflows'))<1e-8);assert.ok(Math.abs(changed.rows!.reduce((s,row)=>s+Number(row[3]),0)-val(changed,'Terminal value of reinvested inflows'))<1e-8);
});
test('All three lazy engines match server results without extra model imports into presentation',async()=>{
 for(const id of ['noi','fire','mirr'] as const){const{c,m,v,r}=run(id);assert.deepEqual(await runClientCalculation(c.id,c.category,m.id,v),r);}
});
test('Inputs reject incompatible periods, malformed cash flows, invalid ages and unsupported rate ranges',()=>{
 const invalid:Record<keyof typeof modes,Record<string,string|number>[]>={noi:[{period:'Weekly'},{rent:-1},{vacancy:101},{taxes:''},{insurance:'Infinity'}],fire:[{age:35.5},{max_age:35},{max_age:121},{withdrawal:0},{spending:0},{monthly:-1},{return:-100},{inflation:-100},{spending:1e15,withdrawal:1e-310}],mirr:[{flows:'100\n200'},{flows:'-100\n-200'},{flows:'0\n0'},{flows:'-100\n\n200'},{flows:'-1,000\n1200'},{flows:'-100\nNaN'},{flows:'-100\nInfinity'},{flows:'-100\n200abc'},{flows:'-100\n1e-999\n200'},{flows:'-100'},{flows:Array(602).fill('0').join('\n')},{finance:-100},{reinvest:-100},{period:'Weekly'}]};
 for(const id of ['noi','fire','mirr'] as const)for(const v of invalid[id])assert.throws(()=>run(id,v),id+'/'+JSON.stringify(v));
});
