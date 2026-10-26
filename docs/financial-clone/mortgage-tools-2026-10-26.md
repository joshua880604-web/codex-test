# Mortgage scenario tools and FNCalculator comparison — 2026-10-26

The user requested a gap assessment against https://www.fncalculator.com/ and implementation of three prioritized mortgage tools. Priority is the user's product choice; traffic, keyword volume, advertising revenue and commercial ROI have not been measured.

## Reference findings and remaining opportunities

FNCalculator separates specific finance tasks into their own searchable entries. Its catalog links Discount Points, Bi-weekly Payment, loan comparison, refinance, APR, ARM/fixed comparisons, interest-only loans, HSA, tax-equivalent yield and Treasury bill tools. The observed homepage does not list a dedicated PMI tool. The useful pattern is a focused scenario, a short form and directly comparable outputs. The implementation preserves CalculatorFree's approved layout and visual tokens rather than copying the reference UI.

Before this release CalculatorFree already offered broad financial coverage, conventional PMI inside Mortgage and a biweekly mortgage mode. Those capabilities were difficult to discover as distinct tasks. Discount-point quote comparison was a substantive missing model. This release adds three distinct URLs, five modes, name/intent search, related links, explanatory guides, worked examples, FAQ schema, sitemap entries and curated llms.txt links. The earlier Mortgage modes remain compatible.

Next candidates to evaluate are dedicated HSA and tax-equivalent-yield tools, Treasury bill yield/price, explicit same-term loan-quote comparison and ARM/interest-only scenarios. Some existing tools have overlapping capabilities. Confirm the precise gap and user demand before adding another URL; don't create thin pages for spelling variants. HSA and adjustable-rate models need their own scope and rule review. A consistent display of effective/review dates, actual-quote overrides and linked official sources is more useful than a large count of calculators.

## Delivered models

### PMI — /pmi-calculator.html

Three modes: PMI Estimate, Use My Quote, Cancellation & LTV. Original value is the lower purchase price/appraisal, or the original refinance appraisal for an existing refinanced loan. Current market LTV is a separate informational figure. Appreciation never automatically grants cancellation in this model.

The illustrative rate estimate reuses the disclosed National MI Monthly Advantage March 1, 2022 card, reviewed October 26, 2026. Credit/LTV/term rates are dated base estimates, not current quotes, federal rates or insurance eligibility decisions. An actual quoted annual rate may be entered instead. Premiums use original principal; the dated card renewal cap after 120 payments applies only to automatic estimates, not manual quotes.

80% is a written-request benchmark with current/good-history, no-junior-lien and no-decline conditions. 78% is an original-schedule automatic benchmark if current; extra principal does not advance that original date. The midpoint backstop is the month following the original term midpoint, if current. Past-due payments retain the entered premium even after a benchmark. A reached 80% threshold does not claim an approved cancellation. Entered current-value decline prevents requested eligibility.

Cost projections explicitly assume approval following the qualifying 80% payment, with no premium from the next payment; scheduled automatic termination stops the premium on its scheduled date. These are disclosed modeling conventions, not a guarantee of actual billing/refunds. The table shows alternative PMI columns; they must not be added together. Scope excludes government MIP, lender-paid PMI, high-risk exceptions, ARM/interest-only and investor-specific appreciation rules.

### Biweekly — /biweekly-mortgage-calculator.html

Half the monthly P&I plus optional extra, 26 payments/year, nominal annual rate divided by 26 and immediate crediting. This is a period model, not an exact 14-day dated/daily-interest simulation. Show standard monthly, accelerated biweekly and monthly with the same annual budget, capped last payment and actual period count. Distinguish 26 from 24, acknowledge occasional 27-date calendar years and servicers holding partial payments. No ownership costs/PMI or service charges.

### Discount Points — /discount-points-calculator.html

Compare two actual fixed-rate quotes at the same principal and term. One point is 1% of principal; fractional points and negative lender credits are allowed. Enter both rates independently: no invented fixed rate reduction per point. All points/other fees paid in cash. Show monthly payment difference, upfront difference, selected sale/refinance horizon, cash-flow break-even and balance-aware borrowing-cost break-even. Net horizon savings = interest A − interest B − upfront difference = cash-flow savings + remaining-balance advantage. Zero-month horizon compares upfront costs. A first break-even is not a promise of permanent advantage. No financed fees, tax effects, time value, PMI or prepayment penalties.

## Validation and evidence

- Focused policy/boundary tests and full regression: tests/mortgage-tools.test.ts; evidence/mortgage-tools-qa.json.
- Independent 55-digit Decimal annuity/interest fixtures: CFPB's $180k, 5% versus 4.875%/0.375-point example, and a $100k/6% biweekly payoff benchmark.
- Existing 193 default metric sets compared exactly, including earlier Mortgage behavior.
- Browser, responsive layout, search, exports and visual evidence: evidence/browser-mortgage-tools-qa.json.
- Reference pages and controls were read as text. Reference live numeric submissions and visual parity have not been verified; these are independently implemented financial models.
- Native iOS/Safari testing is not claimed. Existing browser-support policy is unchanged.
