import { test } from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
const blank = { rate: "", net: "", gross: "", tax: "" };
const run = (values: Record<string, string | undefined>) =>
  runCalculation("vat", "any-two", {
    ...blank,
    ...Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value ?? ""]),
    ),
  });
for (const [name, inputs] of Object.entries({
  "rate + net": { rate: "20", net: "100" },
  "rate + gross": { rate: "20", gross: "120" },
  "rate + tax": { rate: "20", tax: "20" },
  "net + gross": { net: "100", gross: "120" },
  "net + tax": { net: "100", tax: "20" },
  "gross + tax": { gross: "120", tax: "20" },
}))
  test("VAT any two: " + name, () => {
    const result = run(inputs);
    const values = result.metrics.map((m) => m.value);
    for (const [index, expected] of [100, 20, 120, 20].entries())
      assert.ok(Math.abs(values[index] - expected) < 1e-9);
  });
for (const inputs of [
  {},
  { net: "100" },
  { net: "100", gross: "120", rate: "20" },
  { net: "100", gross: "120", rate: "20", tax: "20" },
])
  test("VAT requires exactly two known values: " + JSON.stringify(inputs), () =>
    assert.throws(() => run(inputs), /exactly two/),
  );
for (const inputs of [
  { net: "100", gross: "80" },
  { gross: "10", tax: "20" },
  { net: "0", tax: "5" },
  { rate: "0", tax: "5" },
  { net: "0", gross: "5" },
])
  test("VAT rejects inconsistent amounts: " + JSON.stringify(inputs), () =>
    assert.throws(() => run(inputs)),
  );
for (const inputs of [
  { net: "0", gross: "0" },
  { net: "0", tax: "0" },
  { gross: "0", tax: "0" },
  { rate: "0", tax: "0" },
])
  test(
    "VAT identifies indeterminate zero pairs: " + JSON.stringify(inputs),
    () => assert.throws(() => run(inputs), /unique answer/),
  );
for (const inputs of [
  { rate: "0", net: "100" },
  { rate: "0", gross: "100" },
  { net: "100", gross: "100" },
  { net: "100", tax: "0" },
  { gross: "100", tax: "0" },
])
  test("VAT accepts unique zero-tax pair: " + JSON.stringify(inputs), () => {
    const r = run(inputs);
    assert.equal(r.metrics[0].value, 100);
    assert.equal(r.metrics[1].value, 0);
    assert.equal(r.metrics[2].value, 100);
    assert.equal(r.metrics[3].value, 0);
  });
for (const inputs of [
  { rate: "20", net: "0" },
  { rate: "20", gross: "0" },
  { rate: "20", tax: "0" },
])
  test(
    "VAT keeps a known positive rate when prices are zero: " +
      JSON.stringify(inputs),
    () => {
      const r = run(inputs);
      assert.equal(r.metrics[0].value, 0);
      assert.equal(r.metrics[3].value, 20);
    },
  );
test("VAT rejects negative and nonnumeric input", () => {
  assert.throws(() => run({ net: "-1", rate: "20" }));
  assert.throws(() => run({ net: "abc", rate: "20" }));
});
test("VAT default form has four optional fields with exactly two filled", () => {
  const c = calculators.find((c) => c.id === "vat")!;
  assert.equal(c.modes.length, 1);
  assert.equal(c.modes[0].fields.length, 4);
  assert.ok(c.modes[0].fields.every((f) => f.optional));
  assert.equal(
    Object.values(defaults(c.modes[0])).filter((v) => v !== "").length,
    2,
  );
});
