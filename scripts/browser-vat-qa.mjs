import fs from "node:fs/promises";
const { chromium } =
  await import("/opt/codex/cua_node/lib/node_modules/playwright/index.mjs");
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const labels = {
  rate: "VAT rate",
  net: "Net price",
  gross: "Gross price",
  tax: "Tax amount",
};
const checks = [];
async function fill(values) {
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  for (const [k, v] of Object.entries(values))
    await page.getByLabel(labels[k], { exact: true }).fill(v);
}
async function expectMetric(label, value) {
  const metric = page
    .locator(".metric")
    .filter({ has: page.getByText(label, { exact: true }) });
  await metric.waitFor();
  const actual = await metric.locator("strong").innerText();
  if (actual !== value) throw new Error(label + ": " + actual + " != " + value);
}
try {
  await page.goto("http://127.0.0.1:3000/vat-calculator.html");
  if (await page.getByRole("tab").count())
    throw new Error("VAT should have one unified form");
  if ((await page.locator("form input").count()) !== 4)
    throw new Error("Expected four inputs");
  for (const values of [
    { rate: "20", net: "100" },
    { rate: "20", gross: "120" },
    { rate: "20", tax: "20" },
    { net: "100", gross: "120" },
    { net: "100", tax: "20" },
    { gross: "120", tax: "20" },
  ]) {
    await fill(values);
    const last = Object.keys(values).at(-1);
    await page.getByLabel(labels[last], { exact: true }).press("Enter");
    await expectMetric("Net amount", "$100.00");
    await expectMetric("VAT amount", "$20.00");
    await expectMetric("Gross amount", "$120.00");
    await expectMetric("VAT rate", "20.0000%");
    checks.push({ inputs: values, result: "passed" });
  }
  for (const [values, error] of [
    [{}, "exactly two"],
    [{ net: "100" }, "exactly two"],
    [{ net: "100", gross: "120", tax: "20" }, "exactly two"],
    [{ net: "100", gross: "80" }, "at least"],
    [{ gross: "10", tax: "20" }, "cannot exceed"],
    [{ rate: "0", tax: "0" }, "unique answer"],
  ]) {
    await fill(values);
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    await page.locator('.error[role="alert"]').waitFor();
    if (!(await page.locator(".error").innerText()).includes(error))
      throw new Error("Unexpected error");
    if (await page.locator(".result").count())
      throw new Error("Stale result after invalid inputs");
    checks.push({ inputs: values, error, result: "passed" });
  }
  await fill({ rate: "0", gross: "100" });
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expectMetric("VAT amount", "$0.00");
  checks.push("Zero-rate calculation");
  await fill({ gross: "240", tax: "40" });
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expectMetric("Net amount", "$200.00");
  await page
    .getByRole("button", { name: "Share calculation", exact: true })
    .click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(shared);
  await page.getByLabel("Net price", { exact: true }).waitFor();
  await page.waitForFunction(
    () => document.querySelector('input[id$="-net"]').value === "",
  );
  await expectMetric("Net amount", "$200.00");
  checks.push(
    "Shared query retains exactly two known values without default injection",
  );
  await page.goto(
    "http://127.0.0.1:3000/vat-calculator.html?mode=tax&tax=40&rate=20",
  );
  await page.waitForFunction(
    () => document.querySelector('input[id$="-tax"]').value === "40",
  );
  await expectMetric("Net amount", "$200.00");
  checks.push("Legacy VAT shared links retain input values");
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
    )
      throw new Error("Mobile overflow");
    checks.push({ width, result: "no overflow" });
  }
  await page.screenshot({
    path: "docs/financial-clone/evidence/vat-mobile.png",
    fullPage: true,
  });
  if (errors.length) throw new Error(errors.join("\n"));
  await fs.writeFile(
    "docs/financial-clone/evidence/browser-vat-qa.json",
    JSON.stringify(
      {
        passed: true,
        tested_at: new Date().toISOString(),
        checks,
        errors,
        source_form_submission: "unverified",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, checks: checks.length }));
} finally {
  await browser.close();
}
