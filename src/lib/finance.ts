export function positive(n: number, name = "Value"): number {
  if (!Number.isFinite(n) || n <= 0)
    throw new Error(`${name} must be greater than zero.`);
  return n;
}
export function nonnegative(n: number, name = "Value"): number {
  if (!Number.isFinite(n) || n < 0)
    throw new Error(`${name} cannot be negative.`);
  return n;
}
export function periods(n: number): number {
  positive(n, "Number of periods");
  if (n > 12000)
    throw new Error("Maximum supported duration is 12,000 periods.");
  return n;
}
export function payment(p: number, r: number, n: number, due = false): number {
  nonnegative(p, "Principal");
  periods(n);
  if (r <= -1) throw new Error("Periodic rate must exceed -100%.");
  return (
    (Math.abs(r) < 1e-12 ? p / n : (p * r) / -Math.expm1(-n * Math.log1p(r))) /
    (due ? 1 + r : 1)
  );
}
export function future(
  p: number,
  c: number,
  r: number,
  n: number,
  due = false,
): number {
  nonnegative(n, "Periods");
  if (n > 12000 || r <= -1) throw new Error("Unsupported duration or rate.");
  const growth = Math.exp(n * Math.log1p(r));
  return (
    p * growth +
    c *
      (Math.abs(r) < 1e-12 ? n : Math.expm1(n * Math.log1p(r)) / r) *
      (due ? 1 + r : 1)
  );
}
export function present(
  fv: number,
  c: number,
  r: number,
  n: number,
  due = false,
): number {
  return (fv - future(0, c, r, n, due)) / Math.exp(n * Math.log1p(r));
}
export function annuityPV(
  c: number,
  r: number,
  n: number,
  due = false,
): number {
  return -present(0, c, r, n, due);
}
export function duration(p: number, c: number, r: number): number {
  positive(p, "Balance");
  positive(c, "Payment");
  if (r <= -1) throw new Error("Invalid periodic rate.");
  if (Math.abs(r) < 1e-12) return p / c;
  if (c <= p * r)
    throw new Error("Payment does not cover interest. Increase the payment.");
  return -Math.log1p((-p * r) / c) / Math.log1p(r);
}
export function bisect(
  fn: (x: number) => number,
  lo: number,
  hi: number,
): number {
  let fl = fn(lo),
    fh = fn(hi);
  if (!Number.isFinite(fl) || !Number.isFinite(fh) || fl * fh > 0)
    throw new Error(
      "No solution in the supported interval. Check your inputs.",
    );
  if (fl === 0) return lo;
  if (fh === 0) return hi;
  for (let i = 0; i < 220; i++) {
    const mid = (lo + hi) / 2,
      fm = fn(mid);
    if (!Number.isFinite(fm))
      throw new Error("Calculation exceeded numeric limits.");
    if (Math.abs(hi - lo) < 1e-12 * Math.max(1, Math.abs(mid)) || fm === 0)
      return mid;
    if (fl * fm <= 0) {
      hi = mid;
      fh = fm;
    } else {
      lo = mid;
      fl = fm;
    }
  }
  throw new Error("The solver did not converge.");
}
export function solveRate(p: number, c: number, n: number): number {
  positive(p, "Principal");
  positive(c, "Payment");
  periods(n);
  return bisect((r) => payment(p, r, n) - c, -0.9, 100);
}
export function periodic(
  annualPercent: number,
  compounds: number,
  pays: number,
): number {
  positive(pays, "Payments per year");
  if (compounds === 0) return Math.expm1(annualPercent / 100 / pays);
  positive(compounds, "Compounding frequency");
  const r = annualPercent / 100 / compounds;
  if (r <= -1) throw new Error("Rate below allowed range.");
  return Math.expm1((Math.log1p(r) * compounds) / pays);
}
export type Extra = {
  monthly?: number;
  yearly?: number;
  once?: number;
  onceMonth?: number;
  monthlyStart?: number;
  yearlyStart?: number;
  dated?: Record<number, number>;
};
export type LoanRow = {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};
export function amortize(
  p: number,
  r: number,
  n: number,
  extra: Extra = {},
  fixed?: number,
): LoanRow[] {
  nonnegative(p, "Principal");
  periods(n);
  nonnegative(r, "Interest rate");
  const a = fixed ?? payment(p, r, n);
  if (p > 0 && a <= p * r && !(extra.monthly || extra.yearly || extra.once))
    throw new Error("Payment does not cover interest.");
  const rows: LoanRow[] = [];
  let b = p;
  for (let i = 1; i <= 12000 && b > 1e-7; i++) {
    const interest = b * r;
    const extras =
      (i >= (extra.monthlyStart ?? 1) ? (extra.monthly ?? 0) : 0) +
      (i >= (extra.yearlyStart ?? 12) &&
      (i - (extra.yearlyStart ?? 12)) % 12 === 0
        ? (extra.yearly ?? 0)
        : 0) +
      (i === (extra.onceMonth ?? 1) ? (extra.once ?? 0) : 0) +
      (extra.dated?.[i] ?? 0);
    const pay = Math.min(b + interest, a + extras),
      principal = pay - interest;
    if (
      principal < 0 &&
      i > Math.max(extra.onceMonth ?? 1, extra.monthlyStart ?? 1)
    )
      throw new Error("Payment results in negative amortization.");
    b = Math.max(0, b - principal);
    rows.push({ period: i, payment: pay, interest, principal, balance: b });
  }
  if (b > 1e-5)
    throw new Error("Debt cannot be repaid within 12,000 payments.");
  return rows;
}
export function irr(flows: number[], times?: number[]): number[] {
  if (
    flows.length < 2 ||
    !flows.some((x) => x < 0) ||
    !flows.some((x) => x > 0)
  )
    throw new Error("IRR requires both positive and negative cash flows.");
  const t = times ?? flows.map((_, i) => i);
  if (t.length !== flows.length)
    throw new Error("Cash flow dates do not match.");
  const npv = (y: number) =>
    flows.reduce((s, x, i) => s + x * Math.exp(-t[i] * y), 0);
  const roots: number[] = [];
  let prev = -12,
    fp = npv(prev);
  for (let i = 1; i <= 1600; i++) {
    const cur = -12 + (i * 24) / 1600,
      fc = npv(cur);
    if (
      Number.isFinite(fp) &&
      Number.isFinite(fc) &&
      (fp === 0 || fp * fc < 0)
    ) {
      const y = fp === 0 ? prev : bisect(npv, prev, cur),
        r = Math.expm1(y);
      if (!roots.some((x) => Math.abs(x - r) < 1e-6)) roots.push(r);
    }
    prev = cur;
    fp = fc;
  }
  if (!roots.length)
    throw new Error("No IRR found in the supported rate range.");
  return roots;
}
export function parseNumbers(s: string): number[] {
  const vals = s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
  if (!vals.length || vals.some((x) => !Number.isFinite(x)))
    throw new Error("Enter numbers separated by commas or new lines.");
  if (vals.length > 12000) throw new Error("Too many entries.");
  return vals;
}
export function datesYears(start: string, end: string): number {
  const a = Date.parse(start),
    b = Date.parse(end);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a)
    throw new Error("End date must be after start date.");
  return (b - a) / 86400000 / 365;
}
export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
