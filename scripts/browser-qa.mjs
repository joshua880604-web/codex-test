const { chromium } = await import("playwright").catch(
  () => import("/opt/codex/cua_node/lib/node_modules/playwright/index.mjs"),
);
import fs from "node:fs/promises";
const root = new URL("../", import.meta.url),
  inventory = JSON.parse(
    await fs.readFile(
      new URL("docs/financial-clone/inventory.json", root),
      "utf8",
    ),
  );
const out = new URL("docs/financial-clone/evidence/", root);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const checks = [];
try {
  await page.goto("http://127.0.0.1:3000/financial-calculator.html");
  await page
    .getByRole("heading", { name: "Financial Calculators", exact: true })
    .waitFor();
  await page.screenshot({
    path: new URL("directory-desktop.png", out).pathname,
    fullPage: true,
  });
  await page.getByLabel("Find a calculator").fill("mortgage");
  if ((await page.locator(".directory-grid li").count()) < 1)
    throw new Error("Directory search failed");
  await page.getByLabel("Find a calculator").fill("zzzz no match");
  await page.getByRole("status").waitFor();
  for (const item of inventory) {
    const response = await page.goto(
      "http://127.0.0.1:3000" + item.local_route,
    );
    if (response.status() !== 200)
      throw new Error("Route failed " + item.local_route);
    await page
      .getByRole("heading", { name: item.title, exact: true, level: 1 })
      .waitFor();
    const record = {
      id: item.id,
      route: item.local_route,
      status: response.status(),
      modes: [],
    };
    if (item.id !== "real-estate") {
      const tabs = await page.getByRole("tab").all();
      const labels = tabs.length
        ? await Promise.all(tabs.map((t) => t.innerText()))
        : [null];
      for (let i = 0; i < labels.length; i++) {
        if (labels[i] !== null) await page.getByRole("tab").nth(i).click();
        await page.getByRole("button", { name: /^Calculate/ }).click();
        if (item.id === "currency" && i === 0) {
          await Promise.race([
            page.locator(".error[role=alert]").waitFor({ timeout: 12000 }),
            page.locator(".result").waitFor({ timeout: 12000 }),
          ]);
          record.modes.push({
            mode: labels[i] ?? "default",
            result: (await page.locator(".result").count())
              ? "result"
              : "feed-unavailable",
          });
          continue;
        }
        await page.locator(".result h2").waitFor({ timeout: 5000 });
        if (await page.locator(".error[role=alert]").count())
          throw new Error(
            item.id +
              ": " +
              (await page.locator(".error[role=alert]").innerText()),
          );
        const text = await page.locator(".result").innerText();
        if (/NaN|Infinity/.test(text))
          throw new Error("Nonfinite result " + item.id);
        record.modes.push({ mode: labels[i] ?? "default", result: "rendered" });
      }
    }
    checks.push(record);
  }
  await page.goto("http://127.0.0.1:3000/mortgage-calculator.html");
  await page.locator(".result").waitFor();
  await page.screenshot({
    path: new URL("mortgage-desktop.png", out).pathname,
    fullPage: true,
  });
  await page.getByLabel("Home price", { exact: true }).fill("500000");
  if (await page.locator(".result").count())
    throw new Error("Stale result visible after edit");
  await page.getByRole("button", { name: /^Calculate/ }).click();
  await page.locator(".result h2").waitFor();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download CSV" }).click(),
  ]);
  await download.saveAs(new URL("mortgage-download.csv", out).pathname);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  if (
    (await page.getByLabel("Home price", { exact: true }).inputValue()) !==
    "400000"
  )
    throw new Error("Reset failed");
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of [
      "/financial-calculator.html",
      "/mortgage-calculator.html",
      "/tax-calculator.html",
      "/budget-calculator.html",
      "/bond-calculator.html",
    ]) {
      await page.goto("http://127.0.0.1:3000" + path);
      await page.locator("h1").waitFor();
      const dims = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      if (dims.scroll > dims.client + 1)
        throw new Error(
          "Overflow " + width + " " + path + JSON.stringify(dims),
        );
    }
    if (width === 390) {
      await page.goto("http://127.0.0.1:3000/mortgage-calculator.html");
      await page.screenshot({
        path: new URL("mortgage-mobile.png", out).pathname,
        fullPage: true,
      });
    }
  }
  await page.goto("http://127.0.0.1:3000/not-a-real-calculator.html");
  if (
    !(await page.getByRole("heading", { name: "Calculator not found" }).count())
  )
    throw new Error("404 failed");
  if (errors.length)
    throw new Error("Browser runtime errors: " + errors.join("; "));
  const report = {
    tested_at: new Date().toISOString(),
    base: "http://127.0.0.1:3000",
    browser: "System Chromium via Playwright",
    reference_visual_parity: "unverified: original-site browser unavailable",
    checks,
    console_errors: errors,
    passed: true,
  };
  await fs.writeFile(
    new URL("browser-qa.json", out),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: true,
      routes: checks.length,
      modes: checks.reduce((s, x) => s + x.modes.length, 0),
      responsive_widths: [1440, 768, 390],
      errors,
    }),
  );
} catch (e) {
  await fs.writeFile(
    new URL("browser-qa-failure.json", out),
    JSON.stringify(
      { tested_at: new Date().toISOString(), checks, errors, error: String(e) },
      null,
      2,
    ),
  );
  await page.screenshot({
    path: new URL("failure.png", out).pathname,
    fullPage: true,
  });
  throw e;
} finally {
  await browser.close();
}
