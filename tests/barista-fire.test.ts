import {test} from 'node:test';
import assert from 'node:assert/strict';
import {baristaFireCalculator,baristaPlan} from '../src/lib/calculators/barista-fire';
import {calculators,runCalculation} from '../src/lib/calculators';
import {defaults,type Result} from '../src/lib/types';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
import {resultTrend} from '../src/lib/result-trend';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const mode=baristaFireCalculator.modes[0];
const input=(patch:Record<string,string|number>={})=>({...defaults(mode),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});
const run=(patch:Record<string,string|number>={})=>runCalculation('barista-fire','plan',input(patch));
const get=(r:Result,label:string)=>{const n=r.metrics.find(m=>m.label===label);assert.ok(n,label);return n.value;};
const close=(a:number,b:number,tolerance=.00001)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const zero={age:45,start_age:45,income_end:55,retire_age:65,balance:760000,monthly:0,spending:36000,income:24000,full_spending:24000,return:0,inflation:0,withdrawal:4};
test('Barista dated zero-growth bridge includes income-free years and terminal assets',()=>{
 const r=run(zero);close(get(r,'Required portfolio at part-time start'),1080000);close(get(r,'Projected portfolio at full retirement'),280000);close(get(r,'Full retirement target shortfall'),320000);close(get(r,'Unfunded bridge spending'),0);assert.equal(get(r,'Modeled plan status'),0);
 assert.equal(r.rows!.length,20);assert.equal(r.rows![9][1],'Part-time income + portfolio');assert.equal(r.rows![10][1],'Portfolio bridge (income stopped)');
});
test('Barista full income coverage uses no withdrawals; surplus is not invested',()=>{
 for(const income of [36000,90000]){const r=run({...zero,income,income_end:65,balance:600000});close(get(r,'Required portfolio at part-time start'),600000);close(get(r,'Projected portfolio at full retirement'),600000);close(get(r,'Total bridge portfolio withdrawals'),0);assert.equal(get(r,'Modeled plan status'),1);}
});
test('Barista no income and immediate income stop are equivalent',()=>{
 const a=run({...zero,income:0}),b=run({...zero,income_end:45});close(get(a,'Required portfolio at part-time start'),1320000);close(get(b,'Required portfolio at part-time start'),1320000);
});
test('Barista backward valuation agrees with independent annuity PV and exact funding',()=>{
 const patch={...zero,income_end:65,return:5,inflation:0},n=240,j=1.05**(1/12)-1,expected=1000*(1-(1+j)**(-n))/j+600000/(1+j)**n;
 const r=run(patch);close(get(r,'Required portfolio at part-time start'),expected);const funded=run({...patch,balance:expected});close(get(funded,'Projected portfolio at full retirement'),600000);assert.equal(get(funded,'Modeled plan status'),1);
});
test('Barista accumulation is month-end and deposits stop at the transition',()=>{
 const r=run({...zero,age:44,balance:100000,monthly:1000,return:0});close(get(r,'Projected portfolio at part-time start'),112000);close(get(r,'New investments before part-time start'),12000);assert.equal(r.rows![0][1],'Accumulation');close(Number(r.rows![1][3]),0);
});
test('Barista accumulation matches independent FV and preserves annual cash conservation',()=>{
 const r=run({...zero,age:44,balance:100000,monthly:1000,return:5}),j=1.05**(1/12)-1;
 close(get(r,'Projected portfolio at part-time start'),100000*1.05+1000*((1+j)**12-1)/j);
 for(const row of r.rows!){close(Number(row[8]),Number(row[2])+Number(row[3])+Number(row[5])-Number(row[6]));assert.ok(Number(row[8])>=0);}
});
test('Barista exact inflation conversion and negative real returns remain finite',()=>{
 const a=run({...zero,return:5,inflation:5});close(get(a,'Required portfolio at part-time start'),1080000);close(get(a,'Real annual return assumption'),0);
 const b=run({...zero,return:0,inflation:5});assert.ok(get(b,'Required portfolio at part-time start')>1080000);assert.ok(get(b,'Real annual return assumption')<0);
});
test('Barista exhausted assets expose unpaid costs without inventing debt',()=>{
 const r=run({...zero,balance:0});close(get(r,'Projected portfolio at full retirement'),0);close(get(r,'Unfunded bridge spending'),480000);close(get(r,'Total bridge portfolio withdrawals'),0);assert.equal(get(r,'Modeled plan status'),0);
});
test('Barista validates dates, amounts, rates and unsupported magnitudes',()=>{
 for(const patch of [{age:44.5},{start_age:44},{income_end:44},{income_end:66},{retire_age:45},{retire_age:101},{balance:-1},{monthly:-1},{income:-1},{spending:0},{full_spending:0},{return:-100},{inflation:-100},{withdrawal:0},{withdrawal:11},{balance:'NaN'},{return:100,inflation:-99.99}])assert.throws(()=>run({...zero,...patch}));
 assert.throws(()=>baristaPlan(input({...zero,balance:1e13})));
});
test('Barista higher income decreases bridge requirement; terminal target is retained',()=>{
 const r=run(zero),table=r.additionalTables![0];assert.deepEqual(table.rows.map(r=>r[0]),[0,24000,30000]);assert.ok(Number(table.rows[0][1])>Number(table.rows[1][1]));assert.ok(Number(table.rows[1][1])>Number(table.rows[2][1]));close(Number(table.rows[1][1]),get(r,'Required portfolio at part-time start'));
});
test('Barista client lazy engine, worked cases and trend match computed rows',async()=>{
 const v=input(),r=run();assert.deepEqual(await runClientCalculation('barista-fire','Retirement','plan',v),r);const trend=resultTrend('barista-fire','plan',v,r)!;assert.ok(trend);close(trend.points.at(-1)!.balance,get(r,'Projected portfolio at full retirement'));assert.equal(trend.points[0].x,35);
 for(const e of guides['barista-fire'].examples){const r=run(e.values);close(get(r,e.expected.label),e.expected.value,e.expected.tolerance??.005);}assert.equal(guides['barista-fire'].questions.length,8);
});
test('Barista one canonical tool connects category, sources, schema and support pages',()=>{
 assert.equal(calculatorCategory('barista-fire')!.id,'retirement');assert.equal(calculators.filter(c=>c.id==='barista-fire').length,1);
 const config={origin:'https://www.calculatorfree.io',indexable:true},entries=sitemapEntries(config);for(const path of ['/barista-fire-calculator','/glossary/barista-fire/','/guides/barista-fire-vs-coast-fire/'])assert.equal(entries.filter(e=>e.url===config.origin+path).length,1);
 const schema=JSON.stringify(calculatorSchema(baristaFireCalculator,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});
