# Sources and evidence

Accessed 2026-10-19. The source directory and all linked financial pages were read as text. Research files retain exact URLs and limits. Source text access does not verify original DOM defaults, interactive submissions, or visual parity.

- Directory: https://www.calculator.net/financial-calculator.html
- IRS 2025 ordinary tax brackets: https://www.irs.gov/irb/2024-45_IRB
- IRS updated 2025 standard deductions and 2026 inflation adjustments: https://www.irs.gov/irb/2025-45_IRB
- IRS retirement contribution limits: https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500
- IRS owner RMD factors: https://www.irs.gov/publications/p590b
- SSA wage base: https://www.ssa.gov/oact/cola/cbb.html
- SSA retirement-age and early/delayed credit evidence: research/rmd-ssa-details.json
- BLS raw CPI-U series: https://download.bls.gov/pub/time.series/cu/cu.data.1.AllItems
- Frankfurter v2 public API docs: https://frankfurter.dev/
- Actual reference snapshot: https://api.frankfurter.dev/v2/rates?base=USD and https://api.frankfurter.dev/v2/currencies
- Coinbase public spot endpoint docs: https://docs.cdp.coinbase.com/coinbase-app/track-apis/prices
- Child/dependent care 2026: https://uscode.house.gov/us/usc/119-118/t26/s21/
- IRS AMT adjustments, including senior-deduction addback: https://www.irs.gov/instructions/i6251

## Evidence boundaries

- 222 automated checks passed; default-case smoke is not complete formula verification.
- Article worked examples are distinct from submitted source-form cases.
- 71 local routes and 157 local modes passed browser interaction checks.
- Representative mobile/tablet widths: five routes; not every tool was individually tested on every viewport.
- Original form/visual parity remains unverified, and known behavior differences are in remaining-work.md.
- TinyFish was discovered as an available, uninstalled browser integration and suggested for the missing reference-browser capability. No connection has been confirmed and no TinyFish action has been performed.

### Supplemental official rule research — 2026-10-19

See `research/auto-state-rules.json` for state revenue agency statutes/guides and eligibility restrictions; `research/depreciation-details.json` for original observed partial-year controls and independent Microsoft SLN/SYD/DDB/VDB examples; `research/rent-bond-details.json` for bond pricing example and unresolved rent ratios/day-count variants. Text observations do not verify dropdown contents or live form submissions.

### Calculation audit sources — 2026-10-19

71 original page-text accesses are logged in audit-source-access.json. Original retirement/401(k)/annuity/IRR pages and IRS Schedule 1-A, Schedule A, Schedule SE and 2021 Publication 590-B were consulted for current findings; see calculation-audit.md for URLs and evidence types. Parameterized source requests for retirement and loan were inaccessible. Original default fields and live submissions remain unverified.

VAT workflow source: https://www.calculator.net/vat-calculator.html explicitly requests any two of rate/net/gross/tax. Pair formulas follow gross=net+tax and tax=net*rate. Native source submissions and error strings remain unavailable; see specs/vat.md for the independent validation policy.

SEO editorial sources are linked visibly in the ten guides in src/lib/guides.ts: GOV.UK VAT, CFPB amortization/mortgage explanations, SEC Investor.gov compound-interest definitions, IRS retirement limits, Publication 590-B and 2026 revenue procedures. Example arithmetic is independently tested. Google Search Central AI-feature/content/canonical guidance informs technical choices, without claiming special GEO markup or guaranteed inclusion. See seo-geo.md.
