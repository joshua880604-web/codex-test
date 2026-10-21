import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {calculationLink,sharedInputs,summaryMetrics,summaryText,formatMetric,modeCaption} from '../src/lib/sharing';
test('Every mode round-trips default inputs and recomputes the same results without sending inputs in a query',()=>{
 for(const calc of calculators.filter(c=>!c.directory))for(const mode of calc.modes){
  const values=defaults(mode),link=new URL(calculationLink('https://example.com',routeFor(calc.id),mode,values,true));
  assert.equal(link.search,'');assert.ok(link.hash.startsWith('#calc='));
  const shared=sharedInputs(calc,link.search,link.hash)!;
  assert.equal(shared.mode.id,mode.id);assert.deepEqual(shared.values,values,calc.id+'/'+mode.id);
  assert.deepEqual(runCalculation(calc.id,mode.id,shared.values).metrics,runCalculation(calc.id,mode.id,values).metrics);
  assert.equal(calculationLink('https://example.com',routeFor(calc.id),mode,values),'https://example.com'+routeFor(calc.id));
 }
});
test('Share links preserve blank any-two fields, zeroes and punctuation while rejecting unsupported modes and versions',()=>{
 const vat=calculators.find(c=>c.id==='vat')!,mode=vat.modes[0];
 const values={...defaults(mode),net:'0',gross:'',tax:'',rate:'20'};
 const url=new URL(calculationLink('https://example.com',routeFor('vat'),mode,values,true));assert.deepEqual(sharedInputs(vat,'',url.hash)!.values,values);
 assert.equal(sharedInputs(vat,'?mode=any-two&net=100&tax=20','')!.values.rate,'');
 assert.throws(()=>sharedInputs(vat,'?mode=missing',''),/unavailable/);
 assert.throws(()=>sharedInputs(vat,'','#calc=share_version=2&mode=any-two'),/unsupported/);
 assert.equal(sharedInputs(vat,'?utm_source=friend','#reading-results'),null);
 const debt=calculators.find(c=>c.id==='debt-payoff')!,dm=debt.modes[0],v={...defaults(dm),debts:'A & B, 100, 10, 0\nName # + 漢字, 200, 20, 12'};
 const du=new URL(calculationLink('https://example.com',routeFor(debt.id),dm,v,true));assert.deepEqual(sharedInputs(debt,'',du.hash)!.values,v);
 assert.throws(()=>calculationLink('https://example.com',routeFor(debt.id),dm,{...v,debts:'a'.repeat(21000)},true),/too long/);
});
test('Copied summary matches displayed marriage savings, preserves currency and date and excludes input fields by default',()=>{
 const result={metrics:[{label:'Single taxes',value:1000,format:'money' as const},{label:'Marriage penalty / negative bonus',value:-200,format:'money' as const}]};
 const metrics=summaryMetrics('marriage-tax',result);assert.equal(metrics[0].label,'Estimated annual tax savings after marriage');assert.equal(metrics[0].value,200);
 assert.equal(formatMetric({label:'Date',value:0,displayValue:'2024-02-29'}),'2024-02-29');
 assert.equal(formatMetric({label:'Yen',value:115,format:'money',currency:'JPY'}),'¥115');
 const calc=calculators.find(c=>c.id==='marriage-tax')!,text=summaryText(calc.title,calc.modes[0],calc.id,result,'https://example.com/tool');
 assert.ok(text.includes('Estimated annual tax savings after marriage: $200.00'));assert.ok(!text.includes('-$200'));
 assert.ok(!text.includes('wages='));assert.equal(result.metrics[1].value,-200);
});

test('Summary captions preserve tax year and conversion direction without adding amounts',()=>{
 const tax=calculators.find(c=>c.id==='income-tax')!.modes[0];assert.ok(modeCaption(tax,{year:'2025'}).includes('Tax year: 2025'));
 const currency=calculators.find(c=>c.id==='currency')!.modes[0];assert.ok(modeCaption(currency,{from:'USD',to:'EUR',amount:'12345'}).includes('USD → EUR'));assert.ok(!modeCaption(currency,{from:'USD',to:'EUR',amount:'12345'}).includes('12345'));
});

test('Legacy VAT mode URLs map to the unified form without injecting default inputs',()=>{
 const vat=calculators.find(c=>c.id==='vat')!;
 for(const oldMode of ['net','gross','tax','rate']){
  const parsed=sharedInputs(vat,'?mode='+oldMode+'&tax=40&rate=20','')!;
  assert.equal(parsed.mode.id,'any-two');assert.equal(parsed.values.net,'');assert.equal(parsed.values.gross,'');
  assert.equal(runCalculation(vat.id,parsed.mode.id,parsed.values).metrics.find(m=>m.label==='Net amount')!.value,200);
 }
});
