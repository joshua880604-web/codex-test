const { chromium } =
  await import("/opt/codex/cua_node/lib/node_modules/playwright/index.mjs");
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const checks = [];
try {
  await page.goto("http://127.0.0.1:3000/mortgage-calculator.html");
  await page.getByRole("button", { name: "Yearly", exact: true }).click();
  const region = page.getByRole("region", { name: "Calculation detail table" });
  if ((await region.locator("tbody tr").count()) !== 30)
    throw new Error("Expected 30 annual mortgage rows");
  await page
    .getByRole("columnheader", { name: "Loan year", exact: true })
    .waitFor();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV", exact: true }).click();
  const download = await downloadEvent;
  const stream = await download.createReadStream();
  let csv = "";
  for await (const chunk of stream) csv += chunk;
  if (!csv.includes("Loan year") || csv.trim().split("\n").length !== 31)
    throw new Error("CSV does not match yearly selection");
  checks.push("Yearly mortgage table and CSV contain 30 loan years");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  if ((await region.locator("tbody tr").count()) !== 36)
    throw new Error("Monthly table did not return");
  checks.push("Monthly view restored");
  await page.goto("http://127.0.0.1:3000/auto-loan-calculator.html");
  await page
    .getByLabel("Dealer purchase tax treatment", { exact: true })
    .selectOption("Michigan");
  const options = page.locator("details");
  if (await options.count())
    await options.first().evaluate((e) => (e.open = true));
  await page.getByLabel("Vehicle price", { exact: true }).fill("40000");
  await page.getByLabel("Trade-in value", { exact: true }).fill("20000");
  await page.getByLabel("Sales tax rate", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  const sales = page.locator(".metric").filter({ hasText: "Sales tax" });
  // Check the rendered result rather than relying on an internal numeric call.
  if (!(await page.locator("body").innerText()).includes("1,680.00"))
    throw new Error("Michigan capped trade tax missing");
  checks.push("Michigan 2026 trade cap renders $1,680 tax");
  await fs.writeFile(
    "docs/financial-clone/evidence/browser-schedule-qa.json",
    JSON.stringify(
      { passed: true, at: new Date().toISOString(), checks },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, checks }));
} finally {
  await browser.close();
}
