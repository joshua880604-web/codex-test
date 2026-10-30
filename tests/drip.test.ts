import {test} from 'node:test';import assert from 'node:assert/strict';
import {dripCalculator as calc,dripPlan} from '../src/lib/calculators/drip';
import fixtures from './fixtures/drip-expected.json';
import {defaults,type Values} from '../src/lib/types';import {runClientCalculation} from '../src/lib/calculate-client';
import {resultTrend} from '../src/lib/result-trend';import {resultExportData} from '../src/lib/result-export';
import {guides,relatedCalculatorIds} from '../src/lib/guides';import {calculatorSchema,sitemapEntries} from '../src/lib/seo';
import {calculatorCategory} from '../src/lib/calculator-categories';import {hasShareTools,hasEmbed,hasPinterest} from '../src/lib/share-tools';
const base=defaults(calc.modes[0]);
const metric=(r:ReturnType<typeof dripPlan>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
test('DRIP matches 53 independent Decimal fixtures across frequency, tax, dividend growth and price declines',()=>{
 assert.equal(fixtures.length,53);
 for(const f of fixtures){const r=dripPlan(f.values);assert.equal(r.rows!.length,Number(f.values.years)*12);assert.equal(r.annualRows!.length,Number(f.values.years));r.metrics.forEach((m,i)=>assert.ok(Math.abs(m.value-Number(f.metrics[i]))<1e-6,`${JSON.stringify(f.values)} ${m.label}`));for(const row of f.checkpoints){const actual=r.rows![Number(row[0])-1];row.forEach((v,i)=>assert.ok(Math.abs(Number(actual[i])-Number(v))<1e-6,`month ${row[0]} column ${i}`));}}
});
test('DRIP cash wealth, reinvested income and external contributions reconcile for every period',()=>{
 for(const f of fixtures){const r=dripPlan(f.values);let cash=0,reinvested=0;
  for(const row of r.rows!){const n=row.map(Number);cash+=n[8];reinvested+=n[5];assert.ok(Math.abs(n[12]-(n[10]+n[11]))<1e-6);assert.ok(Math.abs(n[13]-(n[7]-n[12]))<1e-6);assert.ok(Math.abs(n[11]-cash)<1e-6);assert.ok(Math.abs(n[3]-n[4]-n[5])<1e-6);}
  assert.ok(Math.abs(reinvested-metric(r,'Net dividends reinvested'))<1e-6);assert.equal(metric(r,'External money invested'),Number(f.values.initial)+Number(f.values.years)*12*Number(f.values.monthly));
 }
});
test('New monthly contributions do not receive the current payout; annual growth begins in year two',()=>{
 const v={...base,initial:'0',price:'100',yield:'12',frequency:'Monthly',monthly:'100',years:'2',price_growth:'0',dividend_growth:'10',tax:'0'},r=dripPlan(v),rows=r.rows!;
 assert.equal(rows[0][3],0);assert.equal(rows[0][6],1);assert.equal(rows[1][3],1);
 assert.ok(Math.abs(Number(rows[12][3])/Number(rows[11][6])-1.1)<1e-12);
});
test('Zero yield and complete dividend taxation give equality; falling prices can favor retained cash',()=>{
 for(const patch of [{yield:'0'},{tax:'100'}] as Values[]){const r=dripPlan({...base,...patch});assert.ok(Math.abs(metric(r,'DRIP minus cash-dividend wealth'))<1e-6);}
 const r=dripPlan({...base,monthly:'0',years:'5',price_growth:'-20',dividend_growth:'0'});assert.ok(metric(r,'DRIP minus cash-dividend wealth')<0);
 const quarterly=dripPlan({...base,monthly:'0',years:'1',price_growth:'0',dividend_growth:'0'});assert.ok(Math.abs(quarterly.metrics[0].value-10406.0401)<1e-8);assert.equal(quarterly.metrics[1].value,10400);
});
test('DRIP invalid horizons, growth rates, enums, empty input and extreme projections fail clearly',()=>{
 for(const patch of [{years:'0'},{years:'1.5'},{years:'101'},{price:'0'},{initial:'-1'},{monthly:'-1'},{yield:'101'},{tax:'101'},{price_growth:'-100'},{dividend_growth:'-100'},{frequency:'Daily'},{initial:'0',monthly:'0'},{price:'NaN'},{initial:''},{years:'100',price_growth:'100',dividend_growth:'100'}] as Values[])assert.throws(()=>dripPlan({...base,...patch}));
});
test('DRIP lazy client, trend endpoints and full export agree with the canonical calculator',async()=>{
 const r=dripPlan(base);assert.deepEqual(await runClientCalculation('drip','Investment','projection',base),r);const trend=resultTrend('drip','projection',base,r)!;assert.ok(trend);assert.equal(trend.points[0].balance,10000);assert.equal(trend.points.at(-1)!.balance,r.metrics[0].value);assert.equal(trend.points.at(-1)!.comparison,r.metrics[1].value);
 const exportData=await resultExportData('drip',calc.modes[0],base,r);assert.ok(exportData.notes.some(n=>n.includes('total-return')));assert.equal(exportData.metrics[0].value,r.metrics[0].value);assert.equal(r.rows!.length,240);assert.ok(exportData.scope?.includes('dividend tax'));
});
test('DRIP has a unique canonical page, accurate questions, related tools and capability-gated sharing',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/drip-calculator').length,1);assert.equal(calculatorCategory('drip')!.id,'saving-investing');assert.ok(guides.drip.questions.length>=8);for(const id of ['investment','compound-interest','covered-call'])assert.ok(relatedCalculatorIds[id].includes('drip'));
 assert.equal(hasShareTools('drip'),true);assert.equal(hasEmbed('drip'),true);assert.equal(hasPinterest('drip'),true);const schema=JSON.stringify(calculatorSchema(calc,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});
