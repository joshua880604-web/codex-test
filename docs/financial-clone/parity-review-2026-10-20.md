# Calculation parity review — 2026-10-20

## Conclusion

The current local implementation cannot be described as numerically equivalent to every mode and scenario in the Calculator.net financial directory. The directory still lists the same 71 entries (70 calculator pages plus the Real Estate directory). Local additions bring our combined directory to 76 entries; the five Everyday Tools are outside that original financial comparison.

This is a read-only calculation review. No calculator formulas were modified and no files were uploaded during this review. The previously synchronized branch head is 363e272672a6436bf1662c275a8ce9a0623859d8.

## Tests and concrete evidence

`npm test` was rerun against current local code: 431 tests passed, zero failed. Its 25 tests named `source prose:` exercise previously recorded original-site article examples. These are not 431 live original-site comparisons and do not establish a site-wide agreement percentage. Output is saved in work/parity-review-tests.tap.

Original pages reread through the web tool: financial directory, Mortgage, Loan, 401(k), Retirement, VAT, IRR, HELOC, Income Tax, Take-Home-Paycheck, Marriage Tax and Annuity.

Fresh calculations recorded in evidence/parity-review-2026-10-20.json:

| Case | Original published value | Current local value | Evidence level |
| --- | --- | --- | --- |
| IRR: initial 40000, end-year inflows 10000,20000,30000 | 19.438% | 19.4377099627% | Explicit article inputs/result; agrees at original's three-decimal precision |
| VAT: net 5, rate 10% | Tax 0.50, gross 5.50 | Tax 0.50, gross 5.50 | Explicit article example |
| Annuity: start 20000, year-start deposit 10000, monthly 0, 6% effective annual, 10 years | Balance 175533.38, earnings 55533.38 | Balance 175533.38032009, earnings 55533.38032009 | Displayed source schedule, with parameters reconstructed from explicit principal/deposits and annual schedule; not submitted live |

All comparisons require the same amount, timing, frequency, duration and rate definition. Default page outputs without observable input values are not treated as verified cases. Different rounding precision can change display text while the computed value agrees.

## Confirmed functional and definition differences

1. **401(k) Projection:** original describes accumulation plus distributions in retirement. Local projection ends at retirement. A sensitivity probe with otherwise identical defaults and life expectancy 80 versus 100 returns the same metrics and no retirement-distribution result. An unchanged retirement-date balance is mathematically appropriate; the missing piece is the post-retirement model. Life expectancy is used in age validation, not the projected cash flows. Future contribution limits stay at 2026 values, as locally disclosed.
2. **401(k) Maximize Employer Match:** original describes a contribution-percentage window designed to avoid exhausting the annual employee limit before all pay periods. Local mode only calculates annual two-band amounts and a monthly average. It has no pay-period contribution simulation or maximum permissible percentage window. It therefore does not implement the same decision output.
3. **401(k) early withdrawal:** original asks employment, age at separation, disability and other exceptions; local mode asks the user to select one penalty-exception flag. Arithmetic under a correctly selected flag does not establish matching automatic eligibility behavior.
4. **401(k) contribution summary:** by explicit prior user request, local Employee contributions + current balance includes starting balance once. It is intentionally a different definition from an employee-deposits-only total. Preserve this customization unless the user changes that requirement.
5. **Retirement monthly withdrawal:** original has separate annual and monthly contribution inputs. Local mode has a monthly contribution only. Annual lump-sum deposits cannot in general be replaced by the same total spread monthly without changing the timing and future value. Original percentage/amount selectors in other retirement fields are also not all present locally.
6. **HELOC closing costs:** original exposes dollar/percent closing-cost units and upfront/deducted-from-loan options. Local exposes a dollar field, treats closing costs as reducing initial net proceeds, and does not provide all those original selection branches. Local annual fee timing has already been corrected to draw only, but it is averaged monthly; partial years are prorated. Exact fee-date APR parity is still unverified.

## High-priority unverified areas

- Income Tax and Marriage Tax: same-year, same-filing-status, matching income/credit/deduction cases still require live paired results. Local QBI is explicitly simplified and AMT uses supplied adjustments. Do not infer a numerical discrepancy merely from different field grouping. The original Marriage Tax page also says it does not show Married Filing Separately results; missing that comparison locally is not by itself a parity defect.
- Take-Home-Paycheck: local annual-liability allocation explicitly is not the Publication 15-T withholding algorithm; original current W-4 inputs include multiple-job and deduction choices not fully mapped locally. Need exact selected-input/output comparisons rather than claims based only on titles. Both sites allow manual state/city tax assumptions, so that shared simplification is not alone a confirmed difference.
- Mortgage/FHA/VA/PMI, rent-versus-buy, vehicle taxes, bonds, depreciation and dynamic currency: earlier independent tests remain useful, but complete original-site branch and boundary parity is unverified.

## Access limits

Readable original page text was available. It replaces form input values with generic Input/Select markers. A custom Loan query URL failed through the web tool. Direct HTML retrieval failed: local sandbox denied networking; the authorized external request then received a proxy tunnel 403. No original form submission or head-to-head screenshot comparison was completed. No attempt was made to circumvent those limits.

## Recommended next work

Prioritize complete 401(k) retirement distributions and employer-match window behavior; map Retirement annual deposits; then perform paired tax and HELOC fee/closing scenarios. For each tool, save exact input values/options, original results, local results, per-field differences and tolerances for normal, zero-rate, invalid and boundary cases. Mark agreement per scenario, not per tool based on one example.

## Sources

- https://www.calculator.net/financial-calculator.html
- https://www.calculator.net/401k-calculator.html
- https://www.calculator.net/retirement-calculator.html
- https://www.calculator.net/heloc-calculator.html
- https://www.calculator.net/irr-calculator.html
- https://www.calculator.net/vat-calculator.html
- https://www.calculator.net/annuity-calculator.html
- https://www.calculator.net/tax-calculator.html
- https://www.calculator.net/take-home-pay-calculator.html
- https://www.calculator.net/marriage-calculator.html

## Follow-up implementation

The subsequently implemented retirement batch supersedes the missing-capability findings for 401(k) post-retirement scheduling, match-window output, selected early-distribution qualifications and Retirement annual deposits. See retirement-parity-improvements.md for assumptions and tests. The above historical audit is preserved; exact original numerical parity remains unverified.
