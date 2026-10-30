import {test} from 'node:test';import assert from 'node:assert/strict';
import fixtures from './fixtures/stock-tools-expected.json';
import {stockProfit,stockAverage,stockProfitCalculator,stockAverageCalculator} from '../src/lib/calculators/stock-trades';
import {stockLotsDefault,stockLotDrafts} from '../src/lib/stock-lots';
import {defaults} from '../src/lib/types';import {calculateMode} from '../src/lib/calculate-mode';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {resultExportData} from '../src/lib/result-export';import {summaryPNGData} from '../src/lib/summary-png';
import {hasEmbed,hasPinterest,shareTabs} from '../src/lib/share-tools';
const near=(actual:number,expected:number,label:string)=>assert.ok(Math.abs(actual-expected)<=Math.max(1e-8,Math.abs(expected)*1e-11),`${label}: ${actual} vs ${expected}`);
for(const [index,c] of fixtures.entries())test(`Independent stock Decimal case ${index}: ${c.id}`,()=>{
 const v=c.values as unknown as Record<string,string>,r=c.id==='stock-profit'?stockProfit(v):stockAverage(v);
 for(const [label,value] of Object.entries(c.metrics))near(r.metrics.find(m=>m.label===label)!.value,value!,label);
 if(c.id==='stock-average'){assert.equal(r.rows!.length,JSON.parse(v.lots).length);near(Number(r.rows!.at(-1)![5]),r.metrics[1].value,'cumulative shares');near(Number(r.rows!.at(-1)![6]),r.metrics[0].value,'running cost');}
 else near(r.metrics[0].value,r.metrics[4].value+r.metrics[5].value-r.metrics[3].value,'cash reconciliation');
});
test('Stock profit handles fee degeneracy, losses and zero-cost returns explicitly',()=>{
 const v=defaults(stockProfitCalculator.modes[0]);
 const noProceeds=stockProfit({...v,sell_fee_unit:'Percent',sell_fee:'100'});assert.match(noProceeds.metrics[2].displayValue!,/No break-even/);
 const zero=stockProfit({...v,buy:'0',buy_fee:'0',sell_fee_unit:'Percent',sell_fee:'100'});assert.match(zero.metrics[1].displayValue!,/Undefined/);assert.match(zero.metrics[2].displayValue!,/Every sale price/);
 const recovered=stockProfit({...v,dividends:'10000'});assert.match(recovered.metrics[2].displayValue!,/recovered/);
 const regular=stockProfit(v),threshold=regular.metrics[2].value;near(stockProfit({...v,sell:String(threshold)}).metrics[0].value,0,'break-even identity');
 for(const patch of [{shares:'0'},{shares:'-1'},{buy:'-1'},{sell:'NaN'},{buy_fee_unit:'Percent',buy_fee:'101'},{sell_fee_unit:'Unknown'},{dividends:'-1'},{buy:'1000000000',shares:'1000000000'}])assert.throws(()=>stockProfit({...v,...patch} as unknown as Record<string,string>));
});
test('Stock average is weighted, preserves blank drafts and does not turn missing price into a total loss',()=>{
 const v={lots:stockLotsDefault,market:''},r=stockAverage(v);near(r.metrics[0].value,7010/150,'weighted fee-inclusive cost');near(r.metrics[3].value,7000/150,'fee-exclusive price');assert.match(r.metrics[5].displayValue!,/Enter/);assert.equal(stockAverage({...v,market:'0'}).metrics[6].value,-7010);
 const zero=stockAverage({lots:JSON.stringify([{shares:1,price:0,fee:0}]),market:'50'});assert.match(zero.metrics[7].displayValue!,/Undefined/);
 const incomplete=JSON.stringify([{shares:'',price:'50',fee:'0'}]);assert.equal(stockLotDrafts(incomplete)[0].shares,'');assert.throws(()=>stockAverage({lots:incomplete,market:''}));
 for(const raw of ['not JSON','[]','null','[null]','[[]]','[{"shares":1,"price":2,"fee":null}]',JSON.stringify(Array(31).fill({shares:1,price:2,fee:0})),JSON.stringify([{shares:0,price:2,fee:0}]),JSON.stringify([{shares:1,price:'<script>',fee:0}])])assert.throws(()=>stockAverage({lots:raw,market:''}));
});
test('Stock sharing restores purchase rows and image export distinguishes highlights from all inputs',async()=>{
 for(const c of [stockProfitCalculator,stockAverageCalculator]){const m=c.modes[0],v=defaults(m),url=new URL(calculationLink('https://www.calculatorfree.io','/'+c.id+'-calculator.html',m,v,true)),restored=sharedInputs(c,url.search,url.hash)!;assert.deepEqual(restored.values,v);assert.deepEqual(shareTabs(c.id),['Share','Embed','Cite','Export']);assert.ok(hasEmbed(c.id)&&hasPinterest(c.id));const r=calculateMode(c,m.id,v),data=await resultExportData(c.id,m,v,r),summary=summaryPNGData(c.id,v,m.fields,data,false),full=summaryPNGData(c.id,v,m.fields,data,true);
 if(c.id==='stock-average'){assert.ok(!summary.details.inputs!.some(i=>i.label==='Purchase 1'));assert.equal(summary.details.disclosure,'key');assert.ok(full.details.inputs!.some(i=>i.label==='Purchase 1'&&i.value.includes('100 shares')));assert.equal(full.details.disclosure,'all');assert.ok(!full.details.inputs!.some(i=>i.value.includes('"shares"')));assert.ok(data.enteredInputs!.some(i=>i.label==='Purchase 1'));assert.ok(!data.enteredInputs!.some(i=>i.value.includes('"shares"')));}
 }
});
