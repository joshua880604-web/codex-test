# Remaining work before full one-to-one acceptance

This document is part of the deliverable, not a statement that all 71 source entries are verified complete.

## Blocked reference evidence

The current web reader can obtain source text and explicit article examples, but not the original DOM input values/select choices, computed styles, viewport screenshots, or live form submission. A parameterized source loan request was inaccessible. The shell network policy does not permit the original host, so no alternate connection or proxy bypass was attempted.

All source interaction/default-value parity and source/local screenshot comparisons remain **unverified**. Local browser screenshots do not substitute for them. Full skill completion therefore remains open even though the local directory, forms, and calculations are runnable.

## Specific behavior still requiring original-site comparison

- Mortgage/FHA/VA: exact MIP/PMI bases and cancellation, date conventions, cent rounding, cost-growth timing, and biweekly interest policy. The local implementation exposes explicit policies and supports dated schedules, per-cost growth, fee financing, and extra payments.
- Auto: Manual plus eight officially researched dealer-purchase tax-base treatments are implemented, including Michigan purchase-year trade caps. Rates remain entered explicitly; eligibility assumptions, taxable dealer fees, local surtax caps, remaining states and exact source dropdown options are unverified. Boat stays manual because automobile rules cannot safely be reused. Cash-back comparison now includes entered tax, fees, trade equity and upfront cash.
- Rent: the source's exact affordability recommendation/bands are not observed; local ratios are explicit editable planning assumptions.
- House affordability, refinance, rental property, and rent-versus-buy: local cash-flow models are implemented, but source fee bases, opportunity-cost/tax conventions and every advanced toggle have not been proven identical. Rent/buy itemized tax benefit is a simplified explicit model; full SALT/interest-limit/phaseout logic is not applied there.
- Investment/tax on interest: deposit timing, compounding equivalences, annual versus fractional-period tax treatment, contribution growth, and fund back-load bases need full parameterized reference cases.
- Bonds: regular-coupon pricing, anchored end-of-month coupon dates and accrued-day output are implemented; stub coupons, ex-coupon rules and exact source day-count variants/date rounding require further comparison.
- IRA/401(k): 2026 contribution caps are held constant for future projections. IRA eligibility, employer-plan and deduction phaseouts are not inferred. QBI and AMT eligibility/adjustments in the tax estimator are not a complete federal tax-return engine. Other credits (including EITC/foreign-tax credits) are entered explicitly.
- Take-home paycheck: allocates an annual tax estimate over pay periods, rather than implementing the complete Publication 15-T withholding worksheets. Which source withholding policies are used remains unverified.
- Marriage tax: previous single/head-of-household returns and joint return are compared. Married-separate optimization is not implemented; mixed refundable-AOTC eligibility uses a conservative combined assumption documented in the result.
- Social Security: the delayed-credit implementation supports birth years 1943 and later. Spousal/survivor, taxation and earnings-test rules are outside the observed input model and not inferred.
- RMD: owner accounts, automatic Uniform/Joint tables and future projections are implemented. Employer still-working/inherited-account exceptions and spouse ages under 20 are not supported by this extracted table. The 1959 birth-year interpretation and regulatory source are preserved in research.
- Depreciation: three methods, custom first-year months and an explicitly defined Actual-days service/fiscal-year-end proration are implemented. Declining balance does not force terminal write-down or switch to straight line. Exact original convention choices and accounting-year controls remain unverified.
- Live reference and BTC feeds: actual current-environment egress to providers is unavailable/unverified; mocked success/failure and explicit saved-reference fallback are tested. No live-feed success is claimed.

## Next concrete actions

1. Use a permitted browser session that can reach Calculator.net to capture exact controls/defaults and each mode's normal/boundary/error output.
2. Map every observed source sub-form and option to local mode/field records in inventory/progress; update omissions instead of counting a route as complete.
3. Resolve the specific differences above with parameterized source fixtures and official policy evidence.
4. Compare screenshots at matching 1440×900, 768px, and 390×844 viewports and matching inputs.
5. Re-run only affected numeric/UI checks and production build after fixes; update completion gates with evidence.

Source was uploaded to the authorized GitHub repository. Hosted website publication has not completed.

## Latest implementation batch — 2026-10-19

Known loan and mortgage schedule schemas support per-payment/monthly and yearly views; yearly rows sum cash flows and retain closing balances and last-payment dates. CSV follows the selected view. Loan years are measured from the first payment, not calendar years. Biweekly and configurable business-loan frequencies use their own period counts. This does not establish source interaction or visual parity.

## Calculation audit — 2026-10-19

See calculation-audit.md for eight reproduced and corrected issue groups, independent/source cases, and full limitations. In particular, original 401(k) retirement distributions and the maximum-match contribution-percentage window remain missing; source Retirement annual-contribution/percentage controls are not completely mapped. Current RMD distribution years are explicitly restricted to 2022 onward, and insufficient-funds assumptions raise an error instead of generating negative distributions. No global source-parity pass is claimed.
