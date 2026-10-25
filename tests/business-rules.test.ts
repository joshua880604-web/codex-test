import { test } from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
import { federalTax, type TaxInputs } from "../src/lib/tax";
import { savedRate } from "../src/lib/rates";
const close = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const taxInput: TaxInputs = {
  year: 2026,
  filing: "single",
  wages: 80000,
  spouseWages: 0,
  business: 0,
  spouseBusiness: 0,
  interest: 0,
  dividends: 0,
  qualified: 0,
  shortGains: 0,
  longGains: 0,
  socialSecurity: 0,
  other: 0,
  adjustments: 0,
  itemized: 0,
  salt: 0,
  age65: 0,
  tips: 0,
  overtime: 0,
  carInterest: 0,
  children: 0,
  dependents: 0,
  studentInterest: 0,
  amtAdjustments: 0,
  credits: 0,
  qualifiedBusiness: false,
};
const run = (
  id: string,
  mode: string,
  inputs: Record<string, string | number>,
) => {
  const c = calculators.find((x) => x.id === id)!,
    m = c.modes.find((x) => x.id === mode)!;
  return runCalculation(id, mode, {
    ...defaults(m),
    ...Object.fromEntries(
      Object.entries(inputs).map(([k, v]) => [k, String(v)]),
    ),
  });
};
const value = (r: ReturnType<typeof run>, label: string) =>
  r.metrics.find((x) => x.label === label)!.value;
