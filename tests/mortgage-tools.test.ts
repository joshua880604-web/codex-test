import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { originalPmiMilestones, mortgageMonthDate } from '../src/lib/calculators/mortgage-tools';
import { resultTrend } from '../src/lib/result-trend';
import { directorySearch } from '../src/lib/directory';
import { calculators as catalog } from '../src/lib/catalog';
import type { Result } from '../src/lib/types';
const run = (id: string, mode: string, extra: Partial<Record<string, string | number>> = {}) => {
  const m = calculators.find(c => c.id === id)!.modes.find(m => m.id === mode)!;
  return runCalculation(id, mode, { ...defaults(m), ...Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])) });
};
const val = (r: Result, label: string) => { const m = r.metrics.find(m => m.label === label); assert.ok(m, label); return m.value; };
const close = (a: number, b: number, tolerance = .00001) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const existing = { original_value: 200000, original_loan: 180000, balance: 156000, rate: 0, years: 30, elapsed: 48, monthly_pmi: 75, current: 'Yes' };

test('PMI at 6% down uses the dated conventional credit/LTV table, not FHA MIP', () => {
  const r = run('pmi', 'estimate', { price: 400000, down: 6, credit: '740-759' });
  close(val(r, 'Original loan amount'), 376000); close(val(r, 'Original loan-to-value ratio'), 94);
  close(val(r, 'Illustrative annual PMI rate'), .53); close(val(r, 'Initial monthly PMI'), 166.06666666666666);
  assert.match(r.notes!.join(' '), /not a live quote or a government-set fee/);
});
test('PMI original LTV uses lower purchase appraisal, including a 20% price down payment', () => {
  const r = run('pmi', 'estimate', { price: 400000, down: 20, appraisal: 350000 });
  close(val(r, 'Original value for PMI'), 350000); close(val(r, 'Original loan-to-value ratio'), 320000 / 350000 * 100);
  assert.ok(val(r, 'Initial monthly PMI') > 0);
});
test('PMI 80% boundary and fully paid purchase produce zero premium without a fake schedule', () => {
  for (const down of [20, 30, 100]) close(val(run('pmi', 'estimate', { down }), 'Initial monthly PMI'), 0);
  assert.ok(val(run('pmi', 'estimate', { down: 19.99999 }), 'Initial monthly PMI') > 0);
  assert.equal(run('pmi', 'estimate', { down: 100 }).rows, undefined);
  assert.throws(() => run('pmi', 'estimate', { down: 101 }));
  assert.throws(() => run('pmi', 'estimate', { down: 2 }), /97%/);
});
test('zero-interest quoted PMI has independently hand-counted 80%/78% payment conventions', () => {
  const r = run('pmi', 'quote', { price: 200000, down: 10, annual_pmi: .5, rate: 0, years: 30 });
  close(val(r, 'Initial monthly PMI'), 75); close(val(r, '80% request benchmark'), 40); close(val(r, 'Scheduled 78% benchmark'), 48);
  close(val(r, 'PMI if 80% request is approved'), 3000); close(val(r, 'PMI using automatic termination only'), 3525);
  close(val(r, 'Potential PMI savings from requesting'), 525);
  assert.equal(r.rows![39][5], 75); assert.equal(r.rows![40][5], 0); assert.equal(r.rows![46][6], 75); assert.equal(r.rows![47][6], 0);
});
test('extra principal moves requested 80% forward but never rewrites scheduled 78%', () => {
  const a = run('pmi', 'quote', { price: 200000, down: 10, annual_pmi: .5, rate: 0, extra: 0 });
  const b = run('pmi', 'quote', { price: 200000, down: 10, annual_pmi: .5, rate: 0, extra: 500 });
  close(val(b, '80% request benchmark'), 20); close(val(b, 'Scheduled 78% benchmark'), val(a, 'Scheduled 78% benchmark'));
  close(val(b, 'PMI if 80% request is approved'), 1500);
  const paid = run('pmi', 'quote', { price: 200000, down: 10, annual_pmi: .5, rate: 0, extra: 179500 });
  assert.equal(paid.rows!.length, 1); close(val(paid, 'PMI using automatic termination only'), 75);
});
test('automatic insurer renewal cap starts on payment 121; an entered quote is not capped', () => {
  const values = { down: 3, rate: 20, years: 40, credit: '620-639' };
  const estimated = run('pmi', 'estimate', values), quoted = run('pmi', 'quote', { ...values, annual_pmi: 1.86 });
  close(Number(estimated.rows![119][6]), 388000 * .0186 / 12); close(Number(estimated.rows![120][6]), 388000 * .002 / 12);
  close(Number(quoted.rows![120][6]), 388000 * .0186 / 12);
});
test('PMI midpoint is the following payment month, and can be earlier than scheduled 78%', () => {
  const m = originalPmiMilestones(388000, 400000, 20, 360);
  assert.ok(m.automatic78 > 181); assert.equal(m.automaticStop, 181);
  for (const elapsed of [180, 181]) {
    const r = run('pmi', 'cancellation', { original_value: 400000, original_loan: 388000, rate: 20, years: 30, elapsed, balance: m.rows[elapsed - 1].balance, current: 'Yes' });
    close(val(r, 'Modeled current monthly PMI'), elapsed === 180 ? 150 : 0);
  }
});
test('past-due payments keep quoted PMI active after automatic benchmarks', () => {
  close(val(run('pmi', 'cancellation', { ...existing, current: 'No' }), 'Modeled current monthly PMI'), 75);
  close(val(run('pmi', 'cancellation', existing), 'Modeled current monthly PMI'), 0);
  assert.match(run('pmi', 'cancellation', { ...existing, current: 'No' }).metrics.find(m => m.label === 'Cancellation status')!.displayValue!, /Bring payments current/);
});
test('current appreciation never substitutes for original value in cancellation checks', () => {
  const a = run('pmi', 'cancellation', { ...existing, elapsed: 10, balance: 330000, original_value: 400000, original_loan: 380000, current_value: 500000 });
  close(val(a, 'LTV using original value'), 82.5); close(val(a, 'LTV using current value (informational)'), 66);
  close(val(a, 'Modeled current monthly PMI'), 75); assert.match(a.metrics.find(m => m.label === 'Cancellation status')!.displayValue!, /not yet reached/);
});
test('value decline blocks a requested-cancellation claim but not scheduled automatic termination', () => {
  const r = run('pmi', 'cancellation', { ...existing, elapsed: 10, balance: 160000, current_value: 100000, conditions: 'Confirmed: good history, no junior liens, value not declined' });
  assert.match(r.metrics.find(m => m.label === 'Cancellation status')!.displayValue!, /Value decline/);
  close(val(run('pmi', 'cancellation', { ...existing, current_value: 100000 }), 'Modeled current monthly PMI'), 0);
});
test('reaching 80% is a written request opportunity, never an assertion of completed cancellation', () => {
  const r = run('pmi', 'cancellation', { ...existing, elapsed: 10, balance: 160000, conditions: 'Confirmed: good history, no junior liens, value not declined' });
  close(val(r, 'Modeled current monthly PMI'), 75); assert.match(r.metrics.find(m => m.label === 'Cancellation status')!.displayValue!, /written approval still required/);
});
test('existing loan inputs reject fractional counts, a capitalized balance and inconsistent current schedule', () => {
  for (const values of [{ elapsed: 1.5 }, { elapsed: 360 }, { balance: 999999 }, { elapsed: 300, balance: 370000 }]) assert.throws(() => run('pmi', 'cancellation', values));
  close(val(run('pmi', 'cancellation', { balance: 0 }), 'Modeled current monthly PMI'), 0);
  for (const values of [{ appraisal: 0 }, { years: 30.5 }, { first_due: '2026-02-30' }]) assert.throws(() => run('pmi', 'estimate', values));
});
test('PMI annual tables preserve each alternative premium and exact ending balance', () => {
  const r = run('pmi', 'quote');
  for (const column of [1, 2, 3, 5, 6]) close(r.rows!.reduce((s, x) => s + Number(x[column]), 0), r.annualRows!.reduce((s, x) => s + Number(x[column]), 0), .001);
  assert.equal(r.rows!.at(-1)![4], 0); assert.equal(r.annualRows!.at(-1)![4], 0);
});
test('monthly dates retain an end-of-month anchor without timezone rollover', () => {
  assert.equal(mortgageMonthDate('2024-01-31', 1), '2024-02-29'); assert.equal(mortgageMonthDate('2024-01-31', 2), '2024-03-31');
});

