import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,routeFor} from '../src/lib/calculators';
import {calculatorSchema} from '../src/lib/seo';
import {calculatorCategories} from '../src/lib/calculator-categories';
test('Clear calculator names use their approved canonical routes and schema names',()=>{
 const expected=[['take-home-paycheck','Paycheck Calculator','/paycheck-calculator.html'],['credit-card','Credit Card Payoff Calculator','/single-credit-card-payoff-calculator.html'],['credit-cards-payoff','Multiple Credit Card Payoff Calculator','/multiple-credit-card-payoff-calculator.html'],['repayment','Loan Repayment Calculator','/loan-repayment-calculator.html'],['rent','Rent Affordability Calculator','/rent-affordability-calculator.html'],['currency','Currency Converter','/currency-converter.html']];
 for(const[id,title,path]of expected){const c=calculators.find(c=>c.id===id)!;assert.equal(c.title,title);assert.equal(routeFor(id),path);assert.equal(calculatorSchema(c,{origin:'https://www.calculatorfree.io',indexable:true})['@graph'][0].name,title);}
 assert.equal(calculatorCategories.find(c=>c.id==='everyday')!.title,'Everyday Calculators');
 assert.equal(calculators.find(c=>c.id==='margin')!.title,'Margin Calculator');
});

test('Previous calculator names remain discoverable on the new canonical routes',async()=>{
 const {directorySearch}=await import('../src/lib/directory');const {calculators:catalog}=await import('../src/lib/catalog');
 for(const[query,id]of [['Take-Home-Paycheck Calculator','take-home-paycheck'],['Credit Card Calculator','credit-card'],['Credit Cards Payoff Calculator','credit-cards-payoff'],['Repayment Calculator','repayment'],['Rent Calculator','rent'],['Currency Calculator','currency']]){
  assert.ok(directorySearch(catalog,query).some(result=>result.tool.id===id),query);
 }
});
