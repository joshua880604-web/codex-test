import type { Field } from './types';
const basic = new Set(['wages', 'children', 'dependents']);
const income = new Set(['business', 'interest', 'exempt_interest', 'dividends', 'qualified', 'short', 'long', 'social', 'other']);
const deductions = new Set(['adjustments', 'student', 'itemized', 'salt', 'age65', 'tips', 'overtime', 'car', 'qbi']);
export const marriageSections = [
  {id:'basic', title:'Your household', description:'Enter annual wages for each person. Leave amounts at zero when they do not apply. Count each dependent only once, under the person eligible to claim them before marriage.'},
  {id:'income', title:'Other income', description:'Add business income, investment income and Social Security benefits if applicable.'},
  {id:'deductions', title:'Deductions and adjustments', description:'Standard deductions are considered automatically. Enter only eligible amounts; do not deduct the same amount twice. Check retirement contribution and deduction eligibility before entering adjustments.'},
  {id:'credits', title:'Tax credits and other adjustments', description:'Complete only applicable items. Education credit eligibility, dependent care and AMT can affect this estimate.'},
] as const;
export function marriageFieldSection(field: Field): string {
  const key=field.key.replace(/^p2_/, '');
  if (key==='year' || key==='filing1' || key==='filing2' || basic.has(key)) return 'basic';
  if (income.has(key)) return 'income';
  if (deductions.has(key)) return 'deductions';
  return 'credits';
}
