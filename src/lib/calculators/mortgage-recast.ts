import { tool } from './helpers';
import { payment, sum, type LoanRow } from '../finance';
import { yearlySchedule } from '../schedules';
import { num, number as n, money, metric, type Values, type Result } from '../types';

// Monthly P&I only. The lump sum is applied now, before any modeled interest.
function schedule(principal: number, rate: number, term: number, regular: number, contractual = false): LoanRow[] {
  const rows: LoanRow[] = [];
  let balance = principal;
  for (let month = 1; month <= term && balance > 1e-8; month++) {
    const interest = balance * rate;
    // For a newly amortized payment use the discounted remaining annuity. This
    // avoids amplifying floating-point balance errors over long high-rate terms.
    const closing = contractual ? month === term ? 0 : rate === 0 ? principal * (term - month) / term
      : principal * -Math.expm1(-(term - month) * Math.log1p(rate)) / -Math.expm1(-term * Math.log1p(rate)) : undefined;
    const paid = closing !== undefined ? balance - closing + interest : month === term ? balance + interest : Math.min(regular, balance + interest);
    const repaid = paid - interest;
    balance = Math.max(0, balance - repaid);
    rows.push({ period: month, payment: paid, interest, principal: repaid, balance });
  }
  return rows;
}
const interest = (rows: LoanRow[]) => sum(rows.map(row => row.interest));
const cash = (rows: LoanRow[]) => sum(rows.map(row => row.payment));
function recast(v: Values): Result {
  const principal = n(v, 'principal'), rate = n(v, 'rate') / 100 / 12;
  const term = n(v, 'years') * 12 + n(v, 'months'), lump = n(v, 'lump'), fee = n(v, 'fee');
  if (!Number.isInteger(n(v, 'years')) || !Number.isInteger(n(v, 'months')) || term < 1 || term > 480)
    throw Error('Enter a whole remaining term from 1 to 480 months.');
  if (lump >= principal) throw Error('A recast needs a remaining loan balance. Enter a lump sum below the current balance; a full payoff does not need a recast.');
  const modeled = payment(principal, rate, term);
  const supplied = Boolean(v.current_payment?.trim());
  const entered = supplied ? n(v, 'current_payment') : modeled;
  const regular = Math.abs(entered - modeled) <= .0051 ? modeled : entered;
  // A rounded statement payment may differ by a fraction of a cent. Otherwise
  // do not conceal a balloon or negative amortization with a forced last payment.
  if (regular < modeled - Math.max(.0051, modeled * 1e-12))
    throw Error('Current monthly P&I is too low to repay this balance within the remaining term. Check P&I, balance and term; balloon and interest-only loans are outside this model.');
  const reduced = principal - lump, newPayment = payment(reduced, rate, term);
  const baseline = schedule(principal, rate, term, regular, regular === modeled);
  const recast = schedule(reduced, rate, term, newPayment, true);
  const lumpOnly = schedule(reduced, rate, term, regular);
  const baseInterest = interest(baseline), recastInterest = interest(recast), lumpInterest = interest(lumpOnly);
  const baseCash = cash(baseline), recastCash = lump + fee + cash(recast), lumpCash = lump + cash(lumpOnly);
  const rows = recast.map((row, i) => [row.period, row.payment, row.interest, row.principal, row.balance, lumpOnly[i]?.balance ?? 0]);
  return {
    metrics: [
      money('New monthly P&I after recast', newPayment), money('Monthly P&I reduction', regular - newPayment),
      money('Recast net interest savings after fee', baseInterest - recastInterest - fee),
      money('Current monthly P&I used', regular), money('Current principal balance', principal),
      money('Lump-sum principal paid now', lump), money('Principal after lump sum', reduced), money('Recast fee paid now', fee),
      metric('Remaining contractual months', term), metric('Baseline months to payoff', baseline.length),
      metric('Recast months to payoff', recast.length), metric('Lump-sum-only months to payoff', lumpOnly.length),
      metric('Months earlier with lump sum only vs baseline', baseline.length - lumpOnly.length),
      money('Baseline remaining interest', baseInterest), money('Recast remaining interest', recastInterest), money('Lump-sum-only remaining interest', lumpInterest),
      money('Recast interest savings before fee', baseInterest - recastInterest), money('Lump-sum-only interest savings', baseInterest - lumpInterest),
      money('Additional interest from recasting vs lump sum only', recastInterest - lumpInterest),
      money('Baseline total future cash outlay', baseCash), money('Recast total future cash outlay', recastCash), money('Lump-sum-only total future cash outlay', lumpCash),
    ],
    columns: ['Month', 'Recast payment', 'Recast interest', 'Recast principal', 'Recast balance', 'Lump-sum-only balance'], rows,
    schedulePeriod: 'Monthly',
    annualColumns: ['Loan year', 'Recast payments', 'Recast interest', 'Recast principal', 'Recast ending balance', 'Lump-sum-only ending balance'],
    annualRows: yearlySchedule(rows, 12, [1, 2, 3], [4, 5]),
    additionalTables: [{ title: 'Compare three repayment choices',
      columns: ['Scenario', 'Monthly P&I (USD)', 'Payments remaining', 'Future interest (USD)', 'Fee now (USD)', 'Total future cash (USD)'],
      rows: [['Keep current loan', regular, baseline.length, baseInterest, 0, baseCash], ['Lump sum + recast', newPayment, recast.length, recastInterest, fee, recastCash], ['Lump sum only; keep payment', regular, lumpOnly.length, lumpInterest, 0, lumpCash]],
      note: 'Monthly amounts are regular P&I; final payments can be smaller. Total future cash includes all remaining payments plus any lump sum and recast fee paid now. It excludes prior payments, taxes, insurance and PMI.' }],
    notes: [
      'Fixed-rate, fully amortizing monthly P&I only, with the lump sum credited immediately before the next interest period. Recast keeps the entered rate and remaining contractual term; it is not refinancing. No daily accrued interest, processing delay, missed payments, balloon, interest-only or ARM model is included.',
      supplied ? 'The entered current P&I is used for the baseline and lump-sum-only alternatives. If earlier extra payments make this loan repay before contractual maturity, recasting to the entered remaining term can increase future interest. Negative savings are retained.' : 'Current P&I is estimated from current balance, rate and remaining term. If you previously paid extra principal, enter the actual scheduled monthly P&I from your statement; do not include escrow, PMI or voluntary extra principal.',
      'The lump sum is repayment of principal, not a fee or interest saving. Net recast interest savings compare future interest against keeping the loan and subtract the cash-paid recast fee. A positive monthly reduction does not guarantee positive total savings or that recasting beats keeping the original payment.',
      'The same lump sum is used for both alternatives. No fee is modeled for the lump-sum-only alternative; check any actual prepayment charge. The entered recast fee is paid in cash now, not financed. Taxes, investment opportunity cost and the loss of cash liquidity are not valued.',
      'Recast is subject to servicer and investor approval. Minimum principal payments, fees and availability vary. No universal minimum or approval is inferred, including when the lump sum is zero. This tool does not model FHA, VA or USDA recast eligibility and does not automatically cancel PMI.',
      'Schedules use full internal precision with a capped final payment. A statement payment within half a cent of calculated P&I is normalized to that exact modeled payment, rather than compounding a rounding difference. Yearly rows group 12 loan payments, not calendar years. The chart compares the two lump-sum alternatives; the unchanged-loan baseline appears in the comparison table.'
    ]
  };
}
export const mortgageRecast = tool('mortgage-recast', [{ id: 'compare', title: 'Recast vs Keep Payment',
  fields: [
    { ...num('principal', 'Current principal balance', 300000, '$', .01), max: 1e12 },
    { ...num('rate', 'Current annual interest rate', 6, '%'), max: 30 },
    { ...num('years', 'Remaining term', 25, 'years'), max: 40, step: 1 },
    { ...num('months', 'Additional remaining months', 0, 'months'), max: 11, step: 1 },
    { ...num('lump', 'Lump-sum principal payment now', 50000, '$'), max: 1e12 },
    { ...num('fee', 'Recast fee (cash paid now)', 0, '$'), max: 1e9, hint: 'Enter your servicer’s actual fee; no universal fee is assumed.' },
    { ...num('current_payment', 'Current monthly P&I (optional)', 0, '$', .01), value: '', optional: true, max: 1e12, hint: 'From your statement, excluding escrow, insurance and extra principal. Blank estimates P&I from balance and remaining term.' },
  ],
  description: 'Compare keeping your current loan, paying a lump sum and recasting, or paying the same lump sum while keeping your current P&I. Enter your actual balance, remaining term and servicer fee.',
  formula: 'Recast P&I = (balance − lump sum) × i / [1 − (1 + i)^−n], i = annual rate / 100 / 12. At 0%, payment = (balance − lump sum) / n. Net interest savings = baseline future interest − recast future interest − cash-paid fee.',
  calculate: recast,
}], 'Estimate your lower mortgage payment after a lump-sum principal payment and recast. Compare monthly relief, future interest and payoff time against keeping your payment.');
