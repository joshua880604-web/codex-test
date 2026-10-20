# Calculator content expansion — October 20, 2026

All 70 functional calculators have an individual English guide; the real-estate directory remains a directory. Added guides cover the remaining 60 tools, with a distinct explanation, limitations, at least two topic-specific questions and at least one worked example each. All guide text is server-rendered below the calculator, with links that populate reproducible inputs. Existing formulas, tax engines, UI, URLs and preview-indexing behavior are preserved.

## Coverage and verification

There are 83 examples: 12 existing and 71 added. Added fixtures include 60 simple/boundary cases, nine positive-rate installment examples, one nonzero 2026 marriage-tax example and one nonzero 2026 paycheck example. Elementary expected values were specified independently of calculator outputs; the installment cases use the closed-form payment identity. They are not source-parity evidence or exhaustive testing of all 154 modes. Source links distinguish reference feature provenance from model certification; tax examples use already documented project rule versions and their recorded IRS source.

363 tests passed, including every published expected output and guide/field coverage; TypeScript and production build passed. Generated initial HTML verified for 75 pages, including guide sections on all 70 calculators. Browser evidence: 91 checks, including all 83 example links and actual output comparisons. Browser verification handles the marriage page's savings/additional-tax presentation while mathematical fixtures retain the signed delta. Representative initial JS is 496,220 decoded bytes; new guide prose is absent from client JS chunks. This is not a field loading-speed or Core Web Vitals assessment. Details: evidence/browser-seo-qa.json and evidence/content-js.json.

## Search intent, scope and sources

content-topics.json records candidate long-tail intents for 60 added pages. Examples include rent budget on 60,000 annual income, hourly-to-annual salary, extra-payment amortization, fee-inclusive loan cost, HELOC LTV capacity, profit margin versus markup and removing sales tax. These intents appear in natural explanatory text, example headings and questions; no hidden keyword blocks or near-duplicate landing pages were added.

No search-volume dataset, country-specific SERP competition study, Search Console account, indexing result, ranking improvement or AI citation result was obtained. These are content candidates, not verified high-traffic keywords. Actual data-backed prioritization and deeper multi-scenario content remain useful follow-up work.

Limitations stay visible: rent/buy has a fixed 30-year comparison; Social Security does not become an entitlement engine; paycheck calculations do not become an IRS withholding implementation; manual FX rates are hypothetical; FHA/VA/IRA eligibility is not inferred; tax rules remain versioned. No new professional review, ratings or FAQ rich-result guarantee is claimed. Original one-to-one visual/interaction verification remains open.

## Maintenance

The original ten guides remain in src/lib/guides.ts. The additional authored content and explicit fixture settings are in src/lib/extended-guides.json. The same tests validate both. Each new guide records October 20, 2026; original guide dates are retained. Update content-check dates only after an actual review. No new external service or hosted site was deployed.
