import {test} from 'node:test';import assert from 'node:assert/strict';
import cases from './fixtures/property-deals-expected.json';
import {sellerPlan,flipPlan,sellerFinancingCalculator,fixFlipCalculator} from '../src/lib/calculators/property-deals';
import {defaults} from '../src/lib/types';
import {calculateMode} from '../src/lib/calculate-mode';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {hasEmbed,hasPinterest,shareTabs} from '../src/lib/share-tools';
const near=(a:number,b:number,label:string)=>assert.ok(Math.abs(a-b)<=Math.max(.00001,Math.abs(b)*2e-10),`${label}: ${a} vs ${b}`);
for(const [index,c] of cases.entries())test(`Independent Decimal property case ${index}: ${c.id}/${c.mode}`,()=>{
 const v=c.values as unknown as Record<string,string>,r=c.id==='seller-financing'?sellerPlan(v,c.mode==='interest-only'):flipPlan(v);
 for(const [label,value] of Object.entries(c.metrics)){const m=r.metrics.find(m=>m.label===label)!;assert.ok(m,label);near(m.value,value!,label);}
 if(c.rows){assert.equal(r.rows!.length,c.rows.length);for(const [i,row] of c.rows.entries())for(let j=0;j<row.length;j++)near(Number(r.rows![i][j]),Number(row[j]),`row${i}col${j}`);}
 if(c.id==='seller-financing'){
  const sums=r.rows!.reduce<number[]>((a,row)=>[a[0]+Number(row[1]),a[1]+Number(row[2]),a[2]+Number(row[3])],[0,0,0]);near(sums[0],sums[1]+sums[2],'payment conservation');near(sums[2],Number(v.price)-Number(v.down),'principal conservation');if(r.rows!.length)assert.equal(r.rows!.at(-1)![4],0);
 }else{const m=(s:string)=>r.metrics.find(m=>m.label===s)!.value;near(m('Net sale cash after loan payoff')-m('Total cash required before sale'),m('Net project profit before income tax'),'cash bridge');}
});
test('Property contract bounds reject infeasible terms and hidden cash financing is ignored',()=>{
 const s=defaults(sellerFinancingCalculator.modes[0]),f=defaults(fixFlipCalculator.modes[0]);
 for(const patch of [{down:'300001'},{years:'0'},{years:'1.5'},{due:'361'},{due:'0'},{rate:'101'},{price:'NaN'},{due:'1.2'}])assert.throws(()=>sellerPlan({...s,...patch} as unknown as Record<string,string>));
 for(const patch of [{loan:'150001'},{selling:'100'},{months:'0'},{months:'1.5'},{rehab:'-1'},{financing:'Unknown'},{sale:'Infinity'}])assert.throws(()=>flipPlan({...f,...patch} as unknown as Record<string,string>));
 assert.deepEqual(flipPlan({...f,financing:'Cash',loan:'',rate:'not a rate',points:''}),flipPlan({...f,financing:'Cash'}));
 assert.deepEqual(calculateMode(fixFlipCalculator,'project',{...f,financing:'Cash',loan:'',rate:'not a rate',points:''}),calculateMode(fixFlipCalculator,'project',{...f,financing:'Cash'}));
 const zero=flipPlan({...f,price:'120000',closing:'0',rehab:'0',holding:'0',loan:'120000',rate:'0',points:'0'});assert.match(zero.metrics[3].displayValue!,/Undefined/);
 const zeroRate=sellerPlan({...s,rate:'0'},true);assert.equal(zeroRate.metrics[0].value,0);assert.equal(zeroRate.metrics[1].value,240000);
});
test('Both property tools retain complete share restoration and supported embed capabilities',()=>{
 for(const c of [sellerFinancingCalculator,fixFlipCalculator])for(const m of c.modes){const v=defaults(m),url=new URL(calculationLink('https://www.calculatorfree.io','/'+c.id+'-calculator.html',m,v,true)),restored=sharedInputs(c,url.search,url.hash)!;assert.deepEqual(restored.values,v);assert.equal(restored.mode.id,m.id);assert.deepEqual(shareTabs(c.id),['Share','Embed','Cite','Export']);assert.ok(hasEmbed(c.id));assert.ok(hasPinterest(c.id));}
});
