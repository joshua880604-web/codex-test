import { tool } from './helpers';
import { amortize, payment, sum, type LoanRow } from '../finance';
import { estimateMortgagePmi, automaticPmiPremium, pmiCreditBands } from '../mortgage-pmi';
import { yearlySchedule } from '../schedules';
import { num, select, date, number as n, money, metric, type Mode, type Result, type Values } from '../types';

const dollars = (key: string, label: string, value: number, min = 0) => ({ ...num(key, label, value, '$', min), max: 1e12 });
const rate = (key: string, label: string, value: number) => ({ ...num(key, label, value, '%'), max: 30 });
const years = (label = 'Original loan term') => ({ ...num('years', label, 30, 'years', 1), max: 40, step: 1 });
function months(v: Values) {
  if (!Number.isInteger(n(v, 'years'))) throw Error('Loan term must be a whole number of years.');
  return n(v, 'years') * 12;
}
const percent = (label: string, value: number) => ({ ...metric(label, value, 'percent'), digits: 2 });
const totalInterest = (rows: LoanRow[]) => sum(rows.map(r => r.interest));
// Full precision, with an explicitly adjusted final contractual payment.
function monthlySchedule(principal: number, r: number, term: number, extra = 0): LoanRow[] {
  const regular = payment(principal, r, term) + extra, rows: LoanRow[] = []; let balance = principal;
  for (let month = 1; month <= term && balance > 1e-7; month++) {
    const interest = balance * r, paid = month === term ? balance + interest : Math.min(regular, balance + interest), repaid = paid - interest;
    balance = Math.max(0, balance - repaid); rows.push({ period: month, payment: paid, interest, principal: repaid, balance });
  }
  return rows;
}

export function mortgageMonthDate(first: string, offset: number) {
  const d = new Date(first + 'T00:00:00Z'), day = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + offset);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last)); return d.toISOString().slice(0, 10);
}
function event(label: string, month: number, first: string, text?: string) {
  return { label, value: month, displayValue: text ?? (month <= 0 ? 'At origination' : mortgageMonthDate(first, month - 1)) };
}
export function originalPmiMilestones(principal: number, value: number, annualRate: number, term: number) {
  const rows = monthlySchedule(principal, annualRate / 100 / 12, term);
  const reach = (fraction: number) => principal <= value * fraction + 1e-7 ? 0 : rows.find(r => r.balance <= value * fraction + 1e-7)!.period;
  const request80 = reach(.8), automatic78 = reach(.78), midpoint = Math.floor(term / 2) + 1;
  return { rows, request80, automatic78, midpoint, automaticStop: Math.min(automatic78, midpoint) };
}
const pmiScope = 'U.S. conventional, borrower-paid monthly PMI on an unmodified, fully amortizing fixed-rate principal-residence loan closed on or after July 29, 1999. FHA MIP, VA, lender-paid insurance, high-risk exceptions, ARM/interest-only loans and investor-specific current-value cancellation rules are outside this model.';
const pmiRules = [
  'An 80% LTV date is an opportunity to request cancellation, not automatic removal. The request must be in writing; current payments, good payment history, no junior liens and evidence that value has not declined are required. Approval and billing still need confirmation from the servicer.',
  'Scheduled automatic termination uses 78% of ORIGINAL value on the original amortization schedule, not the accelerated balance or today’s appraisal. It requires current payments. Final termination is the month after the original term midpoint if current. Extra principal can bring the 80% request forward; it does not move the statutory scheduled 78% date.',
];
const estimateFields = [dollars('price', 'Purchase price', 400000, .01), { ...num('down', 'Down payment', 10, '%'), max: 100 },
  { ...dollars('appraisal', 'Appraisal at purchase (optional)', 0, .01), value: '', optional: true, hint: 'Original value is the lower of purchase price and appraisal. Blank assumes appraisal is at least the price.' },
  rate('rate', 'Annual interest rate', 6.5), years(), date('first_due', 'First payment date', '2026-11-01')];
