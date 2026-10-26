# Tax Equivalent Yield and Treasury Bill — 2026-10-27

User approved implementing both candidates after supplying US keyword-overview and SERP exports. One page owns Treasury bill/T-bill synonyms. No existing URL is changed. Core scope follows user-entered rates, not a new automatic multi-jurisdiction tax engine or live auction API.

## Delivered models

Tax Equivalent Yield (id tax-equivalent-yield, mode compare) compares federally exempt and taxable annual yields with entered federal/state/local/surtax assumptions. State/local exemption on the municipal option is explicit. Rates add without deductibility interactions, and combined rates >=100% are rejected. Equivalent taxable yield = exempt yield × (1−exempt-option tax)/(1−taxable-option tax). Annual income comparison uses the entered common principal. Negative advantage is retained. The table varies hypothetical combined taxable rates while fixing exempt-option treatment; it is not an IRS bracket table. Retirement accounts, AMT/private-activity bonds, partly exempt distributions, capital gains, NIIT eligibility and deduction interactions are outside scope. A state-taxed muni versus state-exempt Treasury comparison needs separately assigned state rates and is explicitly outside this simplified form.

Treasury Bill (id treasury-bill, modes discount/price) uses face value in$100 increments and1..366 whole settlement-to-maturity days. Discount mode uses TreasuryDirect’s P=F(1−dD/360). Price mode accepts a quote per$100 face. Output separates face-based360-day discount rate from price-based holding return, simple365/366-day annualization and hypothetical same-rate-reinvestment effective annual yield. It does NOT label simple annualization as the official auction Investment Rate, especially for longer bills. Quotes are manual assumptions. Fees are paid at purchase; simplified federal+surtax is applied to gross positive discount interest without fee deductibility; net profit may be negative. State/local tax on bill interest is zero. Tax-year accrual/basis, actual auction rounding, broker-specific quotations, eligibility, early sale/premium price, reinvestment ladders and retirement accounts are excluded. Cash-flow rows show only purchase outlay and maturity proceeds; no fictitious daily growth curve.

## Site integration

Both use the current Inter/violet/amber/thin-border workspace, final extensionless navigation, full result metrics, CSV, print/share, rich PNG with optional inputs and the existing free badge. No new dependency/font/runtime API. A dedicated lazy engine supplies the two tools. Savings & Investing now has26 tools, with related-tool and glossary links. Added titles/descriptions, real free Offers, canonical/breadcrumbs,154-page sitemap, llms entries, search synonyms, independently authored examples and dedicated risk disclaimers. New legacy-compatible files /tax-equivalent-yield-calculator.html and /treasury-bill-calculator.html canonicalize to corresponding www extensionless destinations.

## Verification

1,038 tests, TypeScript and production export passed. Independent TreasuryDirect182-day0.145% example, explicit20% tax-equivalence control, state-tax/surtax cases, price/discount round trips across1..366 days, cash conservation, zero/par/fee-loss and invalid input cases. All86 previous catalog routes and199 complete default field/mode/result hashes unchanged. Catalog88 entries =87 functional calculators + housing directory;202 modes.154-page SEO,8,014 internal anchors and87-tool/226 search-task checks passed.

22 focused Chromium checks at320/390/768/1440 cover initial result,schemas,canonicals,mode changes,5% tax-equivalence and$142 bill-profit controls,invalid-input stale-result removal,CSV,four PNG exports and no-JS rendered content.18 category checks include88 catalog paths and mobile homepage first screen. Native iOS Safari, live lender/broker submissions, actual field performance and live public-domain HTTP are unverified. No ranking/revenue promise. Existing public-domain access restrictions remain respected.

## Research sources

- User-supplied tax-equivalent-yield-calculator_serp_urls_us_2026-10-26_23-45-18.xlsx and treasury-bill-calculator_serp_urls_us_2026-10-26_23-47-42.xlsx. Two accompanying PDFs repeat Recast content and are not evidence for these two keywords. Earlier bulk US export supplies volume/KD; no new volume inferred from SERP position tables.
- TreasuryDirect bill rules: https://treasurydirect.gov/marketable-securities/treasury-bills/
- TreasuryDirect discount formula/control: https://treasurydirect.gov/marketable-securities/understanding-pricing/
- IRS Publication550: https://www.irs.gov/publications/p550
- Eaton Vance comparison scope: https://www.eatonvance.com/taxes-and-tools/tax-tools/tax-equivalent-yield-calculator.html
- FNCalculator bill field structure reviewed as text: https://www.fncalculator.com/financialcalculator?type=usTreasuryBillCalculator . Its$1,000 quantity convention is not copied as a Treasury purchase minimum. Fidelity’s JS calculator did not expose interactive content in text; no submitted-result or visual-parity claim.

Evidence: evidence/investment-decisions-qa.json. Work/receipts/screenshots:/workspace/work/investment-decisions-20261027/.

Final static/lazy suite:29 checks passed with no page errors or unexpected external requests. Both new tool engines remain absent until requested.
