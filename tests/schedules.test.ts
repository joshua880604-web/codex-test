import { test } from "node:test";
import assert from "node:assert/strict";
import { yearlySchedule } from "../src/lib/schedules";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
const close = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 0.005, `${a} != ${b}`);
function calculate(
  id: string,
  mode: string,
  overrides: Record<string, string> = {},
) {
  const m = calculators
    .find((c) => c.id === id)!
    .modes.find((m) => m.id === mode)!;
  return runCalculation(id, mode, { ...defaults(m), ...overrides });
}
test("Yearly grouping conserves flows and uses last balance, including partial years", () => {
  const rows = Array.from({ length: 14 }, (_, i) => [
    i + 1,
    100,
    10,
    90,
    1260 - 90 * (i + 1),
  ]);
  const result = yearlySchedule(rows, 12, [1, 2, 3], [4]);
  assert.deepEqual(result, [
    [1, 1200, 120, 1080, 180],
    [2, 200, 20, 180, 0],
  ]);
  assert.throws(() => yearlySchedule(rows, 0, [1], [4]));
});
test("Annual loan tables follow selected weekly repayment frequency", () => {
  const result = calculate("loan", "amortized", {
    principal: "5200",
    years: "1",
    months: "0",
    rate: "0",
    pay: "Weekly",
  });
  assert.equal(result.rows!.length, 52);
  assert.equal(result.annualRows!.length, 1);
  close(Number(result.annualRows![0][1]), 5200);
  close(Number(result.annualRows![0][4]), 0);
});
test("Mortgage annual tables retain dates and sum taxes separately", () => {
  const m = calculators.find((c) => c.id === "mortgage")!.modes[0];
  const result = calculate("mortgage", m.id);
  assert.equal(result.annualRows![0][1], result.rows![11][1]);
  for (const col of [2, 3, 4, 6, 7])
    close(
      Number(result.annualRows![0][col]),
      result.rows!.slice(0, 12).reduce((s, r) => s + Number(r[col]), 0),
    );
});
test("DDB matches Microsoft 150% declining-balance example without terminal write-down", () => {
  const result = calculate("depreciation", "declining", {
    cost: "2400",
    salvage: "300",
    life: "10",
    factor: "1.5",
  });
  close(Number(result.rows![1][1]), 306);
  close(Number(result.rows!.at(-1)![3]), 2400 * 0.85 ** 10);
});
test("DDB matches Microsoft double-declining final-period example", () => {
  const result = calculate("depreciation", "declining", {
    cost: "2400",
    salvage: "300",
    life: "10",
    factor: "2",
  });
  close(Number(result.rows![0][1]), 480);
  close(Number(result.rows![9][1]), 22.1225472);
  assert.throws(
    () => calculate("depreciation", "straight", { life: "2.5" }),
    /useful life/,
  );
});

import { autoTaxBase } from "../src/lib/auto-tax";
test("Verified auto tax treatments distinguish rebates and Michigan capped trade credit", () => {
  close(autoTaxBase(40000, 20000, 2000, "California", 2026, true, true), 40000);
  close(autoTaxBase(40000, 20000, 2000, "Texas", 2026, false, false), 18000);
  close(autoTaxBase(40000, 20000, 2000, "Michigan", 2026, false, true), 28000);
  close(autoTaxBase(40000, 20000, 2000, "Michigan", 2029, false, true), 20000);
  close(autoTaxBase(40000, 20000, 2000, "Manual", 2026, true, true), 18000);
  assert.throws(() =>
    autoTaxBase(40000, 20000, 2000, "Michigan", 2024, true, true),
  );
});

import { firstFiscalFraction } from "../src/lib/depreciation";
test("Actual-days fiscal proration includes leap days and rejects out-of-year service", () => {
  close(firstFiscalFraction("2024-01-01", "2024-12-31"), 1);
  close(firstFiscalFraction("2024-07-01", "2024-12-31"), 184 / 366);
  close(firstFiscalFraction("2026-07-01", "2027-06-30"), 1);
  assert.throws(() => firstFiscalFraction("2025-12-31", "2026-12-31"));
  assert.throws(() => firstFiscalFraction("2026-02-30", "2026-12-31"));
  const result = calculate("depreciation", "straight", {
    cost: "12000",
    salvage: "0",
    life: "2",
    convention: "Actual days",
    service_date: "2024-07-01",
    fiscal_end: "2024-12-31",
  });
  close(Number(result.rows![0][1]), (6000 * 184) / 366);
  close(Number(result.rows!.at(-1)![3]), 0);
});
test("Bond month-end coupons stay anchored to February end instead of rolling into March", () => {
  const result = calculate("bond", "dated", {
    settlement: "2026-03-01",
    maturity: "2027-08-31",
    frequency: "Semiannually",
    daycount: "Actual/Actual",
  });
  assert.equal(
    result.metrics.find((m) => m.label === "Interest accrued days")!.value,
    1,
  );
});

test("Biweekly payoff and weekly business-loan summaries use their actual period counts", () => {
  const payoff = calculate("mortgage-payoff", "remaining-biweekly");
  close(
    Number(payoff.annualRows![0][1]),
    payoff.rows!.slice(0, 26).reduce((s, r) => s + Number(r[1]), 0),
  );
  const business = calculate("business-loan", "repayment", {
    pay: "Weekly",
    years: "1",
    months: "0",
  });
  assert.equal(business.rows!.length, 52);
  assert.equal(business.annualRows!.length, 1);
});
test("Cash-back comparison includes different rebate tax bases and upfront costs", () => {
  const tx = calculate("cash-back-or-low-interest", "compare", {
    price: "40000",
    cashback: "2000",
    tax: "6",
    tax_state: "Texas",
    finance_fees: "No",
  });
  close(
    tx.metrics.find((m) => m.label === "Sales tax with cash back")!.value,
    2280,
  );
  close(
    tx.metrics.find((m) => m.label === "Sales tax with low rate")!.value,
    2400,
  );
  const ca = calculate("cash-back-or-low-interest", "compare", {
    price: "40000",
    cashback: "2000",
    tax: "6",
    tax_state: "California",
  });
  close(
    ca.metrics.find((m) => m.label === "Sales tax with cash back")!.value,
    2400,
  );
});
