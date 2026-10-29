import {test} from 'node:test';
import assert from 'node:assert/strict';
import {houseHackingCalculator as calc,houseHackingPlan,rentalSpaces} from '../src/lib/calculators/house-hacking';
import {defaults,type Result} from '../src/lib/types';
import {runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const mode=calc.modes[0],input=(p:Record<string,string|number>={})=>({...defaults(mode),...Object.fromEntries(Object.entries(p).map(([k,n])=>[k,String(n)]))});
const run=(p:Record<string,string|number>={})=>runCalculation(calc.id,mode.id,input(p));
const n=(r:Result,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<.00001,`${a} != ${b}`);
const fixture={price:200000,loan:180000,rate:0,years:30,closing:4000,repairs:1000,initial_reserve:5000,rentals:JSON.stringify([{name:'Other unit',rent:1200}]),vacancy:5,other_income:0,mortgage_insurance:100,tax:300,insurance:100,hoa:0,utilities:100,maintenance:100,capital:50,management:0,other_costs:0,current_rent:1500};
test('House hacking independently reconciles cash, tenant rent and zero-rate monthly cost',()=>{
 const r=run(fixture);for(const [label,value] of Object.entries({'Scheduled monthly mortgage P&I':500,'Total monthly housing costs before rent':1250,'Effective monthly tenant rent':1140,'Monthly net housing cash cost':110,'Monthly budget difference versus renting':1390,'Initial cash required':30000,'First-payment principal reduction (not cash income)':500,'Annualized budget difference versus renting':16680}))close(n(r,label),value);
 close(Number(r.rows!.at(-1)![1]),110);assert.equal(r.additionalTables!.length,3);
});
test('House hacking uses an independent annuity benchmark for default mortgage and principal',()=>{
 const r=run(),i=.065/12,a=360000*i/(1-(1+i)**-360);close(n(r,'Scheduled monthly mortgage P&I'),a);close(n(r,'Monthly net housing cash cost'),a+1250-1425);close(n(r,'First-payment principal reduction (not cash income)'),a-360000*i);
});
test('House hacking models only explicitly entered tenant rooms without imputed owner rent',()=>{
 const rooms=JSON.stringify([{name:'Room A',rent:700},{name:'Room B',rent:500}]),r=run({...fixture,arrangement:'Rooms in a shared home',rentals:rooms});close(n(r,'Rented spaces entered (owner excluded)'),2);close(n(r,'Effective monthly tenant rent'),1140);close(n(r,'Monthly net housing cash cost'),110);assert.equal(r.additionalTables![1].rows.length,2);
});
test('House hacking empty rent list retains full owner cost with zero tenants',()=>{
 const r=run({...fixture,rentals:'[]'});close(n(r,'Effective monthly tenant rent'),0);close(n(r,'Monthly net housing cash cost'),1250);close(n(r,'Rented spaces entered (owner excluded)'),0);
});
test('House hacking vacancy applies to tenant rent but not already-net other income',()=>{
 const r=run({...fixture,vacancy:100,other_income:200});close(n(r,'Effective monthly tenant rent'),0);close(n(r,'Monthly net housing cash cost'),1050);assert.match(r.metrics.at(-1)!.displayValue!,/Not attainable/);close(n(run({...fixture,vacancy:0}),'Monthly net housing cash cost'),50);
});
test('House hacking break-even rent uses the same loss rate and avoids impossible rent at 100%',()=>{
 close(n(run(fixture),'Scheduled rent needed to cover housing budget'),1250/.95);close(n(run({...fixture,vacancy:100,other_income:1300}),'Scheduled rent needed to cover housing budget'),0);
});
test('House hacking permits a cash surplus without adding equity reduction back to income',()=>{
 const r=run({...fixture,rentals:JSON.stringify([{name:'Unit',rent:2000}]),vacancy:0});close(n(r,'Monthly net housing cash cost'),-750);close(n(r,'Monthly budget difference versus renting'),2250);close(n(r,'First-payment principal reduction (not cash income)'),500);
});
test('House hacking separates initial reserves and repairs from ongoing costs',()=>{
 const a=run(fixture),b=run({...fixture,initial_reserve:9000,repairs:3000,closing:5000});close(n(b,'Initial cash required')-n(a,'Initial cash required'),7000);close(n(b,'Monthly net housing cash cost'),110);const c=run({...fixture,capital:100});close(n(c,'Initial cash required'),30000);close(n(c,'Monthly net housing cash cost'),160);
});
test('House hacking cash purchase has no loan payment or manually entered mortgage insurance',()=>{
 const r=run({...fixture,loan:0});close(n(r,'Scheduled monthly mortgage P&I'),0);close(n(r,'First-payment principal reduction (not cash income)'),0);close(n(r,'Total monthly housing costs before rent'),650);close(Number(r.rows!.find(row=>row[0]==='Mortgage insurance')![1]),0);close(n(r,'Initial cash required'),210000);
});
test('House hacking zero housing costs has no fabricated percentage coverage',()=>{
 const r=run({...fixture,loan:0,mortgage_insurance:0,tax:0,insurance:0,utilities:0,maintenance:0,capital:0});assert.match(r.metrics.find(m=>m.label==='Housing costs covered by entered net income')!.displayValue!,/Not applicable/);
});
test('House hacking loss sensitivity reconciles exact baseline and complete rent loss',()=>{
 const r=run(fixture),rows=r.additionalTables![2].rows;assert.deepEqual(rows.map(row=>row[0]),[0,5,10,20,100]);close(Number(rows[1][2]),110);close(Number(rows.at(-1)![2]),1250);close(Number(rows.at(-1)![3]),250);
});
test('House hacking annualization is a monthly snapshot even for a short loan',()=>{
 const r=run({...fixture,years:1/12});close(n(r,'Annualized housing cash cost'),n(r,'Monthly net housing cash cost')*12);assert.ok(r.notes!.some(note=>note.includes('do not simulate actual first-year')));
});
test('House hacking validates rental data and permits zero rent and ten spaces',()=>{
 assert.equal(rentalSpaces(JSON.stringify(Array.from({length:10},(_,i)=>({name:'Space '+i,rent:0})))).length,10);assert.equal(rentalSpaces('[{"name":" A ","rent":0}]')[0].name,'A');for(const raw of ['bad','{}','[null]','[[1]]','[{"name":"","rent":1}]','[{"name":"A","rent":"100"}]','[{"name":"A","rent":-1}]','[{"name":"A","rent":1e10}]',JSON.stringify([{name:'a'.repeat(41),rent:1}]),JSON.stringify(Array.from({length:11},()=>({name:'Space',rent:1})))])assert.throws(()=>rentalSpaces(raw));
});
test('House hacking rejects unsupported financial inputs and blank values',()=>{
 for(const p of [{price:0},{loan:400001},{loan:-1},{years:0},{years:51},{years:1.01},{rate:26},{rate:-1},{vacancy:101},{vacancy:-1},{tax:-1},{tax:''},{other_income:'NaN'},{current_rent:1e10},{arrangement:'Other'}] as Record<string,string|number>[])assert.throws(()=>houseHackingPlan(input(p)));
});
test('House hacking lazy client and both original worked examples match the pure engine',async()=>{
 assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,input()),run());for(const e of guides[calc.id].examples)close(n(run(e.values),e.expected.label),e.expected.value);assert.equal(guides[calc.id].questions.length,11);
});
test('House hacking has one canonical calculator and coherent property links without invented ratings',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/house-hacking-calculator').length,1);assert.equal(calculatorCategory(calc.id)!.id,'mortgage-housing');for(const id of ['mortgage','rent-vs-buy','rental-property'])assert.ok(relatedCalculatorIds[id].includes(calc.id));const schema=JSON.stringify(calculatorSchema(calc,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);
});