test('biweekly zero-interest model has 26 budgeted halves and 24 actual payoff payments', () => {
  const r = run('biweekly-mortgage', 'biweekly', { principal: 12000, rate: 0, years: 1 });
  close(val(r, 'Standard monthly payment'), 1000); close(val(r, 'Biweekly payment'), 500); close(val(r, 'Annual biweekly payment budget'), 13000);
  close(val(r, 'Number of biweekly payments'), 24); close(val(r, 'Biweekly total interest'), 0); close(val(r, 'Years to payoff with biweekly payments'), 24 / 26);
});
test('biweekly P&I and payoff agree with independent closed-form amortization', () => {
  const r = run('biweekly-mortgage', 'biweekly', { principal: 100000, rate: 6, years: 30 });
  close(val(r, 'Standard monthly payment'), 599.5505251527524);
  const q = 599.5505251527524 / 2, rate = .06 / 26, periods = Math.ceil(-Math.log1p(-100000 * rate / q) / Math.log1p(rate));
  const prior = 100000 * (1 + rate) ** (periods - 1) - q * ((1 + rate) ** (periods - 1) - 1) / rate;
  close(val(r, 'Biweekly total interest'), q * (periods - 1) + prior * (1 + rate) - 100000, .005);
  close(val(r, 'Number of biweekly payments'), periods);
});
test('equal-budget comparison uses the same annual outlay and caps the final payment', () => {
  const r = run('biweekly-mortgage', 'biweekly', { extra: 50 });
  close(val(r, 'Monthly payment with the same annual budget') * 12, val(r, 'Biweekly payment') * 26);
  assert.ok(Number(r.rows!.at(-1)![1]) <= val(r, 'Biweekly payment') + .001);
  close(r.rows!.reduce((s, x) => s + Number(x[3]), 0), 300000, .001); assert.equal(r.rows!.at(-1)![4], 0);
  assert.equal(r.annualRows!.length, Math.ceil(r.rows!.length / 26));
});
test('biweekly remaining months accept short terms but reject zero, fractional or excessive durations', () => {
  assert.ok(run('biweekly-mortgage', 'biweekly', { years: 0, months: 1 }).rows!.length > 0);
  for (const x of [{ years: 0, months: 0 }, { years: 1.5 }, { months: 1.5 }, { months: 12 }, { years: 40, months: 1 }, { extra: -1 }]) assert.throws(() => run('biweekly-mortgage', 'biweekly', x));
});

