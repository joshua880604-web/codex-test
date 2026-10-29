import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
import {calculatorScope} from '../src/lib/calculator-scope';
import {workspaceMetrics} from '../src/lib/workspace-layout';
import rules from '../src/lib/official-rules.json';
const calc=calculators.find(c=>c.id==='rmd')!,mode=calc.modes[0];
const input=(patch:Record<string,string>={})=>({...defaults(mode),birth:'1953',year:'2026',balance:'265000',return:'0',projection:'2',...patch});
const run=(patch:Record<string,string>={})=>runCalculation('rmd','annual',input(patch));
const n=(r:ReturnType<typeof run>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('RMD annual minimum, percentage, remaining gross amount and monthly equivalent reconcile',()=>{
 const r=run({taken:'7000'});assert.equal(n(r,'Annual RMD'),10000);assert.equal(n(r,'Remaining RMD for selected year'),3000);close(n(r,'Monthly budgeting equivalent of annual RMD'),10000/12);close(n(r,'RMD percentage of prior year-end balance'),100/26.5);assert.equal(Number(r.rows![0][5]),10000);assert.equal(Number(r.rows![0][6]),255000);assert.equal(Number(r.rows![1][2]),255000);
 assert.equal(workspaceMetrics('rmd','annual',r).primary.label,'Annual RMD');
});
test('Excess selected-year distributions reduce next balance but are never credited against next RMD',()=>{
 const r=run({taken:'12000'});assert.equal(n(r,'Remaining RMD for selected year'),0);assert.equal(n(r,'Amount entered above selected year’s RMD'),2000);assert.equal(Number(r.rows![0][5]),12000);assert.equal(Number(r.rows![1][2]),253000);close(Number(r.rows![1][4]),253000/25.5);
});
test('Historical share without new credited-distribution field preserves prior projection math',()=>{
 const old:Record<string,string>=input({birth:'1951',balance:'300000',return:'5'});delete old.taken;const r=runCalculation('rmd','annual',old);
 close(Number(r.rows![1][2]),300000*1.05-300000/24.6);close(Number(r.rows![1][4]),(300000*1.05-300000/24.6)/23.7);
});
test('RMD start age for younger cohorts and strict whole-year inputs',()=>{
 const r=run({birth:'1960',year:'2034'});assert.equal(n(r,'Required starting age'),75);assert.equal(n(r,'Annual RMD'),0);assert.equal(r.rows,undefined);
 assert.match(calculatorScope('rmd','annual',input({birth:'1959'}))!,/1959.*planning assumption/);
 assert.ok(n(run({birth:'1960',year:'2035'}),'Annual RMD')>0);
 for(const patch of [{projection:'1.5'},{projection:'101'},{birth:'2030'},{taken:'-1'}])assert.throws(()=>run(Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))));
 assert.throws(()=>run({taken:'300000'}),/insufficient funds/);
});
test('Uniform reference factors and joint spouse computation stay distinct',()=>{
 assert.equal(rules.rmd_uniform_lifetime.divisors['73'],26.5);assert.equal(rules.rmd_uniform_lifetime.divisors['75'],24.6);assert.equal(rules.rmd_uniform_lifetime.divisors['80'],20.2);
 const joint=run({birth:'1951',spouse:'Yes',spouse_birth:'1962',balance:'500000',taken:'10000'});close(n(joint,'Annual RMD'),500000/25.3);close(n(joint,'Remaining RMD for selected year'),500000/25.3-10000);
 assert.throws(()=>run({birth:'1951',spouse:'Yes',spouse_birth:'1961'}),/more than 10/);
});
test('RMD examples remain executable and lazy browser mode matches server calculation',async()=>{
 assert.deepEqual(await runClientCalculation('rmd',calc.category,'annual',input({taken:'7000'})),run({taken:'7000'}));
 for(const e of guides.rmd.examples){const r=runCalculation('rmd','annual',{...defaults(mode),...Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)]))});assert.ok(Math.abs(n(r,e.expected.label)-e.expected.value)<=(e.expected.tolerance??.005));}
 assert.equal(guides.rmd.questions.length,13);
});
