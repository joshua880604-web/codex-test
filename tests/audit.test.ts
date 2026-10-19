import { test } from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
import { irr, payment, future, amortize, sum } from "../src/lib/finance";
const run = (
  id: string,
  mode: string,
  values: Record<string, string | number>,
) => {
  const m = calculators
    .find((c) => c.id === id)!
    .modes.find((m) => m.id === mode)!;
  return runCalculation(id, mode, {
    ...defaults(m),
    ...Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, String(v)]),
    ),
  });
};
const value = (r: ReturnType<typeof run>, label: string) => {
  const metric = r.metrics.find((m) => m.label === label);
  assert.ok(metric, label);
  return metric.value;
};
const close = (a: number, b: number, tolerance = 0.005) =>
  assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);

test("Audit: retirement annual plan is distinct from annual total of monthly deposits", () => {
  const r = run("retirement", "saving", {
    age: 35,
    retire: 67,
    target: 600000,
    balance: 30000,
    return: 6,
  });
  close(value(r, "Required monthly saving"), 362.7406004461587);
  close(value(r, "Annual total of monthly savings"), 4352.887205353904);
  close(value(r, "Required year-end annual saving"), 4471.332292207164);
  const annual = value(r, "Required year-end annual saving");
  let balance = 30000;
  for (let i = 0; i < 32; i++) balance = balance * 1.06 + annual;
  close(balance, 600000);
});
test("Audit: first-year retirement income is not inflated before first withdrawal", () => {
  const r = run("retirement", "required", {
    age: 65,
    retire: 65,
    life: 66,
    income: 12000,
    replacement: 100,
    other: 0,
    return: 0,
    inflation: 10,
  });
  close(value(r, "Required savings at retirement"), 12000);
  const two = run("retirement", "required", {
    age: 65,
    retire: 65,
    life: 67,
    income: 12000,
    replacement: 100,
    other: 0,
    return: 5,
    inflation: 10,
  });
  close(
    value(two, "Required savings at retirement"),
    12000 / 1.05 + 13200 / 1.05 ** 2,
  );
});
test("Audit: first monthly retirement withdrawal has no premature inflation increase", () => {
  const inflation = (1.01 ** 12 - 1) * 100;
  const r = run("retirement", "withdrawal", {
    age: 65,
    retire: 65,
    life: 66,
    balance: 12000,
    saving: 0,
    return: 0,
    inflation,
  });
  const initial = value(r, "Initial monthly withdrawal");
  const annualTotal = Array.from(
    { length: 12 },
    (_, k) => initial * 1.01 ** k,
  ).reduce((a, b) => a + b, 0);
  close(annualTotal, 12000);
  close(initial, 12000 / ((1.01 ** 12 - 1) / 0.01));
});
test("Audit: zero-duration growth and already-met investment target require no waiting", () => {
  const r = run("investment", "end", {
    principal: 1000,
    years: 0,
    months: 0,
    monthly: 100,
    annual: 1000,
  });
  close(value(r, "Ending balance"), 1000);
  close(value(r, "Total contributions"), 1000);
  const solved = run("investment", "length", {
    principal: 1000,
    end: 500,
    monthly: 0,
    annual: 0,
  });
  close(value(solved, "Invest Length"), 0);
  close(value(solved, "Ending balance"), 1000);
});
test("Audit: exact-month investment target avoids an extra month and ignores stale month input", () => {
  const r = run("investment", "length", {
    principal: 1000,
    end: 1000 * 1.01 ** 12,
    monthly: 0,
    annual: 0,
    rate: 12,
    compound: "Monthly",
    months: 6,
  });
  close(value(r, "Invest Length"), 1, 1e-12);
  close(value(r, "Ending balance"), 1000 * 1.01 ** 12);
  assert.ok(
    !calculators
      .find((c) => c.id === "investment")!
      .modes.find((m) => m.id === "length")!
      .fields.some((f) => f.key === "months"),
  );
});
test("Audit: IRR finds a repeated root and two close roots with no grid endpoint sign change", () => {
  const tangent = irr([-100, 220, -121]);
  assert.equal(tangent.length, 1);
  close(tangent[0], 0.1, 1e-8);
  // -100(1+r-a)(1+r-b)=0, with a=1.10 and b=1.101.
  const closeRoots = irr([-100, 220.1, -121.11]);
  assert.equal(closeRoots.length, 2);
  close(closeRoots[0], 0.1, 1e-8);
  close(closeRoots[1], 0.101, 1e-8);
  assert.throws(() => irr([-100, 220, -121.001]), /No IRR/);
});
test("Audit: RMD refuses pre-2022 tables and cannot project negative distributions", () => {
  assert.throws(
    () => run("rmd", "annual", { year: 2020, birth: 1945, balance: 500000 }),
    /2022/,
  );
  assert.throws(
    () => run("rmd", "annual", { year: 2021, birth: 1945, balance: 500000 }),
    /2022/,
  );
  assert.throws(
    () =>
      run("rmd", "annual", {
        year: 2026,
        birth: 1906,
        balance: 10000,
        return: -99,
        projection: 2,
      }),
    /insufficient funds/,
  );
});
test("Audit: observed original annuity schedule independently reproduces year-one and year-ten balances", () => {
  const r = run("annuity", "growth", {
    principal: 20000,
    annual: 10000,
    monthly: 0,
    timing: "Beginning of period",
    rate: 6,
    years: 10,
  });
  close(value(r, "Annuity future value"), 175533.38);
  close(value(r, "Growth"), 55533.38);
  // Source schedule: year one = 31,800; year two = 44,308.
  let balance = 20000;
  for (let i = 0; i < 10; i++) {
    balance = (balance + 10000) * 1.06;
    if (i === 0) close(balance, 31800);
    if (i === 1) close(balance, 44308);
  }
  close(value(r, "Annuity future value"), balance);
});
test("Audit: 120 independent loan/compound cases conserve balances and reproduce direct iteration", () => {
  for (let k = 1; k <= 120; k++) {
    const principal = 1000 + 137 * k,
      rate = (k % 15) / 1200,
      n = 12 + (k % 20) * 12;
    const a = payment(principal, rate, n);
    let balance = principal;
    for (let i = 0; i < n; i++) balance = balance * (1 + rate) - a;
    close(balance, 0, 1e-7);
    const rows = amortize(principal, rate, n);
    close(sum(rows.map((r) => r.principal)), principal, 1e-7);
    let accumulated = principal;
    for (let i = 0; i < n; i++) accumulated = accumulated * (1 + rate) + 17;
    close(future(principal, 17, rate, n), accumulated, 1e-6);
  }
});