test("2026 ordinary tax and payroll independent fixture", () => {
  const t = federalTax(taxInput);
  close(t.taxable, 63900);
  close(t.regular, 8770);
  close(t.federal, 8770);
  close(t.payrollSS, 4960);
  close(t.medicare, 1160);
});
test("2025 joint bracket uses 96,950 boundary", () => {
  const t = federalTax({
    ...taxInput,
    year: 2025,
    filing: "married_joint",
    wages: 128450,
  });
  close(t.taxable, 96950);
  close(t.regular, 23850 * 0.1 + (96950 - 23850) * 0.12);
});
test("capital losses are capped and cross-netted before preferential taxation", () => {
  const huge = federalTax({ ...taxInput, shortGains: -100000 });
  close(huge.agi, 77000);
  const cross = federalTax({ ...taxInput, shortGains: -1000, longGains: 5000 });
  close(cross.agi, 84000);
  close(cross.regular, 8770 + 4000 * 0.15);
});
test("2026 senior deduction phaseout independently", () => {
  const t = federalTax({ ...taxInput, wages: 85000, age65: 1 });
  close(t.senior, 5400);
  close(t.standard, 18150);
});
test("OBBBA phaseout floor/ceil boundary", () => {
  const tips = federalTax({ ...taxInput, wages: 150999, tips: 25000 }),
    tipsNext = federalTax({ ...taxInput, wages: 151000, tips: 25000 }),
    car = federalTax({ ...taxInput, wages: 100001, carInterest: 10000 });
  close(tips.tips, 25000);
  close(tipsNext.tips, 24900);
  close(car.car, 9800);
});
test("2026 dependent-care phaseouts and earned-income ceiling", () => {
  const low = federalTax({
      ...taxInput,
      wages: 15000,
      careExpenses: 3000,
      carePeople: 1,
    }),
    mid = federalTax({
      ...taxInput,
      wages: 75000,
      careExpenses: 3000,
      carePeople: 1,
    }),
    high = federalTax({
      ...taxInput,
      wages: 105000,
      careExpenses: 3000,
      carePeople: 1,
    });
  close(low.careCredit, 1500);
  close(mid.careCredit, 1050);
  close(high.careCredit, 600);
  const joint = federalTax({
    ...taxInput,
    filing: "married_joint",
    careExpenses: 6000,
    carePeople: 2,
  });
  close(joint.careCredit, 0);
});
test("education credits respect phaseout, annual LLC maximum, and selected refundable eligibility", () => {
  const a = federalTax({
    ...taxInput,
    wages: 60000,
    educationExpenses: [4000],
    educationTypes: ["American Opportunity"],
    aotcRefundable: true,
  });
  close(a.educationCredit, 1500);
  close(a.educationRefund, 1000);
  const llc = federalTax({
    ...taxInput,
    wages: 60000,
    educationExpenses: [10000, 10000],
    educationTypes: ["Lifetime Learning", "Lifetime Learning"],
  });
  close(llc.educationCredit, 2000);
});
test("zero interest and full early payoff cap final payment", () => {
  const r = run("amortization", "schedule", {
    principal: 12000,
    rate: 0,
    years: 1,
    months: 0,
    extra_monthly: 12000,
  });
  close(value(r, "Total interest"), 0);
  close(value(r, "Total payments"), 12000);
  assert.equal(r.rows?.length, 1);
});
test("vehicle inverse price produces the same forward payment", () => {
  const reverse = run("auto-loan", "price", { payment: 600 }),
    price = value(reverse, "Vehicle price"),
    forward = run("auto-loan", "payment", { price });
  close(value(forward, "Payment per period"), 600);
});
test("lease payment/rate roundtrip", () => {
  const r = run("lease", "rate", { rate: 6 }),
    monthly = value(r, "Monthly payment"),
    back = run("lease", "payment", { payment: monthly });
  close(value(back, "Nominal annual rate"), 6, 1e-6);
});
test("partial year sum-of-years splits service years consistently", () => {
  const r = run("depreciation", "syd", {
    cost: 6000,
    salvage: 0,
    life: 3,
    first_months: 6,
  });
  close(Number(r.rows![0][1]), 1500);
  close(Number(r.rows![1][1]), 2500);
  close(Number(r.rows![2][1]), 1500);
  close(Number(r.rows![3][1]), 500);
});
test("zero saving, impossible IRR and invalid percentage handling", () => {
  assert.throws(() =>
    run("irr", "irregular", { initial: 0, flows: "100,200" }),
  );
  assert.throws(() => run("mortgage", "monthly", { down: 110 }));
  assert.throws(() => run("income-tax", "federal", { children: 1.5 }));
});
test("offline saved rates preserve dated reference direction without network access", () => {
  const forward = savedRate("USD", "EUR")!, reverse = savedRate("EUR", "USD")!;
  assert.equal(forward.stale, true);assert.match(forward.source, /not live/);
  assert.ok(forward.date);close(forward.rate * reverse.rate, 1);
  assert.equal(savedRate("ZZZ", "EUR"), null);assert.equal(savedRate("BTC", "EUR"), null);
});
test("mortgage cost units and independent growth", () => {
  const r = run("mortgage", "monthly", {
    tax: 1,
    tax_unit: "Percent of home value",
    tax_growth: 10,
    insurance: 0,
    hoa: 0,
    other: 0,
    pmi: 0,
  });
  close(Number(r.rows![0][6]), 4000 / 12);
  close(Number(r.rows![12][6]), 4400 / 12);
});
test("HELOC zero-fee APR preserves nominal loan rate", () => {
  const r = run("heloc", "draw-repay", {
    principal: 50000,
    rate: 8,
    draw: 10,
    years: 20,
    closing: 0,
    charge: 0,
  });
  close(value(r, "Nominal APR including fees"), 8, 1e-6);
});
test("annual and monthly savings increases are independent", () => {
  const base = run("savings", "accumulation", {
    principal: 0,
    years: 2,
    months: 0,
    rate: 0,
    annual: 1000,
    monthly: 100,
    annual_increase: 10,
    monthly_increase: 0,
  });
  close(value(base, "Ending balance"), 4500);
});
test("simple interest supports explicit monthly units", () => {
  const r = run("simple-interest", "balance", {
    principal: 10000,
    rate: 5,
    rate_unit: "Monthly",
    years: 12,
    term_unit: "Months",
  });
  close(value(r, "Balance"), 16000);
});
test("dollar and percentage coupons price the same bond", () => {
  const a = run("bond", "price", {
      face: 1000,
      coupon: 5,
      coupon_unit: "Percent",
    }),
    b = run("bond", "price", {
      face: 1000,
      coupon: 50,
      coupon_unit: "Dollars",
    });
  close(value(a, "price"), value(b, "price"));
});
test("regression: annual and weekly salary inputs are already holiday-adjusted", () => {
  for (const [frequency, salary] of [
    ["Annually", 56400],
    ["Weekly", 56400 / 52],
  ] as const) {
    const r = run("salary", "conversion", {
      salary,
      frequency,
      hours: 40,
      days: 5,
      holidays: 10,
      vacation: 15,
    });
    close(value(r, "Adjusted annual salary"), 56400);
    close(value(r, "Unadjusted annual salary"), 62400);
  }
});
test("regression: 2025 joint student-interest phaseout ends at 200,000", () => {
  const t = federalTax({
    ...taxInput,
    year: 2025,
    filing: "married_joint",
    wages: 200000,
    studentInterest: 2500,
  });
  close(t.student, 0);
});
test("regression: 401k deferral does not reduce Additional Medicare wages", () => {
  const r = run("take-home-paycheck", "paycheck", {
    wages: 250000,
    pretax: 20000,
    state_rate: 0,
    local_rate: 0,
  });
  close(value(r, "Annual take-home pay"), 169582);
});
test("regression: senior deduction is added back for AMT", () => {
  const t = federalTax({
    ...taxInput,
    wages: 100000,
    age65: 1,
    itemized: 80000,
    amtAdjustments: 100000,
  });
  close(t.senior, 4500);
  close(t.federal, 7774);
});
test("regression: IRA maximum contributions use an equivalent after-tax Roth basis", () => {
  const r = run("ira", "comparison", {
    age: 40,
    retire: 41,
    balance: 0,
    contribution: 0,
    max: "Yes",
    return: 0,
    tax: 25,
    retire_tax: 0,
  });
  close(value(r, "Traditional IRA pre-tax balance"), 7500);
  close(value(r, "Comparable taxable investment balance"), 5625);
  close(value(r, "Roth balance with equivalent after-tax contribution"), 5625);
});
test("regression: IRA pre-tax initial balance is converted for alternatives", () => {
  const r = run("ira", "comparison", {
    age: 40,
    retire: 41,
    balance: 10000,
    contribution: 0,
    max: "No",
    return: 0,
    tax: 25,
    retire_tax: 0,
  });
  close(value(r, "Comparable taxable investment balance"), 7500);
  close(value(r, "Roth balance with equivalent after-tax contribution"), 7500);
});
test("regression: employer match is based on actual capped employee contribution", () => {
  const r = run("401k", "projection", {
    age: 40,
    retire: 41,
    life: 90,
    salary: 1000000,
    balance: 0,
    contribution: 10,
    match: 100,
    match_limit: 10,
    salary_growth: 0,
    return: 0,
  });
  close(value(r, "Starting balance plus employee contributions"), 24500);
  close(value(r, "Employer contributions"), 24500);
});
test("regression: RMD projection grows starting balance before year-end withdrawal", () => {
  const r = run("rmd", "annual", {
    birth: 1951,
    year: 2026,
    balance: 300000,
    return: 5,
    projection: 2,
  });
  close(Number(r.rows![1][2]), 300000 * 1.05 - 300000 / 24.6);
  close(Number(r.rows![1][4]), (300000 * 1.05 - 300000 / 24.6) / 23.7);
});
test("regression: LTV-based PMI does not expire under unrelated duration control", () => {
  const r = run("mortgage", "monthly", {
    pmi_method: "Manual",
    price: 100000,
    down: 3,
    rate: 15,
    years: 30,
    pmi: 1200,
    pmi_unit: "Dollars",
    pmi_years: 11,
    pmi_policy: "Cancel at 80% original LTV",
    tax: 0,
    insurance: 0,
    hoa: 0,
    other: 0,
  });
  close(Number(r.rows![132][6]), 100);
});
test("regression: first-month total includes effective extra principal", () => {
  const r = run("mortgage", "monthly", {
    extra_monthly: 500,
    tax: 0,
    insurance: 0,
    hoa: 0,
    other: 0,
    pmi: 0,
  });
  close(value(r, "Initial monthly total"), Number(r.rows![0][7]));
});

