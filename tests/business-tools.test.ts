import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const run=(id:string,mode:string,changes:Record<string,string|number>={})=>{const m=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(changes).map(([k,v])=>[k,String(v)]))});};
const val=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
// Hand-calculated independent controls: division, additive cost reconciliation and margin algebra.
test('ROAS reports revenue multiple and percentage without calling the remainder profit',()=>{
 const r=run('roas','actual',{revenue:9000,spend:1500});close(val(r,'ROAS (multiple)'),6);close(val(r,'ROAS percentage'),600);close(val(r,'Revenue less advertising spend'),7500);
 assert.ok(!r.metrics.some(m=>/^profit$/i.test(m.label)));
 const z=run('roas','actual',{revenue:0,spend:500});close(val(z,'ROAS (multiple)'),0);close(val(z,'Revenue less advertising spend'),-500);
 assert.throws(()=>run('roas','actual',{spend:0}),/greater than zero/);
});
test('Contribution break-even is reciprocal margin, not markup or net profit',()=>{
 const r=run('roas','break-even',{contribution_margin:25,revenue:8000});close(val(r,'Break-even ROAS (multiple)'),4);close(val(r,'Maximum advertising spend at break-even'),2000);
 close(val(run('roas','break-even',{contribution_margin:100}),'Break-even ROAS (multiple)'),1);
 assert.throws(()=>run('roas','break-even',{contribution_margin:0}),/greater than zero/);
 assert.throws(()=>run('roas','break-even',{contribution_margin:101}),/100/);
});
test('Target margin algebra conserves scenario contribution and ad spend',()=>{
 const r=run('roas','target',{contribution_margin:50,target_margin:30,revenue:20000});close(val(r,'Required ROAS (multiple)'),5);close(val(r,'Maximum advertising spend for target'),4000);close(val(r,'Target contribution after advertising'),6000);
 close(val(r,'Maximum advertising spend for target')+val(r,'Target contribution after advertising'),10000);
 for(const m of [5,25,40,100])close(val(run('roas','target',{contribution_margin:m,target_margin:0}),'Required ROAS (multiple)'),val(run('roas','break-even',{contribution_margin:m}),'Break-even ROAS (multiple)'));
 for(const p of [40,50])assert.throws(()=>run('roas','target',{contribution_margin:40,target_margin:p}),/below/);
 close(val(run('roas','target',{revenue:0}),'Maximum advertising spend for target'),0);
});
test('Landed costs reconcile every entered amount and allocate the invoice total once',()=>{
 const r=run('landed-cost','shipment');close(val(r,'Total landed cost'),6800);close(val(r,'Landed cost per unit'),13.6);close(val(r,'Additional shipment costs'),1800);close(val(r,'Cost uplift over goods invoice'),36);
 close(r.rows!.reduce((s,row)=>s+Number(row[1]),0),6800);
 const zeroFees={freight:0,insurance:0,duties:0,taxes:0,brokerage:0,port:0,inland:0,other:0};
 close(val(run('landed-cost','shipment',{...zeroFees,quantity:8,goods:104}),'Landed cost per unit'),13);
 const free=run('landed-cost','shipment',{...zeroFees,goods:0,freight:40,quantity:4});close(val(free,'Landed cost per unit'),10);assert.ok(!free.metrics.some(m=>m.label.includes('uplift')));
 for(const quantity of [0,1.5])assert.throws(()=>run('landed-cost','shipment',{quantity}));
 assert.throws(()=>run('landed-cost','shipment',{duties:-1}));
});
test('Quick ratio components and exclusions agree without retaining prepaid assets',()=>{
 const a=run('quick-ratio','components',{cash:5000,securities:10000,receivables:15000,liabilities:20000});close(val(a,'Quick ratio'),1.5);close(val(a,'Quick assets'),30000);close(val(a,'Quick assets less current liabilities'),10000);
 const b=run('quick-ratio','exclusions',{assets:60000,inventory:20000,prepaid:7000,nonquick:3000,liabilities:20000});close(val(b,'Quick ratio'),1.5);close(val(b,'Excluded current assets'),30000);
 const z=run('quick-ratio','exclusions',{assets:40000,inventory:30000,prepaid:5000,nonquick:5000});close(val(z,'Quick ratio'),0);
 assert.throws(()=>run('quick-ratio','exclusions',{assets:100,inventory:101}),/cannot exceed/);
 for(const mode of ['components','exclusions'])assert.throws(()=>run('quick-ratio',mode,{liabilities:0}),/greater than zero/);
});
test('Current ratio totals and components preserve working capital and negative differences',()=>{
 const a=run('current-ratio','totals',{assets:30000,liabilities:20000});close(val(a,'Current ratio'),1.5);close(val(a,'Working capital'),10000);
 const b=run('current-ratio','components',{cash:5000,securities:1000,receivables:4000,inventory:10000,prepaid:2000,other_current:8000,liabilities:20000});close(val(b,'Current ratio'),1.5);close(val(b,'Total current assets'),30000);
 const z=run('current-ratio','totals',{assets:0,liabilities:5000});close(val(z,'Current ratio'),0);close(val(z,'Working capital'),-5000);
 close(val(run('current-ratio','totals',{assets:1000,liabilities:2000}),'Current ratio'),.5);
 for(const mode of ['totals','components'])assert.throws(()=>run('current-ratio',mode,{liabilities:0}),/greater than zero/);
});
test('Every new mode rejects blank, nonfinite, negative and unsupported numeric range',()=>{
 for(const c of calculators.filter(c=>['roas','landed-cost','quick-ratio','current-ratio'].includes(c.id)))for(const m of c.modes){
  const key=m.fields[0].key;for(const value of ['', 'NaN','Infinity','-1','10000000000000000'])assert.throws(()=>run(c.id,m.id,{[key]:value}),c.id+'/'+m.id+'/'+value);
 }
});
