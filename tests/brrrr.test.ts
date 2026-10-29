import {test} from 'node:test';
import assert from 'node:assert/strict';
import {brrrrCalculator,brrrrPlan} from '../src/lib/calculators/brrrr';
import {defaults,type Result} from '../src/lib/types';
import {runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {workspaceLayout} from '../src/lib/workspace-layout';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const m=brrrrCalculator.modes[0],v=(p:Record<string,string|number>={})=>({...defaults(m),...Object.fromEntries(Object.entries(p).map(([k,n])=>[k,String(n)]))});
const run=(p:Record<string,string|number>={})=>runCalculation('brrrr','deal',v(p));
const n=(r:Result,label:string)=>{const x=r.metrics.find(m=>m.label===label);assert.ok(x,label);return x.value;};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`);
const simple={price:150000,closing:5000,rehab:30000,contingency:0,loan:100000,loan_rate:0,points:0,months:6,holding:500,arv:240000,ltv:75,refi_costs:4000,refi_rate:0,years:30,rent:2000,vacancy:5,other_income:0,operating:600,reserve:100};
test('BRRRR independently reconciles a purchase, refinance and zero-rate payment',()=>{
 const r=run(simple);close(n(r,'Cash invested before refinance'),88000);close(n(r,'New refinance loan amount'),180000);close(n(r,'Net refinance cash to you (signed)'),76000);close(n(r,'Cash remaining in deal (signed)'),12000);close(n(r,'Monthly refinance principal and interest'),500);close(n(r,'Monthly cash flow after reserve'),700);close(n(r,'Post-refinance cash-on-cash return'),70);
});
test('BRRRR acquisition interest and points are cash costs, not capitalized principal',()=>{
 const r=run();close(n(r,'Acquisition interest paid during hold'),6000);close(n(r,'Budgeted rehab including contingency'),38500);close(n(r,'Cash invested before refinance'),84400);close(n(r,'Net refinance cash to you (signed)'),63500);close(n(r,'Cash remaining in deal (signed)'),20900);
 // Independent standard annuity formula rather than the shared payment helper.
 const j=.07/12,p=187500*j/(1-(1+j)**(-360));close(n(r,'Monthly refinance principal and interest'),p);close(n(r,'Monthly cash flow after reserve'),1390-p);
});
test('BRRRR closing fees are subtracted once and cancel out of all-in-minus-new-debt identity',()=>{
 for(const fee of [0,4000,12000]){const r=run({...simple,refi_costs:fee});close(n(r,'Cash remaining in deal (signed)'),188000+fee-180000);close(n(r,'Cash invested before refinance'),88000);}
});
test('BRRRR negative proceeds require additional cash rather than counting cash recovered',()=>{
 const r=run({...simple,arv:100000});close(n(r,'Net refinance cash to you (signed)'),-29000);close(n(r,'Additional cash due at refinance'),29000);close(n(r,'Cash received at refinance'),0);close(n(r,'Cash remaining in deal (signed)'),117000);close(n(r,'Original cash recovered'),0);
});
test('BRRRR zero and negative cash bases have no fabricated infinite percentage',()=>{
 for(const arv of [188000/.75+4000/.75,300000]){const r=run({...simple,arv});const cash=n(r,'Cash remaining in deal (signed)');assert.ok(cash<=.000001);const metric=r.metrics.find(x=>x.label==='Post-refinance cash-on-cash return')!;assert.match(metric.displayValue!,/Not applicable/);assert.ok(Number.isFinite(metric.value));}
 const extra=run({...simple,arv:300000});close(n(extra,'Cash received above original investment'),33000);close(n(extra,'Original cash recovered'),100);
});
test('BRRRR cash purchase has no acquisition interest or points, and rent is not applied during hold',()=>{
 const r=run({...simple,loan:0,loan_rate:100,points:100});close(n(r,'Cash invested before refinance'),188000);close(n(r,'Acquisition interest paid during hold'),0);close(n(r,'Net refinance cash to you (signed)'),176000);close(n(r,'Cash remaining in deal (signed)'),12000);
 const highRent=run({...simple,rent:9000});close(n(highRent,'Cash invested before refinance'),88000);
});
test('BRRRR zero hold charges neither time-based cost nor interest but retains upfront points',()=>{
 const r=run({...simple,loan_rate:12,points:2,months:0});close(n(r,'Acquisition interest paid during hold'),0);close(n(r,'Cash invested before refinance'),87000);
});
test('BRRRR reserves reduce cash flow but not NOI; other income is not reduced by rent vacancy',()=>{
 const r=run({...simple,other_income:200,reserve:300});close(n(r,'Annual NOI before reserve and financing'),18000);close(n(r,'Monthly cash flow after reserve'),700);close(n(r,'NOI / principal-and-interest coverage'),3);
 const loss=run({...simple,vacancy:100,other_income:0});close(n(loss,'Annual NOI before reserve and financing'),-7200);close(n(loss,'Monthly cash flow after reserve'),-1200);close(n(loss,'Post-refinance cash-on-cash return'),-120);
});
test('BRRRR no refinance debt has no P&I or invented coverage ratio',()=>{
 const r=run({...simple,ltv:0});close(n(r,'Monthly refinance principal and interest'),0);close(n(r,'Monthly cash flow after reserve'),1200);assert.match(r.metrics.find(m=>m.label==='NOI / principal-and-interest coverage')!.displayValue!,/Not applicable/);
});
test('BRRRR sensitivity changes just ARV or rate and matches the entered baseline',()=>{
 const r=run(),rows=r.additionalTables![2].rows;assert.equal(rows.length,5);close(Number(rows[0][3]),n(r,'Net refinance cash to you (signed)'));close(Number(rows[0][4]),n(r,'Cash remaining in deal (signed)'));assert.ok(Number(rows[1][4])>Number(rows[0][4]));assert.ok(Number(rows[2][4])<Number(rows[0][4]));assert.ok(Number(rows[3][5])>Number(rows[0][5]));assert.ok(Number(rows[4][5])<Number(rows[0][5]));
 const zero=run({...simple,refi_rate:0});close(Number(zero.additionalTables![2].rows[3][2]),0);
});
test('BRRRR validation rejects invalid funding, dates and amounts; whole-month terms are accepted',()=>{
 for(const p of [{price:0},{arv:0},{loan:150001},{months:-1},{months:1.5},{months:121},{years:0},{years:51},{years:1.01},{ltv:101},{refi_rate:-1},{loan_rate:-1},{points:101},{contingency:101},{rent:-1},{reserve:-1},{holding:''},{arv:'Infinity'}])assert.throws(()=>run({...simple,...p}));
 close(n(run({...simple,years:2.5}),'Monthly refinance principal and interest'),6000);assert.throws(()=>brrrrPlan(v({price:1e11})));
});
test('BRRRR no initial cash and no retained cash leave both ratios explicitly undefined',()=>{
 const r=run({...simple,price:100000,loan:100000,closing:0,rehab:0,holding:0,months:0,arv:100000,ltv:100,refi_costs:0});close(n(r,'Cash invested before refinance'),0);close(n(r,'Cash remaining in deal (signed)'),0);assert.match(r.metrics.find(m=>m.label==='Original cash recovered')!.displayValue!,/Not applicable/);
});
test('BRRRR lazy client calculation and reproducible content examples match the engine',async()=>{
 assert.deepEqual(await runClientCalculation('brrrr','Mortgage and Real Estate','deal',v()),run());for(const e of guides.brrrr.examples)close(n(run(e.values),e.expected.label),e.expected.value);assert.equal(guides.brrrr.questions.length,9);
});
test('BRRRR has one canonical tool, contextual links, grouped workspace and no invented ratings',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/brrrr-calculator').length,1);assert.equal(calculatorCategory('brrrr')!.id,'mortgage-housing');assert.equal(workspaceLayout('brrrr','deal'),'stacked');for(const id of ['noi','rental-property','refinance'])assert.ok(relatedCalculatorIds[id].includes('brrrr'));const schema=JSON.stringify(calculatorSchema(brrrrCalculator,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});

test('BRRRR sub-cent retained cash is not shown as zero alongside an enormous yield',()=>{
 const r=run({...simple,arv:(192000-.001)/.75});assert.ok(Math.abs(n(r,'Cash remaining in deal (signed)'))<.005);assert.match(r.metrics.find(m=>m.label==='Post-refinance cash-on-cash return')!.displayValue!,/Not applicable/);
});
