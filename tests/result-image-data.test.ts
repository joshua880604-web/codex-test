import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { imageMetrics, imageInputs, imageDetails } from '../src/lib/result-image-data';
import { formatMetric } from '../src/lib/sharing';
import type { Field, Result } from '../src/lib/types';

test('PNG retains every default result across calculators without changing values or the source result', () => {
  for (const calc of calculators.filter(c => !c.directory)) for (const mode of calc.modes) {
    const result = runCalculation(calc.id, mode.id, defaults(mode)), snapshot = structuredClone(result);
    const image = imageMetrics(calc.id, mode.id, result);
    const expected = calc.id === 'marriage-tax' ? result.metrics.slice(0, -1) : result.metrics;
    for (const metric of expected) assert.ok(image.some(m => m.label === metric.label && formatMetric(m) === formatMetric(metric)), calc.id + '/' + mode.id + ': ' + metric.label);
    assert.deepEqual(result, snapshot);
  }
});

test('marriage savings keep their existing positive savings label instead of duplicating a signed penalty', () => {
  const result: Result = { metrics: [{ label: 'Single taxes', value: 1000, format: 'money' }, { label: 'Marriage penalty / negative bonus', value: -200, format: 'money' }] };
  const image = imageMetrics('marriage-tax', 'compare', result);
  assert.equal(image[0].label, 'Estimated annual tax savings after marriage');
  assert.equal(image[0].value, 200); assert.equal(image.length, 2);
});

test('input details preserve decimal precision, dates, zeroes and selected units', () => {
  const fields: Field[] = [
    { key: 'down', label: 'Down payment', value: 0, unit: '$ or %' },
    { key: 'down_unit', label: 'Down payment unit', value: 'Percent', type: 'select' },
    { key: 'rate', label: 'Annual rate', value: 0, unit: '%' },
    { key: 'start', label: 'Start date', value: '', type: 'date' },
    { key: 'blank', label: 'Not entered', value: '' },
    { key: 'verified_rate', label: 'Internal', value: 'secret' },
  ];
  const values = { down: '12345.123456789', down_unit: 'Dollars', rate: '0', start: '2024-02-29', blank: '', verified_rate: 'secret' };
  assert.deepEqual(imageInputs(fields, values), [
    { label: 'Down payment', value: '$12,345.123456789' },
    { label: 'Annual rate', value: '0%' }, { label: 'Start date', value: '2024-02-29' },
  ]);
  assert.equal(imageInputs(fields, { ...values, down: '4', down_unit: 'Percent' })[0].value, '4%');
  assert.equal(imageInputs(fields, { ...values, down: '1.2', down_unit: 'Percent of home value' })[0].value, '1.2% of home value');
});

test('PNG uses only the current displayed field set, excluding hidden draft amounts', () => {
  const fields: Field[] = [{ key: 'loan_amount', label: 'Current balance', value: 0, unit: '$' }];
  assert.deepEqual(imageInputs(fields, { loan_amount: '150000', price: '999999', down: '42' }), [{ label: 'Current balance', value: '$150,000' }]);
});

test('long entry lists are explicitly summarized instead of silently clipping rows or exposing an unbounded report', () => {
  const inputs = imageInputs([{ key: 'flows', label: 'Cash flows', value: '', type: 'textarea' }], { flows: '0,-1000\n1,100\n2,200\n3,300\n4,500' });
  assert.equal(inputs[0].value, '5 entered rows; full list not included.'); assert.equal(inputs[0].summarized, true);
});

test('input opt-in is independent of result/chart content and uses the current mode formula', () => {
  const calc = calculators.find(c => c.id === 'mortgage')!, mode = calc.modes[0], values = defaults(mode), result = runCalculation(calc.id, mode.id, values);
  const without = imageDetails(calc.id, mode, values, result, mode.fields, false);
  assert.deepEqual(without.inputs, []); assert.equal(without.formula, mode.formula);
  assert.equal(without.trend!.points.at(-1)!.balance, result.rows!.at(-1)![5]);
  assert.match(without.scope!, /PMI/);
  assert.ok(imageDetails(calc.id, mode, values, result, mode.fields, true).inputs.length > 0);
});

test('tax year scope is retained and tools without schedules receive no invented chart', () => {
  const calc = calculators.find(c => c.id === 'income-tax')!, mode = calc.modes[0], values = { ...defaults(mode), year: '2025' };
  const details = imageDetails(calc.id, mode, values, runCalculation(calc.id, mode.id, values), mode.fields, false);
  assert.match(details.scope!, /2025/); assert.equal(details.trend, null);
});