function pmiNew(v: Values, quoted: boolean): Result {
  const term = months(v), price = n(v, 'price'), principal = price * (1 - n(v, 'down') / 100), value = Math.min(price, v.appraisal?.trim() ? n(v, 'appraisal') : price);
  const original = originalPmiMilestones(principal, value, n(v, 'rate'), term);
  const autoRate = quoted ? null : (() => {
    try { return estimateMortgagePmi(principal, value, term, v.credit); }
    catch (error) { if (error instanceof Error) throw Error(error.message.replace('Choose Manual', 'Select Use My Quote')); throw error; }
  })();
  const annual = principal <= value * .8 + 1e-7 ? 0 : quoted ? n(v, 'annual_pmi') : autoRate!.annualPercent;
  const premium = (index: number) => quoted ? principal * annual / 100 / 12 : automaticPmiPremium(principal, annual, index);
  const base = principal ? payment(principal, n(v, 'rate') / 100 / 12, term) : 0;
  const actual = principal ? monthlySchedule(principal, n(v, 'rate') / 100 / 12, term, n(v, 'extra')) : [];
  const actual80 = principal <= value * .8 + 1e-7 ? 0 : actual.find(r => r.balance <= value * .8 + 1e-7)!.period;
  const request = Math.min(original.request80, actual80), requestStop = Math.min(request + 1, original.automaticStop);
  let requestedTotal = 0, automaticTotal = 0, requestedMonths = 0, automaticMonths = 0;
  const rows = actual.map(r => {
    const requested = annual > 0 && r.period < requestStop ? premium(r.period - 1) : 0;
    const automatic = annual > 0 && r.period < original.automaticStop ? premium(r.period - 1) : 0;
    requestedTotal += requested; automaticTotal += automatic; if (requested > 0) requestedMonths++; if (automatic > 0) automaticMonths++;
    return [r.period, r.payment, r.interest, r.principal, r.balance, requested, automatic];
  });
  const applicable = principal > value * .8 + 1e-7;
  return {
    metrics: [money('Initial monthly PMI', annual > 0 ? premium(0) : 0), percent(quoted ? 'Entered annual PMI rate' : 'Illustrative annual PMI rate', annual),
      percent('Original loan-to-value ratio', principal / value * 100), money('Original loan amount', principal), money('Original value for PMI', value), money('Scheduled monthly P&I', base),
      money('Initial total loan payment', (actual[0]?.payment ?? 0) + (annual > 0 ? premium(0) : 0)), money('80% request balance', value * .8), money('78% scheduled termination balance', value * .78),
      event('80% request benchmark', request, v.first_due, applicable ? undefined : 'No PMI modeled at 80% LTV or below'),
      event('Scheduled 78% benchmark', original.automatic78, v.first_due, applicable ? undefined : 'Not applicable'),
      event('Final midpoint termination benchmark', original.midpoint, v.first_due, applicable ? undefined : 'Not applicable'),
      money('PMI if 80% request is approved', requestedTotal), money('PMI using automatic termination only', automaticTotal), money('Potential PMI savings from requesting', automaticTotal - requestedTotal),
      metric('Payments with PMI if request approved', requestedMonths), metric('Payments with PMI under automatic scenario', automaticMonths)],
    columns: rows.length ? ['Month', 'Payment', 'Interest', 'Principal', 'Balance', 'PMI if requested', 'PMI automatic only'] : undefined, rows: rows.length ? rows : undefined,
    schedulePeriod: 'Monthly', annualColumns: rows.length ? ['Loan year', 'Payments', 'Interest', 'Principal', 'Ending balance', 'PMI if requested', 'PMI automatic only'] : undefined,
    annualRows: rows.length ? yearlySchedule(rows, 12, [1, 2, 3, 5, 6], [4]) : undefined,
    notes: [pmiScope, ...pmiRules,
      quoted ? 'Manual premium model: the entered annual rate applies to the original loan amount and stays constant. It is not an insurer renewal quote.' : 'Illustrative National MI Monthly Advantage base-rate card effective March 1, 2022, reviewed October 26, 2026; not a live quote or a government-set fee. Assumes one unit, up to two borrowers, DTI at most 45%, standard agency coverage and an eligible fixed-rate purchase. State/program/lender adjustments are not modeled. From payment 121, this card uses the lesser of the initial annual rate or 0.20%. Use My Quote for your actual annual rate.',
      'Original value is the lower purchase price or appraisal at purchase. A refinancing appraisal can be the original value of a refinanced loan; use Cancellation & LTV for an existing loan. Today’s higher appraisal does not replace this HPA original-value basis.',
      'The requested scenario assumes approval after the qualifying payment, so PMI stops at the next payment. The automatic scenario stops on its scheduled termination due date or the month after midpoint, whichever is earlier, assuming current payments. Premiums cease after actual payoff. Servicer processing, prepaid premiums and refunds can change final costs.',
      'Table Payment is principal, interest and entered extra principal; the two PMI columns are separate alternatives, not amounts to add together. Initial total includes extra principal and PMI, but excludes property tax, homeowners insurance, HOA and other ownership costs. Yearly rows group 12 loan payments, not calendar-tax years.'],
  };
}
const existingFields = [dollars('original_value', 'Original home value', 400000, .01), dollars('original_loan', 'Original loan amount', 380000, .01),
  dollars('balance', 'Current principal balance', 310000), { ...dollars('current_value', 'Current home value (optional)', 0, .01), value: '450000', optional: true },
  rate('rate', 'Annual interest rate', 6.5), years(), { ...num('elapsed', 'Payments already made', 84, 'months'), max: 479, step: 1 }, date('first_due', 'First original payment date', '2019-11-01'),
  dollars('monthly_pmi', 'Current monthly PMI quote', 150), dollars('extra', 'Extra monthly principal', 0),
  select('current', 'Are payments current?', ['Yes', 'No']),
  select('conditions', '80% request conditions', ['Not confirmed', 'Confirmed: good history, no junior liens, value not declined'])];
