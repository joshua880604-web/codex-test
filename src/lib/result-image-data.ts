import type { Field, Metric, Mode, Result, Values } from './types';
import { summaryMetrics } from './sharing';
import { calculatorScope } from './calculator-scope';
import { resultTrend, type ResultTrend } from './result-trend';

export type ImageInput = { label: string; value: string; summarized?: boolean };
export type ImageDetails = { inputs: ImageInput[]; includeInputs: boolean; formula: string; scope?: string; trend: ResultTrend | null; layout?:'summary'|'detailed'; inputHeading?:string; disclosure?:'key'|'all'|'none' };

// Keep the familiar primary/highlights, then retain every remaining result.
// Marriage's signed penalty is represented by its existing positive savings/cost label.
export function imageMetrics(id: string, mode: string, result: Result): Metric[] {
  const first = summaryMetrics(id, result, mode);
  const key = (m: Metric) => JSON.stringify([m.label, m.value, m.displayValue, m.format, m.currency, m.digits]);
  const seen = new Set(first.map(key));
  const rest = id === 'marriage-tax' ? result.metrics.slice(0, -1) : result.metrics;
  return [...first, ...rest.filter(m => { const k = key(m); if (seen.has(k)) return false; seen.add(k); return true; })];
}

function grouped(raw: string) {
  if (!/^[-+]?\d+(?:\.\d+)?$/.test(raw)) return raw;
  const [integer, fraction] = raw.split('.');
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction === undefined ? '' : '.' + fraction);
}

export function imageInputs(fields: Field[], values: Values): ImageInput[] {
  const keys = new Set(fields.map(f => f.key));
  return fields.filter(f => f.key !== 'verified_rate' && values[f.key]?.trim() &&
    !(f.key.endsWith('_unit') && keys.has(f.key.slice(0, -5)))).map(f => {
    const raw = values[f.key].trim(), rows = raw.split(/\r?\n/).filter(line => line.trim()).length;
    if (raw.length > 240 || rows > 3) return { label: f.label, value: rows > 1 ? `${rows} entered rows; full list not included.` : `${raw.length} entered characters; full text not included.`, summarized: true };
    const unit = keys.has(f.key + '_unit') ? values[f.key + '_unit'] : f.unit;
    const text = ['year','start_year'].includes(f.key) ? raw : grouped(raw);
    const value = unit === '$' || unit === 'Dollars' ? '$' + text
      : unit === '%' || unit === 'Percent' ? text + '%'
      : unit?.startsWith('Percent of ') ? text + '% of ' + unit.slice(11)
      : unit ? text + ' ' + unit : text;
    return { label: f.label, value };
  });
}

export function imageDetails(id: string, mode: Mode, values: Values, result: Result, fields: Field[], includeInputs: boolean): ImageDetails {
  return {
    inputs: includeInputs ? imageInputs(fields, values) : [], includeInputs,
    formula: mode.formula, scope: calculatorScope(id, mode.id, values),
    trend: resultTrend(id, mode.id, values, result),
  };
}