test('discount points without a rate benefit never falsely break even', () => {
  const r = run('discount-points', 'compare', { principal: 12000, years: 2, rate_a: 0, rate_b: 0, points_a: 0, points_b: 1, hold: 12 });
  close(val(r, 'Additional upfront cost for B'), 120); close(val(r, 'Net borrowing-cost savings at horizon (B vs A)'), -120);
  assert.equal(r.metrics.find(m => m.label === 'First net-cost break-even month')!.displayValue, 'Not reached within loan term');
});
test('CFPB rate/points example costs $675 and agrees with independent 60-month balance formulas', () => {
  const r = run('discount-points', 'compare', { principal: 180000, years: 30, rate_a: 5, points_a: 0, rate_b: 4.875, points_b: .375, hold: 60 });
  close(val(r, 'Offer B points or credit amount'), 675);
  const p = 180000, ra = .05 / 12, rb = .04875 / 12, pa = p * ra / (1 - (1 + ra) ** -360), pb = p * rb / (1 - (1 + rb) ** -360);
  const balance = (rate: number, pay: number) => p * (1 + rate) ** 60 - pay * ((1 + rate) ** 60 - 1) / rate;
  const ba = balance(ra, pa), bb = balance(rb, pb);
  close(val(r, 'Net cash-flow savings at horizon'), 60 * (pa - pb) - 675, .005);
  close(val(r, 'Balance advantage of B at horizon'), ba - bb, .005);
  close(val(r, 'Net borrowing-cost savings at horizon (B vs A)'), 60 * (pa - pb) + ba - bb - 675, .005);
});
test('points net cost equals cash-flow advantage plus the loan-balance advantage in every month', () => {
  const r = run('discount-points', 'compare');
  for (const row of r.rows!) close(Number(row[3]), Number(row[1]) + Number(row[2]), .00001);
  const chosen = r.rows![59]; close(val(r, 'Net borrowing-cost savings at horizon (B vs A)'), Number(chosen[3]));
  assert.ok(val(r, 'First net-cost break-even month') < val(r, 'First cash-flow break-even month'));
});
test('holding period zero compares upfront costs only; credits can start ahead and later lose', () => {
  close(val(run('discount-points', 'compare', { hold: 0 }), 'Net borrowing-cost savings at horizon (B vs A)'), -3000);
  const credit = run('discount-points', 'compare', { rate_a: 6, points_a: 0, rate_b: 7, points_b: -1, hold: 360 });
  close(val(credit, 'First net-cost break-even month'), 0); assert.ok(val(credit, 'Lifetime savings after upfront costs') < 0);
  assert.match(credit.notes!.join(' '), /start ahead and later become more expensive/);
});
test('points compare actual rates independently; swapping offers reverses net costs', () => {
  const a = run('discount-points', 'compare', { rate_a: 6, points_a: 0, rate_b: 5.75, points_b: 1, fees_b: 100, fees_a: 50 });
  const b = run('discount-points', 'compare', { rate_a: 5.75, points_a: 1, rate_b: 6, points_b: 0, fees_b: 50, fees_a: 100 });
  close(val(a, 'Net borrowing-cost savings at horizon (B vs A)'), -val(b, 'Net borrowing-cost savings at horizon (B vs A)'));
  for (const x of [{ hold: 1.5 }, { years: 1, hold: 13 }, { hold: -1 }, { points_b: 21 }]) assert.throws(() => run('discount-points', 'compare', x));
});
test('all new default charts use their actual schedule endpoint and the points chart starts with upfront cost', () => {
  for (const id of ['pmi', 'biweekly-mortgage', 'discount-points']) for (const m of calculators.find(c => c.id === id)!.modes) {
    const values = defaults(m), result = runCalculation(id, m.id, values), trend = resultTrend(id, m.id, values, result)!;
    assert.ok(trend); const index = id === 'discount-points' ? 3 : 4;
    close(trend.points.at(-1)!.balance, Number(result.rows!.at(-1)![index]));
    if (id === 'discount-points') close(trend.points[0].balance, -val(result, 'Additional upfront cost for B'));
  }
});
test('dedicated search names own the new pages and cancellation intent opens the right mode', () => {
  for (const [q, id] of [['PMI calculator', 'pmi'], ['private mortgage insurance', 'pmi'], ['biweekly mortgage calculator', 'biweekly-mortgage'], ['bi-weekly payment', 'biweekly-mortgage'], ['mortgage points', 'discount-points']]) {
    assert.equal(directorySearch(catalog, q)[0].tool.id, id);
  }
  assert.match(directorySearch(catalog, 'PMI removal')[0].href, /mode=cancellation/);
});