import { selfEmployment } from "../src/lib/tax";
test("Audit: ordinary self-employment earnings below $400 owe no SE tax", () => {
  close(selfEmployment(100, 0, 2025), 0);
  close(selfEmployment(400, 0, 2026), 0); // $369.40 net earnings after 92.35% factor.
  close(selfEmployment(500, 0, 2026), 500 * 0.9235 * 0.153);
  const result = run("income-tax", "federal", {
    year: 2025,
    wages: 0,
    business: 100,
  });
  close(
    Number(result.rows!.find((r) => r[0] === "Self-employment tax")![1]),
    0,
  );
});
test("Audit: MFS qualified vehicle interest is allowed by Schedule 1-A Part IV", () => {
  const result = run("income-tax", "federal", {
    year: 2025,
    filing: "Married filing separately",
    wages: 80000,
    car: 5000,
  });
  close(
    Number(
      result.rows!.find((r) => r[0] === "Additional qualified deductions")![1],
    ),
    5000,
  );
});
test("Audit: published SALT worksheet halves the final MFS limit; tips phaseout rounds down", () => {
  const result = run("income-tax", "federal", {
    year: 2025,
    filing: "Married filing separately",
    wages: 260000,
    salt: 40000,
    itemized: 10000,
  });
  close(Number(result.rows!.find((r) => r[0] === "Deduction used")![1]), 28500);
  const tips = run("income-tax", "federal", {
    year: 2025,
    wages: 150001,
    tips: 5000,
    overtime: 5000,
  });
  close(
    Number(
      tips.rows!.find((r) => r[0] === "Additional qualified deductions")![1],
    ),
    10000,
  );
});
