import { test } from "node:test";
import assert from "node:assert/strict";
import { siteConfig, serializeSchema } from "../src/lib/site";
import {
  sitemapEntries,
  calculatorMetadata,
  calculatorSchema,
} from "../src/lib/seo";
import { guides } from "../src/lib/guides";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
test("SEO defaults never invent a public origin or enable preview indexing", () => {
  assert.deepEqual(siteConfig({}), { origin: undefined, indexable: false });
  assert.equal(
    siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "preview",
    }).indexable,
    false,
  );
  assert.equal(
    siteConfig({ SITE_URL: "https://finance.example", SITE_INDEXABLE: "true" })
      .indexable,
    true,
  );
  assert.throws(() => siteConfig({ SITE_INDEXABLE: "true" }), /SITE_URL/);
  for (const url of [
    "http://finance.example",
    "https://finance.example/path",
    "https://user:pass@finance.example",
    "https://finance.example/?q=1",
    "https://finance.example/#x",
  ])
    assert.throws(() => siteConfig({ SITE_URL: url }));
});
test("Production sitemap lists canonical pages only and no pretend lastmod dates", () => {
  const config = siteConfig({
    SITE_URL: "https://finance.example/",
    SITE_INDEXABLE: "true",
  });
  const entries = sitemapEntries(config);
  assert.equal(entries.length, 75);
  assert.equal(new Set(entries.map((e) => e.url)).size, 75);
  assert.ok(
    entries.every(
      (e) =>
        e.url.startsWith("https://finance.example/") &&
        !e.url.includes("?") &&
        !("lastModified" in e),
    ),
  );
  assert.ok(
    !entries.some(
      (e) => e.url === "https://finance.example/" || e.url.includes("/api/"),
    ),
  );
  assert.equal(sitemapEntries(siteConfig({})).length, 0);
});
test("Calculator canonicals consolidate shared query variants and schema matches the real app", () => {
  const calc = calculators.find((c) => c.id === "vat")!,
    config = siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
    });
  const metadata = calculatorMetadata(calc, config);
  assert.equal(
    metadata.alternates?.canonical,
    "https://finance.example/vat-calculator.html",
  );
  const schema = calculatorSchema(calc, config);
  assert.equal(schema["@graph"][0].name, calc.title);
  assert.ok(schema["@graph"].some((x) => x["@type"] === "BreadcrumbList"));
  const text = serializeSchema(schema);
  assert.ok(!text.includes("aggregateRating") && !text.includes("reviewedBy"));
  assert.ok(
    !serializeSchema({ value: "</script><script>alert(1)</script>" }).includes(
      "<",
    ),
  );
  assert.ok(
    !JSON.stringify(calculatorMetadata(calc, siteConfig({}))).includes(
      "finance.example",
    ),
  );
});
for (const [id, guide] of Object.entries(guides))
  for (const example of guide.examples)
    test("Published worked example: " + id + " / " + example.title, () => {
      const mode = calculators
        .find((c) => c.id === id)!
        .modes.find((m) => m.id === example.mode)!;
      assert.ok(mode);
      const result = runCalculation(id, mode.id, {
        ...defaults(mode),
        ...Object.fromEntries(
          Object.entries(example.values).map(([k, v]) => [k, String(v)]),
        ),
      });
      const metric = result.metrics.find(
        (m) => m.label === example.expected.label,
      );
      assert.ok(metric);
      assert.ok(
        Math.abs(metric.value - example.expected.value) <=
          (example.expected.tolerance ?? 0.005),
        `${metric.value} != ${example.expected.value}`,
      );
      assert.ok(guide.scope.length > 50 && guide.sources.length > 0);
    });

import { relatedCalculatorIds } from "../src/lib/guides";
test("Contextual related tools are real, distinct and not self-links", () => {
  for (const [id, related] of Object.entries(relatedCalculatorIds)) {
    assert.ok(calculators.some((c) => c.id === id));
    assert.equal(new Set(related).size, related.length);
    for (const link of related) {
      assert.notEqual(link, id);
      assert.ok(
        calculators.some((c) => c.id === link),
        link,
      );
    }
  }
});
