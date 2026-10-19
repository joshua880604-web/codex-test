# Implementation decisions

- Local-only development: no Sites registration, deployment, public hosting, account, or paid service created.
- Next.js 16.4.2 / React, TypeScript; Node.js 24+. package-lock.json pins installed dependencies.
- Reference routes were resolved from the actual directory, including tax-calculator.html and debt-ratio-calculator.html.
- 71 directory entries consist of 70 calculators and the Real Estate directory. Do not invent a formula for the directory.
- Pure numeric functions are separated from UI. Shared components render inputs and outputs; business logic remains specific to each tool.
- Original-site access: text web retrieval available; original DOM computed styles, form default values, option lists, screenshots, and form submission are NOT verified. A query-based attempt to submit a source loan example was inaccessible. No network-policy bypass attempted.
- Browser QA uses portable local Playwright and system Chromium. Its findings apply to the local implementation, not reference-site visual parity.
- Regular loan math retains floating-point precision internally; display uses two decimals. Explicit conservation and terminal-payment fixtures guard accumulated error. This does not establish parity with a lender's cent-rounded daily-interest ledger.
- Data: IRS 2025/2026, SSA 2026, IRS RMD Table II/III, BLS CPI-U through September 2026. No 2026 annual CPI fabricated; October 2025 remains missing.
- Frankfurter v2 daily-reference route; archived USD cross-rate snapshot covers 165 actual currencies and retains each component's date. Feed failure is clearly identified as saved-reference fallback. Coinbase public spot endpoint handles BTC when reachable; no stored BTC value is fabricated.
- Full one-to-one acceptance remains open until reference interactions and visual checks can run. Local route/mode availability is tracked separately from verified completion.

## 2026-10-19: schedule aggregation and documented business-rule corrections

- Added yearly views only for known repayment schemas; sum payments/interest/principal/costs, preserve ending balances and last dates. CSV exports the active view. Year labels are loan years, not calendar years.
- Auto dealer-purchase tax-base rules cover California, Texas, Florida, New York, Illinois, Massachusetts, Michigan and Washington. Rates are never inferred. Other jurisdictions and boat purchases remain manual. Eligibility restrictions and local surtaxes are stated in results. The original source prose lists Michigan as disallowing trade credits, whereas official Michigan rules allow a capped credit; use the official 2026 $12,000 cap and record the disagreement rather than reproducing an obsolete rule. See research/auto-state-rules.json.
- Cash-back comparisons include entered fees, tax, trade equity and upfront cash. Zero default tax/fees preserve an explicit no-tax comparison.
- DDB no longer forces remaining book value to salvage at the end of useful life. This matches independent Microsoft DDB examples; no implicit straight-line switch. Rounding is capped to remaining basis. Fractional useful-life years are rejected rather than silently rounded.
- Actual-days depreciation is independently defined: inclusive service date through first fiscal year end, divided by that fiscal-year length; remaining service-year fractions carry forward. Original convention labels are unverified. No MACRS claim. See research/depreciation-details.json.
- Bond coupon dates are computed from an anchored maturity day, maintaining month ends. Accrued days are exposed. Exact original 30/360 and Actual/Actual variants remain unverified. See research/rent-bond-details.json.

## 2026-10-19: explicit annual 401(k) contribution iteration

User requested annual iteration for Employee contributions. The projection already iterated annually; employee/employer summary totals now derive directly from the annual rows. No monthly contribution model or current-salary-times-years approximation is used. Each year uses its starting salary and starting age cap, grows the opening balance, adds year-end contributions, then increases salary for the next year. English description, formula and result notes state the timing, fixed 2026 caps, excluded existing balance/returns/employer match, and display rounding. Independent fixtures cover rising salaries, matching, age 49-to-50 limits and zero remaining working years. 234 checks, TypeScript and production build passed; no new browser session was run for this wording and aggregation update.

## 2026-10-19: include starting balance in employee contribution summary

User requested adding Current 401(k) balance to the Employee contributions result. This supersedes the previous summary definition. Label now reads “Employee contributions + current balance” and equals entered starting balance plus the annual employee-contribution sum. Yearly Employee rows remain new contributions only. Starting balance is included once, not added to each annual contribution or added again to projected balance. Notes clarify historical employer funds/returns may already be in starting balance, while future employer matching and future returns are excluded from this summary. Added a two-year $100,000 starting-balance fixture (summary $116,240; projected balance $131,588), zero-contribution and retirement-boundary checks. All 235 tests, typecheck and production build pass. Browser interactions were not rerun for this result/wording change.

## 2026-10-19: calculation accuracy audit

Audited all 71 directory URLs for text accessibility, cross-checked original prose/annuity schedule cases and IRS forms, and reviewed shared numerical code plus key retirement/tax business rules. Reproduced and fixed eight groups: annual retirement contribution labeling; first-year annual and first-month withdrawal inflation timing; investment zero/already-met/month-count solver errors; stationary/nearby IRR roots; RMD table effective-year mismatch and negative projections; ordinary SE earnings below $400; and MFS eligibility for qualified vehicle-interest deduction. See calculation-audit.md and tests/audit.test.ts. Retain confirmed IRS floor rounding for tips/overtime and final-half MFS SALT computation. Full same-input original submissions remain inaccessible. User-customized 401(k) starting-balance summary is preserved.

## 2026-10-19: VAT matches the documented any-two workflow

Replaced four separate VAT modes with one four-field optional-input form and a pure solver for all six known-value pairs. Zero is a real supplied value. Exact-two input checks, inconsistent price/tax detection and indeterminate zero-case errors are explicit. Clear empties all fields. Query hydration clears defaults before reading supplied VAT fields, preserving new/legacy shared links. Main financial mode count decreases by three (157 to 154) because four limited forms became one broader form; no known-value pair was removed. Original defaults/error handling/screenshot parity remain unverified. See specs/vat.md.