test("401k annual iteration sums changing salaries and adds contributions at year end", () => {
  const r = run("401k", "projection", {
    age: 48,
    retire: 52,
    life: 90,
    salary: 100000,
    balance: 0,
    contribution: 10,
    match: 100,
    match_limit: 6,
    salary_growth: 10,
    return: 10,
  });
  assert.equal(r.rows!.length, 4);
  for (const [i, expected] of [10000, 11000, 12100, 13310].entries())
    close(Number(r.rows![i][2]), expected);
  close(value(r, "Starting balance plus employee contributions"), 46410);
  close(value(r, "Employer contributions"), 27846);
  close(value(r, "Projected 401(k) balance"), 85184);
  close(
    value(r, "Starting balance plus employee contributions"),
    r.rows!.reduce((s, row) => s + Number(row[2]), 0),
  );
});
test("401k annual caps follow starting age and no contributions after retirement", () => {
  const inputs = {
    age: 49,
    retire: 51,
    life: 90,
    salary: 1000000,
    balance: 100000,
    contribution: 100,
    match: 0,
    salary_growth: 0,
    return: 0,
  };
  const r = run("401k", "projection", inputs);
  close(Number(r.rows![0][2]), 24500);
  close(Number(r.rows![1][2]), 32500);
  close(value(r, "Starting balance plus employee contributions"), 157000);
  const retired = run("401k", "projection", { ...inputs, retire: 49 });
  assert.equal(retired.rows!.length, 0);
  close(value(retired, "Starting balance plus employee contributions"), 100000);
  close(value(retired, "Projected 401(k) balance"), 100000);
});

test("401k contribution summary includes starting balance once without future returns or employer match", () => {
  const r = run("401k", "projection", {
    age: 35,
    retire: 37,
    life: 90,
    salary: 80000,
    balance: 100000,
    contribution: 10,
    match: 50,
    match_limit: 3,
    salary_growth: 3,
    return: 6,
  });
  close(value(r, "Starting balance plus employee contributions"), 116240);
  close(value(r, "Employer contributions"), 2436);
  close(value(r, "Projected 401(k) balance"), 131588);
  close(Number(r.rows![0][2]), 8000);
  close(Number(r.rows![1][2]), 8240);
  const zero = run("401k", "projection", {
    age: 35,
    retire: 36,
    life: 90,
    balance: 100000,
    contribution: 0,
    match: 0,
    return: 6,
  });
  close(value(zero, "Starting balance plus employee contributions"), 100000);
  close(value(zero, "Projected 401(k) balance"), 106000);
});
