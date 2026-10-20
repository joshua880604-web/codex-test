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
  for (const key of ["monthly", "yearly", "once"] as const)
    if (extra[key] !== undefined) nonnegative(extra[key]!, "Extra payment");
  for (const key of ["onceMonth", "monthlyStart", "yearlyStart"] as const) {
    const period = extra[key];
    if (period !== undefined && (!Number.isInteger(period) || period < 1 || period > 12000))
      throw new Error("Extra payment period must be a whole number from 1 to 12,000.");
  }
  for (const [period, amount] of Object.entries(extra.dated ?? {})) {
    if (!Number.isInteger(Number(period)) || Number(period) < 1 || Number(period) > 12000)
      throw new Error("Extra payment period must be a whole number from 1 to 12,000.");
    nonnegative(amount, "Extra payment");
  }
  if (fixed !== undefined) positive(fixed, "Payment");
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
  if(flows.length<2 || flows.length>12001 || flows.some(x=>!Number.isFinite(x)))
    throw new Error("IRR needs 2 to 12,001 finite cash flows.");
  const t=times ?? flows.map((_,i)=>i);
  if(t.length!==flows.length || t.some(x=>!Number.isFinite(x)||x<0||x>12000))
    throw new Error("Cash flow dates must match the flows and use finite elapsed times from 0 to 12,000.");
  const grouped=new Map<number,number[]>();
  flows.forEach((cf,i)=>{const bucket=grouped.get(t[i]);if(bucket)bucket.push(cf);else grouped.set(t[i],[cf]);});
  // Net same-time amounts with exact decimal integers before converting to signed logs.
  // Global floating-point division would erase valid tiny flows next to very large ones.
  const points=[...grouped.entries()].map(([time,values])=>{
    const parts=values.filter(x=>x!==0).map(x=>{
      const [mantissa,exponent="0"]=Math.abs(x).toString().split("e");
      const fraction=mantissa.split(".")[1]?.length??0;
      return {coefficient:BigInt(mantissa.replace(".",""))*(x<0?-1n:1n),exponent:Number(exponent)-fraction};
    });
    if(!parts.length)return null;
    const exponent=Math.min(...parts.map(x=>x.exponent));
    const net=parts.reduce((sum,x)=>sum+x.coefficient*10n**BigInt(x.exponent-exponent),0n);
    if(net===0n)return null;
    const digits=(net<0n?-net:net).toString(),head=digits.slice(0,16);
    return {time,sign:net<0n?-1:1,log:Math.log(Number(head))+(digits.length-head.length+exponent)*Math.LN10};
  }).filter((p):p is {time:number;sign:number;log:number}=>p!==null).sort((a,b)=>a.time-b.time);
  if(!points.length)throw new Error("No unique IRR: all net cash flows cancel at every rate.");
  if(!points.some(p=>p.sign<0)||!points.some(p=>p.sign>0))
    throw new Error("IRR requires both positive and negative net cash flows at different times.");
  const origin=points[0].time;
  points.forEach(p=>p.time-=origin);
  // Log-scaled signed sums avoid overflow at negative rates and underflow for delayed flows.
  const evaluate=(y:number,derivative=false)=>{
    let shift=-Infinity;
    for(const p of points){if(derivative&&p.time===0)continue;shift=Math.max(shift,p.log-p.time*y+(derivative?Math.log(p.time):0));}
    let value=0,correction=0,magnitude=0;
    for(const p of points){if(derivative&&p.time===0)continue;const weight=Math.exp(p.log-p.time*y+(derivative?Math.log(p.time):0)-shift),term=weight*p.sign*(derivative?-1:1),adjusted=term-correction,next=value+adjusted;correction=(next-value)-adjusted;value=next;magnitude+=weight;}
    return {value,magnitude};
  };
  const npv=(y:number)=>evaluate(y).value;
  const derivative=(y:number)=>evaluate(y,true).value;
  const roots:number[]=[];
  const addRoot=(y:number)=>{
    const check=evaluate(y);
    if(Math.abs(check.value)>1e-9*check.magnitude)return;
    if(!roots.some(r=>Math.abs(Math.log1p(r)-y)<1e-9))roots.push(Math.expm1(y));
  };
  const bracket=(lo:number,hi:number)=>{
    const a=npv(lo),b=npv(hi);
    if(a===0)addRoot(lo);if(b===0)addRoot(hi);
    if(a!==0&&b!==0&&Math.sign(a)!==Math.sign(b))addRoot(bisect(npv,lo,hi));
  };
  const signChanges=points.slice(1).reduce((n,p,i)=>n+(p.sign!==points[i].sign?1:0),0);
  if(signChanges===1)bracket(-12,12);
  else {
    let prev=-12,dp=derivative(prev);
    for(let i=1;i<=1600;i++){
      const cur=-12+i*24/1600,dc=derivative(cur);
      if(Math.sign(dp)!==Math.sign(dc)){
        const stationary=dp===0?prev:dc===0?cur:bisect(derivative,prev,cur),check=evaluate(stationary);
        if(Math.abs(check.value)<=2e-14*check.magnitude)addRoot(stationary);
        else {bracket(prev,stationary);bracket(stationary,cur);}
      }else bracket(prev,cur);
      prev=cur;dp=dc;
    }
  }
  roots.sort((a,b)=>a-b);
  if(!roots.length)throw new Error("No IRR found in the supported rate range. A solution may not exist, or may lie outside the numerical search.");
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