function pmiCancellation(v: Values): Result {
  const term = months(v), elapsed = n(v, 'elapsed'), principal = n(v, 'original_loan'), value = n(v, 'original_value'), balance = n(v, 'balance');
  if (!Number.isInteger(elapsed) || elapsed >= term) throw Error('Payments already made must be a whole number below the original term.');
  if (balance > principal) throw Error('Current principal cannot exceed the original loan in this unmodified-loan model.');
  const original = originalPmiMilestones(principal, value, n(v, 'rate'), term), scheduledBalance = elapsed ? original.rows[elapsed - 1]?.balance ?? 0 : principal;
  if (v.current === 'Yes' && balance > scheduledBalance + .02) throw Error('Current balance exceeds the original schedule. Check payment count and principal; modified or capitalized loans need their actual servicer schedule.');
  const base = payment(principal, n(v, 'rate') / 100 / 12, term);
  const rows = balance ? amortize(balance, n(v, 'rate') / 100 / 12, term, { monthly: n(v, 'extra') }, base) : [];
  const actualReach = balance <= value * .8 + 1e-7 ? elapsed : elapsed + rows.find(r => r.balance <= value * .8 + 1e-7)!.period;
  const request = Math.min(original.request80, actualReach), automaticReached = elapsed >= original.automaticStop;
  const monthly = !balance || (v.current === 'Yes' && automaticReached) ? 0 : n(v, 'monthly_pmi');
  const todayValue = v.current_value?.trim() ? n(v, 'current_value') : null;
  const decline = todayValue !== null && todayValue < value - .01;
  const requestStatus = !balance ? 'Loan paid off' : v.current !== 'Yes' ? 'Bring payments current; contact servicer' : automaticReached ? 'Automatic benchmark reached; verify termination' : elapsed < request ? 'Threshold not yet reached' : decline ? 'Value decline indicated; request conditions not met' : v.conditions === 'Not confirmed' ? 'Threshold reached; verify conditions and request in writing' : 'Eligible to request; written approval still required';
  return { metrics: [money('Modeled current monthly PMI', monthly), { label: 'Cancellation status', value: 0, displayValue: requestStatus }, percent('LTV using original value', balance / value * 100),
    ...(todayValue ? [percent('LTV using current value (informational)', balance / todayValue * 100)] : []),
    money('Principal to pay down to 80%', Math.max(0, balance - value * .8)), money('80% original-value balance', value * .8), money('78% original-value balance', value * .78),
    event('80% request benchmark', request, v.first_due), metric('Payments until 80% request benchmark', Math.max(0, request - elapsed)),
    event('Scheduled 78% benchmark', original.automatic78, v.first_due), event('Midpoint final termination benchmark', original.midpoint, v.first_due),
    event('Earlier automatic benchmark', original.automaticStop, v.first_due), money('Scheduled monthly P&I', base), money('Annualized PMI at current quote', monthly * 12)],
    columns: ['Period', 'Payment', 'Interest', 'Principal', 'Balance'], rows: rows.map(r => [r.period, r.payment, r.interest, r.principal, r.balance]),
    notes: [pmiScope, ...pmiRules,
      'Original home value means the lower purchase price/appraisal at purchase, or the appraisal used for the refinancing. Current home value is informational only; appreciation-based investor cancellation may have seasoning and appraisal requirements and is not modeled.',
      'The original loan amount, rate and term determine the original scheduled benchmarks. Current balance and extra payments only project the earlier actual 80% threshold. Payment count means completed original monthly payments; dates are relative to the first original payment date.',
      v.current === 'No' ? 'Past-due payments block automatic termination. The entered monthly PMI quote stays active even if a scheduled benchmark has passed. No catch-up date or total future premium is inferred; contact your servicer. Future balance rows assume the entered payment is paid from now on.' : 'Current payments are assumed for automatic and midpoint benchmarks. Reaching 80% never means PMI was already canceled. Until approval, the quoted premium remains; a reached automatic benchmark shows zero modeled PMI but actual termination must be verified.',
      'This tool does not determine whether an actual insurer contract, loan modification, high-risk designation, delinquency history or investor waiver changes your rights. A zero principal balance ends the modeled loan premium. The balance table excludes PMI, taxes, insurance and arrears.'],
  };
}
const pmiModes: Mode[] = [
  { id: 'estimate', title: 'PMI Estimate', fields: [...estimateFields, select('credit', 'Assumed credit score range', pmiCreditBands, '740-759'), dollars('extra', 'Extra monthly principal', 0)], description: 'Estimate conventional PMI from original LTV and an illustrative credit/term rate card; compare requested and automatic cancellation scenarios.', formula: 'LTV = original loan / original value × 100. Monthly PMI = original loan × annual premium rate / 12. 80% request and scheduled 78% / midpoint termination use separate dates.', calculate: v => pmiNew(v, false) },
  { id: 'quote', title: 'Use My Quote', fields: [...estimateFields, rate('annual_pmi', 'Quoted annual PMI rate', .5), dollars('extra', 'Extra monthly principal', 0)], description: 'Use your own annual borrower-paid PMI rate and compare the two cancellation paths without estimating an insurer rate.', formula: 'Monthly quoted PMI = original principal × annual PMI percentage / 100 / 12. Premium timing follows the stated cancellation scenario.', calculate: v => pmiNew(v, true) },
  { id: 'cancellation', title: 'Cancellation & LTV', fields: existingFields, description: 'Check an existing loan against original-value 80%, scheduled 78% and midpoint benchmarks; current market LTV is shown separately.', formula: 'Request benchmark = earlier scheduled or actual 80% original-value date. Automatic benchmark = earlier original-schedule 78% date or month after the original term midpoint, if current.', calculate: pmiCancellation },
];
const pmi = tool('pmi', pmiModes, 'Estimate monthly private mortgage insurance and review conventional PMI cancellation, original LTV and current-value LTV.');

