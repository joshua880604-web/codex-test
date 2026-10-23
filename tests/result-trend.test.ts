import { test } from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators/index";
import { resultTrend, trendBounds } from "../src/lib/result-trend";
import type { Result } from "../src/lib/types";

function run(id: string, mode: string, overrides: Record<string, string> = {}) {
  const m = calculators.find(c => c.id === id)!.modes.find(m => m.id === mode)!;
  const values = { ...defaults(m), ...overrides }, result = runCalculation(id, mode, values);
  return { values, result, trend: resultTrend(id, mode, values, result) };
}
test("growth graph uses computed rows and separates contributions from negative returns", () => {
  const x = run("compound-interest", "growth", { principal: "1000", years: "2", rate: "-10", compound: "Annually", monthly: "0", annual: "0" });
  assert.deepEqual(x.trend!.points[0], { x: 0, balance: 1000, contributions: 1000 });
  const last = x.trend!.points.at(-1)!;
  assert.equal(last.balance, x.result.metrics.find(m => m.label === "Ending balance")!.value);
  assert.ok(Math.abs(last.balance - 810) < 1e-8);
  assert.equal(last.contributions, 1000);
  assert.equal(last.x, 2);
});
test("investment solving modes graph solved starting amount and actual stopping month", () => {
  for (const mode of ["end", "contribution", "return", "starting", "length"]) {
    const x = run("investment", mode), last = x.trend!.points.at(-1)!;
    assert.equal(x.trend!.points[0].balance, x.result.metrics.find(m => m.label === "Starting amount")!.value);
    assert.equal(last.x, Number(x.result.rows!.at(-1)![0]) / 12);
    assert.equal(last.balance, x.result.rows!.at(-1)![3]);
  }
  const solved = run("investment", "starting");
  assert.equal(solved.values.principal, undefined);
  assert.ok(solved.trend!.points[0].balance > 20000);
  const length = run("investment", "length");
  assert.equal(length.trend!.points.at(-1)!.x, 188 / 12);
  assert.notEqual(length.trend!.points.at(-1)!.balance, Number(length.values.end));
});
test("loan graph uses payment count for all payment frequencies and reconciles balance", () => {
  for (const pay of ["Annually", "Monthly", "Biweekly", "Weekly", "Daily"]) {
    const x = run("loan", "amortized", { pay });
    assert.equal(x.trend!.xLabel, "Payment number");
    assert.deepEqual(x.trend!.points[0], { x: 0, balance: 100000 });
    assert.equal(x.trend!.points.at(-1)!.x, x.result.rows!.at(-1)![0]);
    assert.equal(x.trend!.points.at(-1)!.balance, x.result.rows!.at(-1)![4]);
  }
});
test("conversions and modes without schedules do not receive invented curves", () => {
  for (const [id, mode] of [["compound-interest", "conversion"], ["loan", "bond"], ["loan", "deferred"]]) assert.equal(run(id, mode).trend, null);
  assert.equal(resultTrend("savings", "growth", {}, { metrics: [] }), null);
});
test("zero and negative chart domains remain finite and include zero", () => {
  assert.deepEqual(trendBounds([{ x: 0, balance: 0 }, { x: 1, balance: 0 }]), { min: 0, max: 1 });
  assert.deepEqual(trendBounds([{ x: 0, balance: -100 }, { x: 1, balance: -500, contributions: 20 }]), { min: -500, max: 20 });
  const flat = run("compound-interest", "growth", { principal: "0", monthly: "0", annual: "0", rate: "0" });
  assert.ok(flat.trend!.points.every(p => p.balance === 0));
  const zero = run("compound-interest", "growth", { years: "0", months: "0" });
  assert.equal(zero.trend, null);
});
test("sampling bounds SVG work while retaining endpoints and balance/deposit extrema", () => {
  const rows = Array.from({ length: 12000 }, (_, i) => [i + 1, i === 5000 ? 40000 : 1000, 0, i === 5001 ? -5000 : 2000]);
  const result: Result = { metrics: [{ label: "Starting amount", value: 1000 }], columns: ["Month", "Contributions", "Net earnings", "Balance"], rows };
  const trend = resultTrend("investment", "end", {}, result)!;
  assert.equal(trend.sampled, true); assert.ok(trend.points.length <= 194);
  assert.equal(trend.points[0].x, 0); assert.equal(trend.points.at(-1)!.x, 1000);
  assert.ok(trend.points.some(p => p.contributions === 40000));
  assert.ok(trend.points.some(p => p.balance === -5000));
  assert.ok(trend.points.every((p, i) => !i || p.x > trend.points[i - 1].x));
});
test("invalid or mismatched schedules fail closed without hiding original result data", () => {
  const { result, values } = run("loan", "amortized");
  assert.equal(resultTrend("loan", "amortized", {}, result)!.points[0].balance, 100000);
  for (const rows of [[[1, 1, 1, 1, NaN]], [[0, 1, 1, 1, 100]], [[1, 1, 1, 1, 100], [1, 1, 1, 1, 99]]]) assert.equal(resultTrend("loan", "amortized", values, { ...result, rows }), null);
  assert.equal(resultTrend("loan", "amortized", values, { ...result, columns: ["Wrong header"] }), null);
});
