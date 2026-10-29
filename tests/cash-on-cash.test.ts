import {switchModeInputs} from '../src/lib/mode-navigation';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cashOnCashCalculator,simpleCashReturn,propertyCashReturn} from '../src/lib/calculators/cash-on-cash';
import {defaults,type Result} from '../src/lib/types';
import {runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {workspaceLayout} from '../src/lib/workspace-layout';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const calc=cashOnCashCalculator;
const input=(mode:string,p:Record<string,string|number>={})=>({...defaults(calc.modes.find(m=>m.id===mode)!),...Object.fromEntries(Object.entries(p).map(([k,n])=>[k,String(n)]))});
const run=(mode:string,p:Record<string,string|number>={})=>runCalculation(calc.id,mode,input(mode,p));
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`);
const sample={price:200000,loan:120000,closing:4000,repairs:6000,initial_reserve:0,rate:0,years:20,rent:2000,vacancy:5,other_income:0,operating:600,reserve:100,other_debt:0};
test('Cash return simple annual and recurring monthly inputs give the same cash yield',()=>{
 const annual=run('simple'),monthly=run('simple',{period:'Monthly',cash_flow:500});for(const r of [annual,monthly]){close(get(r,'Cash-on-cash return'),10);close(get(r,'Annual cash flow used'),6000);close(get(r,'Monthly cash flow equivalent'),500);}
});
test('Cash return simple loss is negative but nonpositive/sub-cent basis is undefined',()=>{
 close(get(run('simple',{cash_flow:-6000}),'Cash-on-cash return'),-10);
 for(const cash_invested of [0,-60000,.001]){const r=run('simple',{cash_invested});assert.match(r.metrics[0].displayValue!,/Not applicable/);assert.ok(Number.isFinite(r.metrics[0].value));}
});
test('Cash return property reconciles cash contributions rather than price or equity',()=>{
 const r=run('property',sample);close(get(r,'Cash invested'),90000);close(get(r,'Annual NOI before reserve and financing'),15600);close(get(r,'First-year principal and interest paid'),6000);close(get(r,'Annual cash flow used'),8400);close(get(r,'Cash-on-cash return'),8400/90000*100);close(get(r,'Cap rate at purchase price'),7.8);close(get(r,'Cash-on-cash return before capital reserve'),9600/90000*100);
});
test('Cash return loan P&I matches independent annuity formula and principal conservation',()=>{
 const r=run('property'),j=.065/12,p=200000*j/(1-(1+j)**(-360));close(get(r,'First scheduled loan payment'),p);close(get(r,'First-year principal and interest paid'),p*12);close(get(r,'Loan balance after first 12 months'),200000*(1+j)**12-p*((1+j)**12-1)/j);close(get(r,'First-year loan interest paid')+get(r,'First-year principal repaid (not cash income)'),get(r,'First-year principal and interest paid'));close(get(r,'Cash invested'),68000);
});
test('Cash return early loan payoff deducts actual six payments rather than twelve',()=>{
 const r=run('property',{...sample,price:12000,loan:12000,closing:6000,repairs:0,years:.5,rent:2000,vacancy:0,operating:0,reserve:0});close(get(r,'First scheduled loan payment'),2000);close(get(r,'First-year principal and interest paid'),12000);close(get(r,'Annual cash flow used'),12000);close(get(r,'Monthly cash flow equivalent'),1000);close(get(r,'Loan balance after first 12 months'),0);close(get(r,'Cash-on-cash return'),200);
});
test('Cash return no loan and zero-interest one-month payoff are supported',()=>{
 const cash=run('property',{...sample,loan:0});close(get(cash,'First-year principal and interest paid'),0);close(get(cash,'Cash invested'),210000);close(get(cash,'Annual cash flow used'),14400);
 const one=run('property',{...sample,loan:12000,years:1/12});close(get(one,'First-year principal and interest paid'),12000);close(get(one,'Loan balance after first 12 months'),0);
});
test('Cash return reserve treatment changes numerator/basis explicitly without changing NOI',()=>{
 const a=run('property',sample),b=run('property',{...sample,initial_reserve:5000,reserve:200});close(get(b,'Cash invested'),95000);close(get(b,'Annual cash flow used'),7200);close(get(b,'Annual NOI before reserve and financing'),get(a,'Annual NOI before reserve and financing'));close(get(b,'Cash-on-cash return before capital reserve'),9600/95000*100);
});
test('Cash return financing costs reduce cash flow but not NOI and principal is not added back',()=>{
 const r=run('property',{...sample,other_debt:100});close(get(r,'Annual cash flow used'),7200);close(get(r,'Annual NOI before reserve and financing'),15600);close(get(r,'First-year principal repaid (not cash income)'),6000);
});
test('Cash return vacancy applies to rent only; losses stay negative with positive cash basis',()=>{
 const r=run('property',{...sample,vacancy:100,other_income:100});close(get(r,'Annual NOI before reserve and financing'),-6000);close(get(r,'Annual cash flow used'),-13200);close(get(r,'Cash-on-cash return'),-13200/90000*100);
});
test('Cash return rent sensitivity uses the same cash and entered dollar expense assumptions',()=>{
 const r=run('property',sample),rows=r.additionalTables![1].rows;close(Number(rows[1][2]),8400);close(Number(rows[1][3]),get(r,'Cash-on-cash return'));close(Number(rows[2][2])-Number(rows[1][2]),200*.95*12);assert.ok(Number(rows[0][3])<Number(rows[1][3]));
});
test('Cash return zero acquisition cash retains undefined yield without inventing infinity',()=>{
 const r=run('property',{...sample,loan:200000,closing:0,repairs:0});close(get(r,'Cash invested'),0);assert.match(r.metrics[0].displayValue!,/Not applicable/);assert.ok(r.additionalTables![1].rows.every(row=>row[3]==='Not applicable'));
});
test('Cash return rejects invalid funding and period inputs without coercing missing values',()=>{
 for(const p of [{price:0},{loan:200001},{closing:-1},{rate:101},{years:0},{years:51},{years:1.01},{vacancy:101},{reserve:-1},{other_debt:-1},{initial_reserve:-1},{rent:''},{operating:'Infinity'}])assert.throws(()=>run('property',{...sample,...p}));
 for(const p of [{period:'Weekly'},{cash_invested:''},{cash_flow:'NaN'},{cash_flow:1e11}] as Record<string,string|number>[])assert.throws(()=>run('simple',p));assert.throws(()=>simpleCashReturn(input('simple',{period:'Other'})));assert.throws(()=>propertyCashReturn(input('property',{price:1e11})));
});
test('Cash return simple and rental engine agree for exactly matched cash definitions',()=>{
 const property=run('property',sample),simple=run('simple',{period:'Annually',cash_invested:get(property,'Cash invested'),cash_flow:get(property,'Annual cash flow used')});close(get(simple,'Cash-on-cash return'),get(property,'Cash-on-cash return'));
});
test('Cash return lazy client engines and worked content examples are reproducible',async()=>{
 for(const m of calc.modes)assert.deepEqual(await runClientCalculation(calc.id,calc.category,m.id,input(m.id)),run(m.id));for(const e of guides[calc.id].examples)close(get(run(e.mode,e.values),e.expected.label),e.expected.value);assert.equal(guides[calc.id].questions.length,11);
});
test('Cash return has one canonical tool and connects existing property and glossary context',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/cash-on-cash-return-calculator').length,1);assert.equal(calculatorCategory(calc.id)!.id,'mortgage-housing');assert.equal(workspaceLayout(calc.id,'property'),'stacked');assert.equal(workspaceLayout(calc.id,'simple'),'split');for(const id of ['noi','brrrr','rental-property'])assert.ok(relatedCalculatorIds[id].includes(calc.id));const schema=JSON.stringify(calculatorSchema(calc,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});

test('Cash return mode drafts preserve each input definition without copying cash basis into purchase data',()=>{
 const simple=calc.modes[0],property=calc.modes[1];
 const a=switchModeInputs(calc.id,simple,property,input('simple',{period:'Monthly',cash_flow:500}),{});assert.equal(a.values.price,'250000');assert.equal(a.values.cash_flow,undefined);
 const b=switchModeInputs(calc.id,property,simple,{...a.values,loan:'1000'},a.drafts);assert.equal(b.values.period,'Monthly');assert.equal(b.values.cash_flow,'500');assert.equal(b.values.loan,undefined);
 const c=switchModeInputs(calc.id,simple,property,b.values,b.drafts);assert.equal(c.values.loan,'1000');
});
