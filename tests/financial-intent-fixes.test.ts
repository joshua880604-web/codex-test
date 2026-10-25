import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { calendarDate } from '../src/lib/calendar-date';
import { sharedInputs } from '../src/lib/sharing';
import { calculatorScope } from '../src/lib/calculator-scope';

const compound=calculators.find(c=>c.id==='compound-interest')!;
const dated=calculators.find(c=>c.id==='average-return')!.modes.find(m=>m.id==='cashflows')!;
const run=(cashflows:string)=>runCalculation('average-return','cashflows',{...defaults(dated),cashflows});
test('Scope labels follow the selected tax year and the actual 401k task',()=>{
 assert.match(calculatorScope('income-tax','federal',{year:'2025'})!,/tax year 2025/);
 assert.match(calculatorScope('income-tax','federal',{year:'2026'})!,/tax year 2026/);
 assert.match(calculatorScope('401k','projection',{})!,/2026.*catch-up/);
 assert.match(calculatorScope('401k','early',{})!,/entered tax rates.*10%/);
 assert.doesNotMatch(calculatorScope('401k','early',{})!,/contribution.*limits/);
});
test('Compound growth is the bare-page default while rate conversion stays addressable',()=>{
 assert.equal(compound.modes[0].id,'growth');assert.deepEqual(compound.modes.map(m=>m.id).sort(),['conversion','growth']);
 for(const query of ['?mode=conversion&rate=5&from=Monthly&to=Annually','?rate=5&from=Monthly&to=Annually']){
  const restored=sharedInputs(compound,query,'')!;assert.equal(restored.mode.id,'conversion');const result=runCalculation(compound.id,restored.mode.id,restored.values);assert.ok(Math.abs(result.metrics[0].value-5.1161897881733)<1e-10);
 }
 assert.equal(sharedInputs(compound,'?mode=growth&monthly=100','')!.values.monthly,'100');
});
test('Calendar validation distinguishes actual leap days from normalized impossible dates',()=>{
 assert.equal(calendarDate('2024-02-29'),Date.UTC(2024,1,29));assert.ok(Number.isFinite(calendarDate('0001-01-01')));assert.ok(Number.isFinite(calendarDate('9999-12-31')));
 for(const value of ['2026-02-30','2025-02-29','1900-02-29','2026-04-31','2026-13-01','2026-00-01','2026-01-00','0000-01-01','2026/01/01','2026-1-01','2026-01-01T00:00:00Z'])assert.throws(()=>calendarDate(value),/YYYY-MM-DD/);
});
test('Dated cash-flow errors identify the original textarea row and reject malformed amounts',()=>{
 assert.throws(()=>run('\n2025-01-01, -1000\n2026-02-30, 1100\n'),/Row 3:.*real.*date/);
 assert.throws(()=>run('2025-01-01, -1000\n2026-01-01, Infinity'),/Row 2:/);
 assert.throws(()=>run('2025-01-01, -1000\n\n2026-01-01, 1100'),/Row 2:/);
 assert.throws(()=>run('2025-01-01, -1000\n2026-01-01, 1100, extra'),/Row 2:/);
});
test('Valid dated returns preserve actual/365 timing, whitespace and chronological sorting',()=>{
 for(const flows of ['2025-01-01, -1000\n2026-01-01, 1100','\r\n 2026-01-01, 1100\r\n2025-01-01, -1000 \r\n','2024-02-29, -1000\n2025-02-28, 1100'])assert.ok(Math.abs(run(flows).metrics[0].value-10)<1e-6);
 const expected=(1.1**(365/366)-1)*100;assert.ok(Math.abs(run('2024-02-29, -1000\n2025-03-01, 1100').metrics[0].value-expected)<1e-6);
});
