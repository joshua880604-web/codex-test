import { test } from "node:test";
import assert from "node:assert/strict";
import { siteConfig, serializeSchema, absoluteURL } from "../src/lib/site";
import {
  sitemapEntries,
  calculatorMetadata,
  calculatorSchema,
  contentUpdatedOn,
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
test("Production sitemap lists canonical pages and only reviewed content dates", () => {
  const config = siteConfig({
    SITE_URL: "https://finance.example/",
    SITE_INDEXABLE: "true",
  });
  const entries = sitemapEntries(config);
  assert.equal(entries.length, 151);
  assert.equal(new Set(entries.map((e) => e.url)).size, entries.length);
  assert.ok(
    entries.every(
      (e) =>
        e.url.startsWith("https://finance.example/") &&
        !e.url.includes("?") && !e.url.includes("#") &&
        e.lastModified === contentUpdatedOn[new URL(e.url).pathname],
    ),
  );
  assert.ok(
    !entries.some(
      (e) => e.url === "https://finance.example/" || e.url.includes("/api/"),
    ),
  );
  assert.equal(sitemapEntries(siteConfig({})).length, 0);
  assert.equal(entries.filter(e=>e.lastModified).length,Object.keys(contentUpdatedOn).length);
  assert.equal(contentUpdatedOn['/mortgage-calculator.html'],'2026-10-26');
  assert.ok(Object.entries(contentUpdatedOn).filter(([path])=>!['/mortgage-calculator.html','/pmi-calculator.html','/biweekly-mortgage-calculator.html','/discount-points-calculator.html','/real-estate-calculator.html','/loan-calculators.html','/savings-investment-calculators.html','/cd-calculator.html'].includes(path)).every(([,date])=>date==='2026-10-25'));
  assert.ok(!entries.some(e=>e.url.endsWith('/llms.txt')||e.url.endsWith('/sitemap.xml')));
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

test("Every functional calculator has a unique guide, reproducible examples and specific questions", () => {
  const tools=calculators.filter(c=>!c.directory);
  assert.equal(tools.length,84);
  assert.equal(Object.keys(guides).length,84);
  assert.equal(new Set(Object.values(guides).map(g=>g.summary)).size,84);
  for(const tool of tools){
    const guide=guides[tool.id];assert.ok(guide,tool.id);
    assert.ok(guide.summary.length>80 && guide.scope.length>50,tool.id);
    assert.ok(guide.questions.length>=2 && guide.examples.length>=1,tool.id);
    assert.equal(new Set(guide.questions.map(q=>q.question)).size,guide.questions.length);
    for(const e of guide.examples){
      const mode=tool.modes.find(m=>m.id===e.mode)!;
      for(const [key,value] of Object.entries(e.values)){
        const field=mode.fields.find(f=>f.key===key);assert.ok(field,tool.id+key);
        if(field.options)assert.ok(field.options.includes(String(value)),tool.id+key);
      }
    }
  }
});


test("Production SEO follows the confirmed www extensionless destination while old routes stay intact", () => {
 for (const origin of ["https://calculatorfree.io", "https://www.calculatorfree.io"]) {
  const config=siteConfig({SITE_URL:origin,SITE_INDEXABLE:"true"});
  assert.equal(config.origin,"https://www.calculatorfree.io");
  assert.equal(absoluteURL("/cd-calculator.html",config),"https://www.calculatorfree.io/cd-calculator");
  assert.equal(absoluteURL("/glossary/",config),"https://www.calculatorfree.io/glossary/");
  const entries=sitemapEntries(config);
  assert.equal(entries.length,151);
  assert.equal(new Set(entries.map(e=>e.url)).size,151);
  assert.ok(entries.every(e=>e.url.startsWith("https://www.calculatorfree.io/")&&!e.url.endsWith(".html")&&!e.url.includes("?")));
  for (const calc of calculators.filter(c=>!c.directory)) {
   const app=calculatorSchema(calc,config)["@graph"][0];
   assert.equal(app.url,calculatorMetadata(calc,config).alternates?.canonical);
   assert.deepEqual(app.offers,{"@type":"Offer",price:"0",priceCurrency:"USD",url:app.url});
   assert.ok(!("aggregateRating" in app)&&!("review" in app));
  }
 }
 assert.equal(absoluteURL("/cd-calculator.html",siteConfig({SITE_URL:"https://finance.example",SITE_INDEXABLE:"true"})),"https://finance.example/cd-calculator.html");
});
