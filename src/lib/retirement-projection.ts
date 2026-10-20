import { payment } from './finance';

/** Month-end, inflation-indexed withdrawals, summarized by retirement year. */
export function retirementIncome(balance: number, annualReturn: number, inflation: number, years: number, retirementAge: number) {
  if (!Number.isFinite(balance) || balance < 0 || !Number.isFinite(annualReturn) || annualReturn <= -1 || !Number.isFinite(inflation) || inflation <= -1 || !Number.isFinite(retirementAge)) throw new Error("Invalid retirement balance, age or rate.");
  if (!Number.isInteger(years) || years < 1 || years > 100) throw new Error('Retirement duration must be a whole number of years from 1 to 100.');
  const months = years * 12;
  const rate = Math.expm1(Math.log1p(annualReturn) / 12);
  const increase = Math.expm1(Math.log1p(inflation) / 12);
  const realRate = Math.expm1((Math.log1p(annualReturn) - Math.log1p(inflation)) / 12);
  const initial = payment(balance, realRate, months) * (1 + increase);
  if (!Number.isFinite(initial)) throw new Error('Retirement withdrawal exceeds numeric limits.');
  const rows: (number | string)[][] = [];
  let opening = balance, total = 0;
  for (let year = 0; year < years; year++) {
    const yearOpening = opening;
    let growth = 0, withdrawals = 0;
    for (let month = 0; month < 12; month++) {
      const interest = opening * rate;
      const planned = initial * (1 + increase) ** (year * 12 + month);
      const available = opening + interest;
      if (planned > available + Math.max(1, balance) * 1e-8) throw new Error('Retirement schedule exceeds numerical precision for these assumptions.');
      const paid = Math.min(planned, Math.max(0, available));
      opening = Math.max(0, available - paid);
      growth += interest;withdrawals += paid;
    }
    // Remove only floating-point residue, preserving cash-flow conservation.
    if (year === years - 1 && opening < Math.max(1, balance) * 1e-8) { withdrawals += opening; opening = 0; }
    rows.push([retirementAge + year + 1, yearOpening, growth, withdrawals, opening]);total += withdrawals;
  }
  return { initial, total, rows };
}
