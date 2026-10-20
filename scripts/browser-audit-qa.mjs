import fs from "node:fs/promises";
const { chromium } =
  await import("/opt/codex/cua_node/lib/node_modules/playwright/index.mjs");
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const cases = [
  {
    route: "retirement-calculator",
    mode: "saving",
    inputs: { age: 35, retire: 67, target: 600000, balance: 30000, return: 6 },
    expected: {
      "Required monthly saving": "$362.74",
      "Annual total of monthly savings": "$4,352.89",
      "Required year-end annual saving": "$4,471.33",
    },
  },
  {
    route: "retirement-calculator",
    mode: "required",
    inputs: {
      age: 65,
      retire: 65,
      life: 66,
      income: 12000,
      replacement: 100,
      other: 0,
      return: 0,
      inflation: 10,
    },
    expected: { "Required savings at retirement": "$12,000.00" },
  },
  {
    route: "investment-calculator",
    mode: "length",
    inputs: { principal: 1000, end: 500, monthly: 0, annual: 0 },
    expected: { "Invest Length": "0", "Ending balance": "$1,000.00" },
  },
  {
    route: "irr-calculator",
    mode: "irregular",
    inputs: { initial: 100, flows: "220,-121" },
    expected: { "Annual IRR 1": "10.0000%" },
  },
  {
    route: "tax-calculator",
    mode: "federal",
    inputs: {
      year: 2025,
      filing: "Married filing separately",
      wages: 80000,
      car: 5000,
    },
    expected: { "Estimated federal income tax": "$7,949.00" },
  },
];
const passed = [];
try {
  for (const c of cases) {
    const query = new URLSearchParams({
      mode: c.mode,
      ...Object.fromEntries(
        Object.entries(c.inputs).map(([k, v]) => [k, String(v)]),
      ),
    });
    await page.goto("http://127.0.0.1:3000/" + c.route + ".html?" + query);
    // Wait for shared-query inputs to hydrate, then explicitly submit those inputs.
    for (const [key, value] of Object.entries(c.inputs)) {
      const input = page.locator(`form [id$="-${key}"]`);
      await input.waitFor({ state: "attached" });
      await page.waitForFunction(
        ({ id, value }) => document.getElementById(id)?.value === value,
        { id: await input.getAttribute("id"), value: String(value) },
      );
    }
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    for (const [label, expected] of Object.entries(c.expected)) {
      const metric = page
        .locator(".metric")
        .filter({
          has: page.locator("span", {
            hasText: new RegExp(
              "^" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
            ),
          }),
        });
      await metric.waitFor();
      const actual = await metric.locator("strong").innerText();
      if (actual !== expected)
        throw new Error(`${c.route}/${label}: ${actual} != ${expected}`);
    }
    passed.push({ route: c.route, mode: c.mode, expected: c.expected });
  }
  if (errors.length) throw new Error(errors.join("\n"));
  await fs.writeFile(
    "docs/financial-clone/evidence/browser-audit-qa.json",
    JSON.stringify(
      {
        passed: true,
        tested_at: new Date().toISOString(),
        checks: passed,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, cases: passed.length }));
} finally {
  await browser.close();
}