function biweekly(v: Values): Result {
  const term = n(v, 'years') * 12 + n(v, 'months'), principal = n(v, 'principal'), r = n(v, 'rate') / 100;
  if (!Number.isInteger(n(v, 'years')) || !Number.isInteger(n(v, 'months')) || term < 1 || term > 480) throw Error('Enter a whole remaining term from 1 to 480 months.');
  const monthly = payment(principal, r / 12, term), acceleratedPayment = monthly / 2 + n(v, 'extra');
  const standard = monthlySchedule(principal, r / 12, term), accelerated = amortize(principal, r / 26, term / 12 * 26, {}, acceleratedPayment);
  const matchedPayment = acceleratedPayment * 26 / 12, matched = amortize(principal, r / 12, term, {}, matchedPayment);
  const interest = totalInterest(accelerated), normalInterest = totalInterest(standard), matchedInterest = totalInterest(matched);
  return { metrics: [money('Biweekly payment', acceleratedPayment), money('Standard monthly payment', monthly), money('Annual biweekly payment budget', acceleratedPayment * 26), money('Extra annual outlay versus monthly', acceleratedPayment * 26 - monthly * 12),
    money('Interest saved versus standard monthly', normalInterest - interest), metric('Years to payoff with biweekly payments', accelerated.length / 26), metric('Years earlier than standard monthly', term / 12 - accelerated.length / 26),
    money('Biweekly total interest', interest), money('Standard monthly total interest', normalInterest), metric('Number of biweekly payments', accelerated.length), money('Total biweekly payments', sum(accelerated.map(r => r.payment))),
    money('Monthly payment with the same annual budget', matchedPayment), money('Matched-budget monthly total interest', matchedInterest), money('Biweekly interest saving versus matched budget', matchedInterest - interest), metric('Matched-budget monthly payoff years', matched.length / 12)],
    columns: ['Period', 'Payment', 'Interest', 'Principal', 'Balance'], rows: accelerated.map(r => [r.period, r.payment, r.interest, r.principal, r.balance]),
    notes: ['Fixed-rate principal-and-interest comparison. Half the monthly payment every two weeks creates 26 half-payments per modeled year: 13 monthly payments, not 12. Twice a month is 24 half-payments and does not create that extra annual payment.',
      'The biweekly model assumes immediate crediting with nominal annual interest divided by 26 and equal 1/26-year periods. It is not a dated daily-interest or exact 14-day calendar simulation; actual calendars can have 27 pay dates in a year. A lender holding partial payments until a full monthly payment is due can produce different results.',
      'The matched-budget comparison pays the same annual amount in 12 monthly installments, including one-twelfth of the annual extra outlay. This separates most of the benefit of paying extra from the smaller modeled benefit of earlier crediting.',
      'Final payments are capped at remaining principal plus interest. Payoff years count actual payment periods (26 or 12 per year), not fractional payoff interpolation. No taxes, home insurance, PMI, service charges or prepayment penalties are included. Yearly rows group 26 modeled biweekly payments.'],
  };
}
const biweeklyTool = tool('biweekly-mortgage', [{ id: 'biweekly', title: 'Biweekly vs Monthly', fields: [dollars('principal', 'Current loan principal', 300000, .01), rate('rate', 'Annual interest rate', 6.5), { ...years('Remaining loan term'), min: 0 }, { ...num('months', 'Additional remaining months', 0, 'months'), max: 11, step: 1 }, dollars('extra', 'Extra per biweekly payment', 0)], description: 'Compare accelerated half-monthly payments every two weeks with standard monthly payments and a monthly plan using the same annual budget.', formula: 'Monthly P&I = P × i / (1 − (1 + i)^−n). Biweekly payment = monthly / 2 + extra. Model rate = annual / 26; matched monthly budget = biweekly × 26 / 12.', calculate: biweekly }], 'Compare biweekly mortgage payments, interest savings and payoff time with monthly and equal-budget monthly plans.');

