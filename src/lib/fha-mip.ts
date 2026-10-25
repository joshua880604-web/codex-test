// Ordinary FHA Title II forward loans under Mortgagee Letter 2023-05.
// Special programs and historical case dates require explicitly entered terms.
export function fhaMipTerms(base: number, homePrice: number, months: number) {
  if (![base, homePrice, months].every(Number.isFinite) || base < 0 || homePrice <= 0 || base > homePrice)
    throw new Error("Enter a valid FHA loan amount and home price.");
  if (!Number.isInteger(months) || months < 1 || months > 12000)
    throw new Error("FHA loan term must be a whole number of months, up to 12,000.");
  const ltv = base / homePrice;
  const annualPercent = base === 0 ? 0 : months > 180
    ? (base <= 726200 ? (ltv <= .95 ? .5 : .55) : (ltv <= .95 ? .7 : .75))
    : (base <= 726200 ? (ltv <= .9 ? .15 : .4) : (ltv <= .78 ? .15 : ltv <= .9 ? .4 : .65));
  return {upfrontPercent: 1.75, annualPercent, durationMonths: base === 0 ? 0 : ltv <= .9 ? Math.min(132, months) : months};
}

const cents = (value: number) => Math.round((value + Number.EPSILON * Math.max(1, Math.abs(value))) * 100) / 100;

// HUD monthly-premium method: average the original scheduled opening balances
// for each mortgage year, apply the annual rate, remove financed upfront MIP,
// then divide by twelve, rounding at each published premium-calculation step.
export function fhaMipSchedule(principal: number, ratePercent: number, monthlyPayment: number, months: number, upfrontPercent: number, annualPercent: number, durationMonths: number) {
  if (!Number.isInteger(months) || months < 1 || months > 12000)
    throw new Error("FHA loan term must be a whole number of months, up to 12,000.");
  if (![principal, ratePercent, monthlyPayment, upfrontPercent, annualPercent, durationMonths].every(Number.isFinite) ||
      [principal, ratePercent, monthlyPayment, upfrontPercent, annualPercent, durationMonths].some(value => value < 0) ||
      !Number.isInteger(durationMonths))
    throw new Error("Enter valid FHA premium settings with a whole number of insured months.");
  const premiums = Array<number>(months).fill(0);
  let balance = cents(principal);
  const payment = cents(monthlyPayment);
  for (let start = 0; start < months; start += 12) {
    let sum = 0;
    for (let offset = 0; offset < 12; offset++) {
      if (start + offset >= months) continue;
      sum += balance;
      const interest = cents(cents(balance * ratePercent) / 1200);
      balance = cents(Math.max(0, balance + interest - payment));
    }
    const annual = cents(cents(sum / 12 * annualPercent / 100) / (1 + upfrontPercent / 100));
    const monthly = cents(annual / 12);
    for (let offset = 0; offset < 12 && start + offset < months; offset++)
      if (start + offset < durationMonths) premiums[start + offset] = monthly;
  }
  return premiums;
}
