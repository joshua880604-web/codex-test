import test from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
import { calculationLink, sharedInputs } from "../src/lib/sharing";
import { runClientCalculation } from "../src/lib/calculate-client";
import { mortgageCostSummary, mortgagePmiDraft, switchMortgageBasis } from "../src/lib/mortgage-inputs";
import { switchModeInputs } from "../src/lib/mode-navigation";
import { workspaceMetrics } from "../src/lib/workspace-layout";
import type { Values, Result } from "../src/lib/types";
const calc = calculators.find(c => c.id === "mortgage")!;
const mode = calc.modes[0];
const values = (extra: Values = {}) => ({ ...defaults(mode), loan_basis: "Loan amount", loan_amount: "100000", pmi_method: "Manual", tax: "0", insurance: "0", ...extra });
const run = (extra: Values = {}, id = "monthly") => runCalculation(calc.id, id, values(extra));
const metric = (r: Result, label: string) => { const m = r.metrics.find(m => m.label === label); assert.ok(m, label); return m.value; };
const close = (a: number, b: number, tolerance = .005) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test("Direct principal uses the independent 100000/6%/360 annuity control, ignoring purchase drafts", () => {
  const r = run({ price: "bad", down: "bad", down_unit: "bad", appraised_value: "bad" });
  close(metric(r, "Monthly principal & interest"), 599.5505251527524);
  close(metric(r, "Total interest"), 115838.18905499086);
  close(metric(r, "Total out of pocket"), 215838.18905499086);
  assert.ok(!r.metrics.some(m => m.label === "Down payment"));
  assert.equal(r.rows!.length, 360); close(Number(r.rows!.at(-1)![5]), 0);
  close(r.rows!.reduce((s, row) => s + Number(row[4]), 0), 100000);
  assert.match(r.notes!.join(" "), /Past interest, down payment and purchase costs are excluded/);
});
test("Direct zero-rate loan includes entered dollar expenses without requiring a home value", () => {
  const r = run({ loan_amount: "12000", years: "1", rate: "0", tax: "1200", insurance: "300" });
  close(metric(r, "Monthly principal & interest"), 1000); close(metric(r, "Initial monthly total"), 1125);
  close(metric(r, "Total interest"), 0); close(metric(r, "Total out of pocket"), 13500);
});
for (const key of ["tax", "insurance", "hoa", "other"]) test(`Direct ${key} percentage requires an explicit original home value`, () => {
  assert.throws(() => run({ [key]: "1", [key + "_unit"]: "Percent of home value", property_value: "" }), /original home value/);
  const r = run({ [key]: "1", [key + "_unit"]: "Percent of home value", property_value: "240000" });
  close(metric(r, "Initial monthly total"), 799.5505251527524);
});
test("Automatic PMI and manual LTV cancellation cannot infer a home value from a hidden price", () => {
  assert.throws(() => run({ pmi_method: "Automatic estimate", price: "400000" }), /original home value/);
  assert.throws(() => run({ pmi: "1200", pmi_policy: "Cancel at 80% original LTV" }), /original home value/);
  const r = run({ loan_amount: "340000", property_value: "400000", pmi_method: "Automatic estimate" });
  close(metric(r, "Estimated annual PMI rate"), .2); close(metric(r, "Initial monthly PMI"), 56.6666666667);
  close(metric(r, "Original loan-to-value ratio"), 85);
});
test("Direct underwater balance is allowed with a manual quote, without inventing a down payment", () => {
  const r = run({ loan_amount: "320000", property_value: "300000", pmi: "1200", pmi_years: "1" });
  close(metric(r, "Financed loan amount"), 320000); close(metric(r, "Total PMI"), 1200);
});
for (const loan_amount of ["", "0", "-1", "NaN", "Infinity", "1e16"]) test(`Invalid direct principal ${JSON.stringify(loan_amount)} is rejected`, () => {
  assert.throws(() => run({ loan_amount }));
});
test("Extra principal savings match an independent 50-digit Decimal amortization control", () => {
  const r = run({ extra_monthly: "100" });
  close(metric(r, "Total interest"), 75937.93582281066); close(metric(r, "Interest saved with extra payments"), 39900.2532321802);
  assert.equal(metric(r, "Number of payments"), 252); assert.equal(metric(r, "Payments avoided"), 108);
  close(metric(r, "Years to payoff"), 21);
  const s = workspaceMetrics("mortgage", "monthly", r);
  assert.deepEqual([s.primary.label, ...s.highlights.map(m => m.label)], ["Monthly principal & interest", "Initial monthly total", "Total interest", "Interest saved with extra payments", "Payments avoided", "Years to payoff"]);
  close(r.annualRows!.reduce((s, row) => s + Number(row[3]), 0), metric(r, "Total interest"));
});
test("Default purchase results retain their values and ignore a stale direct-loan draft", () => {
  const v = defaults(mode), before = runCalculation("mortgage", "monthly", v);
  const after = runCalculation("mortgage", "monthly", { ...v, loan_amount: "bad", property_value: "bad" });
  assert.deepEqual(after.metrics, before.metrics); close(metric(before, "Monthly principal & interest"), 1918.5616804888076);
});
test("Basis switching keeps principal and converts percentage costs into disclosed dollar amounts", () => {
  const original = { ...defaults(mode), down: "15", tax: "1.2", tax_unit: "Percent of home value" };
  const direct = switchMortgageBasis(original, "Loan amount");
  assert.equal(direct.loan_amount, "340000"); assert.equal(direct.tax, "4800"); assert.equal(direct.tax_unit, "Dollars");
  assert.equal(direct.pmi_method, "Manual"); assert.equal(direct.property_value, "");
  assert.equal(mortgageCostSummary(direct), "$525.00/mo before PMI");
  const roundTrip = switchMortgageBasis({ ...direct, loan_amount: "300000" }, "Home price & down payment");
  close(metric(runCalculation("mortgage", "monthly", roundTrip), "Financed loan amount"), 300000);
  const larger = switchMortgageBasis({ ...direct, loan_amount: "500000" }, "Home price & down payment");
  close(metric(runCalculation("mortgage", "monthly", larger), "Financed loan amount"), 500000);
});
test("Biweekly ignores out-of-scope ownership/PMI drafts while keeping the direct principal", () => {
  const v = { pmi_method: "Automatic estimate", pmi_credit: "bad", property_value: "bad", tax: "bad", tax_unit: "bad", tax_growth: "bad" };
  const r = run(v, "biweekly"); close(metric(r, "Biweekly payment"), 299.7752625763762);
  assert.deepEqual(r.metrics, run({}, "biweekly").metrics);
  const next = switchModeInputs("mortgage", mode, calc.modes[1], values(), {});
  assert.equal(next.values.loan_basis, "Loan amount"); assert.equal(next.values.loan_amount, "100000");
});
test("Each input basis restores its own automatic or quoted PMI settings without overriding principal", () => {
  const purchase = { ...defaults(mode), down: "4" }, purchaseDraft = mortgagePmiDraft(purchase);
  const direct = { ...switchMortgageBasis(purchase, "Loan amount"), loan_amount: "300000", pmi: "1200", pmi_years: "2" };
  const back = switchMortgageBasis(direct, "Home price & down payment", purchaseDraft);
  assert.equal(back.pmi_method, "Automatic estimate"); close(metric(runCalculation("mortgage", "monthly", back), "Financed loan amount"), 300000);
  const again = switchMortgageBasis(back, "Loan amount", mortgagePmiDraft(direct));
  assert.equal(again.pmi_method, "Manual"); assert.equal(again.pmi, "1200"); assert.equal(again.pmi_years, "2");
  close(metric(runCalculation("mortgage", "monthly", again), "Financed loan amount"), 300000);
});
test("Direct links default to manual PMI and all new inputs survive private sharing and lazy calculation", async () => {
  const incoming = sharedInputs(calc, "?loan_basis=Loan+amount&loan_amount=12000&rate=0&years=1", "")!;
  assert.equal(incoming.values.pmi_method, "Manual"); close(metric(runCalculation("mortgage", "monthly", incoming.values), "Monthly principal & interest"), 1000);
  for (const m of calc.modes) {
    const v = values({ property_value: "200000", extra_monthly: "100" });
    const u = new URL(calculationLink("https://calculatorfree.io", "/mortgage-calculator.html", m, v, true));
    const shared = sharedInputs(calc, u.search, u.hash)!;
    assert.deepEqual(shared.values, v);
    assert.deepEqual((await runClientCalculation("mortgage", calc.category, m.id, shared.values)).metrics, runCalculation("mortgage", m.id, v).metrics);
  }
});