function discountPoints(v: Values): Result {
  const term = months(v), horizon = n(v, 'hold');
  if (!Number.isInteger(horizon) || horizon > term) throw Error('Holding period must be a whole number of months from zero through the loan term.');
  const principal = n(v, 'principal'), a = monthlySchedule(principal, n(v, 'rate_a') / 100 / 12, term), b = monthlySchedule(principal, n(v, 'rate_b') / 100 / 12, term);
  const paymentA = payment(principal, n(v, 'rate_a') / 100 / 12, term), paymentB = payment(principal, n(v, 'rate_b') / 100 / 12, term);
  const pointsA = principal * n(v, 'points_a') / 100, pointsB = principal * n(v, 'points_b') / 100;
  const upfrontA = pointsA + n(v, 'fees_a'), upfrontB = pointsB + n(v, 'fees_b'), extraCost = upfrontB - upfrontA;
  let paidA = 0, paidB = 0, interestA = 0, interestB = 0;
  const rows: number[][] = [];
  let cashBreak = extraCost <= 0 ? 0 : -1, costBreak = extraCost <= 0 ? 0 : -1;
  for (let m = 1; m <= term; m++) {
    paidA += a[m - 1]?.payment ?? 0; paidB += b[m - 1]?.payment ?? 0;
    interestA += a[m - 1]?.interest ?? 0; interestB += b[m - 1]?.interest ?? 0;
    const cash = paidA - paidB - extraCost, advantage = (a[m - 1]?.balance ?? 0) - (b[m - 1]?.balance ?? 0), net = interestA - interestB - extraCost;
    if (cashBreak < 0 && cash >= -1e-7) cashBreak = m;
    if (costBreak < 0 && net >= -1e-7) costBreak = m;
    rows.push([m, cash, advantage, net, a[m - 1]?.balance ?? 0, b[m - 1]?.balance ?? 0]);
  }
  const at = horizon ? rows[horizon - 1] : [0, -extraCost, 0, -extraCost, principal, principal];
  const costA = upfrontA + sum(a.slice(0, horizon).map(r => r.interest)), costB = upfrontB + sum(b.slice(0, horizon).map(r => r.interest));
  const saving = paymentA - paymentB, simple = extraCost <= 0 && saving >= 0 ? 0 : saving > 0 ? extraCost / saving : -1;
  const breakMetric = (label: string, month: number) => ({ label, value: Math.max(0, month), ...(month < 0 ? { displayValue: 'Not reached within loan term' } : {}) });
  return { metrics: [money('Net borrowing-cost savings at horizon (B vs A)', at[3]), money('Monthly payment saving (A minus B)', saving), money('Offer A monthly P&I', paymentA), money('Offer B monthly P&I', paymentB),
    money('Offer A points or credit amount', pointsA), money('Offer B points or credit amount', pointsB), money('Additional upfront cost for B', extraCost), money('Net cash-flow savings at horizon', at[1]), money('Balance advantage of B at horizon', at[2]),
    money('Offer A interest and upfront costs at horizon', costA), money('Offer B interest and upfront costs at horizon', costB),
    breakMetric('First net-cost break-even month', costBreak), breakMetric('First cash-flow break-even month', cashBreak),
    { label: 'Simple payment-savings break-even (months)', value: Math.max(0, simple), ...(simple < 0 ? { displayValue: 'Not applicable; compare horizon costs' } : simple > term ? { displayValue: 'Beyond loan term (' + simple.toFixed(2) + ' months)' } : {}) },
    money('Lifetime interest savings (A minus B)', interestA - interestB), money('Lifetime savings after upfront costs', interestA - interestB - extraCost), metric('Selected holding period in months', horizon)],
    columns: ['Month', 'Net cash-flow savings', 'Balance advantage of B', 'Net borrowing-cost savings', 'Balance A', 'Balance B'], rows,
    notes: ['Compare two same-principal, same-term fixed-rate quotes. One point costs 1% of loan principal. Fractional points are allowed; negative points represent an entered lender credit. A point does not guarantee a fixed interest-rate reduction: enter both quoted rates from the Loan Estimates.',
      'Points and entered other upfront costs are paid in cash, not financed. Offer A is the baseline; a positive B savings value favors B, and a negative value favors A. Same ownership costs are excluded; no tax deductions, discounting, opportunity cost, mortgage insurance or prepayment penalties are modeled.',
      'Net borrowing-cost savings = interest paid A − interest paid B − additional upfront cost B. Equivalently it includes payment differences PLUS the remaining loan-balance advantage. Cash-flow savings use payments alone and can give a later break-even. The simple upfront-cost/monthly-saving ratio is only a shortcut and may be beyond the loan term.',
      'First break-even is the first nonnegative point in the modeled month-by-month comparison, not a guarantee of permanent advantage. A credit/higher-rate quote can start ahead and later become more expensive. Check your selected sale/refinance horizon; zero months compares upfront costs only. The final payoff is capped at the actual amount owed.'],
  };
}
const points = tool('discount-points', [{ id: 'compare', title: 'Compare Loan Quotes', fields: [dollars('principal', 'Loan principal (same for both)', 300000, .01), years('Loan term (same for both)'), rate('rate_a', 'Offer A interest rate', 6.75), { ...num('points_a', 'Offer A points / lender credit', 0, '%', -20), max: 20 }, rate('rate_b', 'Offer B interest rate', 6.5), { ...num('points_b', 'Offer B points / lender credit', 1, '%', -20), max: 20 }, { ...num('hold', 'Months until sale or refinance', 60, 'months'), max: 480, step: 1 }, dollars('fees_a', 'Offer A other upfront costs', 0), dollars('fees_b', 'Offer B other upfront costs', 0)], description: 'Compare actual rate/points quotes, cash-flow and balance-aware break-even, and savings at your expected sale or refinance date.', formula: 'Point cost = principal × points / 100. Net horizon saving B = cumulative interest A − cumulative interest B − (upfront B − upfront A). Cash-flow saving excludes the balance advantage.', calculate: discountPoints }], 'Compare mortgage discount points, monthly payments, break-even timing and net costs before selling or refinancing.');

export const mortgageTools = [pmi, biweeklyTool, points];
