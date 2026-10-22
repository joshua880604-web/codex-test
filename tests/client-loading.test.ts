import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
test('Lazy client dispatch reaches every mode, including isolated CPI, FX and RMD tools',async()=>{
 for(const calc of calculators.filter(c=>!c.directory))for(const mode of calc.modes){
  const values=defaults(mode);let expected;
  try{expected=runCalculation(calc.id,mode.id,values);}catch(error){await assert.rejects(()=>runClientCalculation(calc.id,calc.category,mode.id,values),{message:(error as Error).message});continue;}
  assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,values),expected,calc.id+'/'+mode.id);
 }
});
test('Lazy client dispatch preserves boundary data lookups and ordinary validation failures',async()=>{
 for(const [id,mode,changes] of [
  ['inflation','historical',{start_year:'1913',end_year:'2025'}],
  ['inflation','forward',{rate:'-2'}],
  ['currency','snapshot',{from:'JPY',to:'EUR',popular:'No'}],
  ['rmd','annual',{birth:'1950',year:'2026',spouse:'Yes',spouse_birth:'1965'}],
  ['401k','early',{withdrawal:'50000'}],
  ['vat','any-two',{net:'100',gross:'',tax:'',rate:'20'}],
 ] as [string,string,Record<string,string>][]){
  const calc=calculators.find(c=>c.id===id)!,m=calc.modes.find(m=>m.id===mode)!,values={...defaults(m),...changes};
  assert.deepEqual(await runClientCalculation(id,calc.category,mode,values),runCalculation(id,mode,values),id);
 }
 await assert.rejects(()=>runClientCalculation('mortgage','Unknown','monthly',{}),/Unknown calculator category/);
 await assert.rejects(()=>runClientCalculation('missing','Other','missing',{}),/Unknown calculator/);
 await assert.rejects(()=>runClientCalculation('mortgage','Mortgage and Real Estate','missing',{}),/Unknown calculator mode/);
});
