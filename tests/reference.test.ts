import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
import joint from "../src/lib/joint-rmd-table.json";
import cpi from "../src/lib/cpi-data.json";
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
const value = (r: ReturnType<typeof run>, label: string) => {
  const m = r.metrics.find((x) => x.label === label || (label.startsWith("IRR ") && x.label === "Annual " + label));
  assert.ok(m, "Metric not found: " + label);
  return m.value;
};
const close = (a: number, b: number, tol = 0.005) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const cases = JSON.parse(
  fs.readFileSync(
    "docs/financial-clone/research/investment-reference-cases.json",
    "utf8",
  ),
).cases;
for (const c of cases)
  test("source prose: " + c.id, () =>
    close(
      value(run(c.calculator, c.mode, c.inputs), c.expected.metric),
      c.expected.value,
      c.expected.tolerance,
    ),
  );
test("source prose: discount percent and fixed", () => {
  close(
    value(run("discount", "percent", { before: 45, rate: 10 }), "Sale price"),
    40.5,
  );
  close(
    value(run("discount", "amount", { before: 95, saved: 20 }), "Sale price"),
    75,
  );
});
for (const net of [5, 10, 20])
  test("source prose: VAT " + net, () =>
    close(
      value(run("vat", "any-two", { net, rate: 10 }), "VAT amount"),
      net * 0.1,
    ),
  );
for (const [sales, rate, expected] of [
  [100, 3, 3],
  [500000, 3, 15000],
])
  test("source prose: simple commission " + sales, () =>
    close(
      value(run("commission", "commission", { sales, rate }), "Commission"),
      expected,
    ),
  );
for (const [sales, expected] of [
  [25000, 875],
  [50000, 1250],
  [91000, 1865],
])
  test("source prose: base commission " + sales, () =>
    close(
      value(
        run("commission", "tiered", {
          sales,
          base: 500,
          tiers: "1000000, 1.5",
        }),
        "Total earnings",
      ),
      expected,
    ),
  );
test("source prose: progressive commissions", () =>
  close(
    value(
      run("commission", "tiered", {
        sales: 27000,
        base: 0,
        tiers: "20000,3\n25000,5\n30000,10",
      }),
      "Commission",
    ),
    1050,
  ));
test("source prose: profit margin", () =>
  close(
    value(run("margin", "cost", { revenue: 100, margin: 30 }), "Profit"),
    30,
  ));
test("source prose: hourly salary", () => {
  const r = run("salary", "conversion", {
    salary: 30,
    frequency: "Hourly",
    hours: 40,
    days: 5,
    holidays: 10,
    vacation: 15,
  });
  close(value(r, "Unadjusted annual salary"), 62400);
  close(value(r, "Adjusted annual salary"), 56400);
});
test("source prose: maximum HELOC", () =>
  close(
    value(
      run("heloc", "maximum-credit", {
        value: 500000,
        mortgage: 210000,
        ltv: 80,
      }),
      "Estimated maximum HELOC",
    ),
    190000,
  ));
test("source prose: DTI 48% and zero", () => {
  close(
    value(
      run("debt-to-income-ratio", "ratio", { v0: 1000, v4: 480 }),
      "Total debt-to-income ratio",
    ),
    48,
  );
  close(
    value(
      run("debt-to-income-ratio", "ratio", { v0: 1000, v4: 0 }),
      "Total debt-to-income ratio",
    ),
    0,
  );
});
test("IRS joint life table known example and complete symmetric table", () => {
  close(joint.factors["75"]["64"], 25.3);
  const factors: Record<string, Record<string, number>> = joint.factors;
  assert.equal(Object.keys(factors).length, 101);
  for (let a = 20; a <= 120; a++)
    for (let b = 20; b <= 120; b++) assert.equal(factors[a][b], factors[b][a]);
  close(
    value(
      run("rmd", "annual", {
        birth: 1951,
        year: 2026,
        balance: 500000,
        spouse: "Yes",
        spouse_birth: 1962,
      }),
      "Annual RMD",
    ),
    500000 / 25.3,
  );
});
test("BLS historical data handles official missing periods", () => {
  assert.equal(cpi.records.filter((x) => x.period === "M13").length, 113);
  assert.throws(
    () =>
      run("inflation", "historical", {
        start_year: 2025,
        start_period: "10",
        end_year: 2026,
        end_period: "09",
      }),
    /No published CPI/,
  );
  close(
    value(
      run("inflation", "historical", {
        amount: 100,
        start_year: 1913,
        start_period: "Annual average",
        end_year: 2025,
        end_period: "Annual average",
      }),
      "Equivalent purchasing-power amount",
    ),
    (100 * 321.943) / 9.9,
  );
});
