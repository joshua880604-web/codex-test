# Retirement feature parity improvements — 2026-10-20

This batch addresses specific missing capabilities found in parity-review-2026-10-20.md. It is not a claim of full numerical equivalence to the original site. Calculator.net text is readable, but its custom form submissions and exact calculation defaults remain unavailable in this environment.

## 401(k) projection

Retains the user's annual accumulation convention and Employee contributions + current balance definition. Each saving year grows its opening balance, adds that year's capped employee and employer deposits, and raises salary for the next year. Starting balance is added exactly once to the employee summary.

Added an independent retirement-income schedule. It uses the projected balance at retirement, selected life expectancy, the same effective annual investment return, and monthly inflation-equivalent withdrawal increases. First withdrawal is at the end of the first retirement month. The balance is targeted to deplete at life expectancy. The schedule displays opening balance, investment return, annual withdrawals and ending balance by year-end age; it has its own CSV export. Retirement horizons must be integer years in 1–100. Zero starting retirement balances produce zero withdrawals. Invalid or numerically unstable scenarios return errors.

The initial withdrawal is solved from discounted growing monthly cash flows, not by dividing a nominal future balance by retirement years. With real monthly rate j=((1+r)/(1+inflation))^(1/12)-1 and monthly inflation q=(1+inflation)^(1/12)-1, initial withdrawal equals payment(balance,j,N)*(1+q). Each month's withdrawal then increases by 1+q. Tests separately discount all planned cash flows and verify opening balance + investment return - withdrawals = ending balance for every retirement year. Only floating-point residue is removed from the final balance.

This is a before-tax illustration. It does not enforce RMDs, tax withdrawal eligibility, fees, vesting schedules, future legal limit increases or combined employer/employee compensation caps. These assumptions are visible in result notes and guide copy. The new schedule's exact numerical agreement with the original site is unverified.

## Employer-match rate window

Under equal pay, a steady percentage for the full year, per-pay-period matching, no prior year-to-date deposits and no annual true-up:

- Minimum percentage is the last contribution-band endpoint that earns additional match. No contribution is demanded for a trailing zero-match band; if both match rates are zero, the minimum is zero.
- Conservative maximum steady percentage is min(100%, age-based 2026 employee limit / annual salary). It avoids exhausting the limit before year end and does not optimize a last payroll partial contribution.
- If minimum exceeds maximum, the output explicitly says no full-match window exists. The annual amount and partial employer match then use the employee limit; they are not described as achieving the full match.
- Tier two remains an additional band, preserving existing links and assumptions. Combined bands above 100% or zero salary are rejected.

Independent example: age 35, salary 80000, dollar-for-dollar first 3% plus half of next 2% gives a safe 5%–30.625% window under the stated assumptions, with employer match 3200. A monthly-payroll simulation at each endpoint verifies that all periods receive their full match. Actual plan rules can further restrict the window; source numerical parity is unverified.

## Early-withdrawal qualifications

Added employment-with-this-sponsoring-employer, separation during/after the year turning 55, and qualifying total/permanent disability choices. Preserved the existing exception query key as the other-exception override. A qualifying selected condition removes the 10% additional tax, not ordinary income tax. Fields explicitly target pre-59½ distributions; plan-specific exceptions remain the user's responsibility. Employment refers to the sponsoring employer, rather than employment elsewhere.

## Retirement annual contributions

Monthly Withdrawal retains its mode ID and existing monthly key; a new annual contribution defaults to zero for backward compatibility. Monthly deposits are made at month end; separate additional annual deposits occur at year end before retirement. The balance is the sum of future starting savings, future monthly deposits and future annual deposits. At 6%, two year-end deposits of 1000 accumulate to 2060, independently verified. Spreading the same amount monthly gives a different result and is not silently substituted.

## Validation and remaining scope

443 tests pass; production build passes. Dedicated browser checks cover life-expectancy sensitivity, separate CSV contents, match windows, unattainable matching, disability qualification, query hydration, native invalid-input handling and no page overflow at 320/390/768/1440 pixels. Existing UI regression passes 20 checks. The SEO/example browser suite passes 111 checks including all 103 worked examples. Final full regression passes 76 routes / 171 modes with no console errors, recorded in evidence/browser-qa.json. Screenshots were inspected locally; no screenshots were published.

No new dependency, route or mode was added. Source parity remains unverified. Tax/withholding detailed comparisons, HELOC cost unit/payment options, complete combined contribution caps, Retirement percentage/amount selectors and other audit items still remain. The user explicitly authorized this batch for GitHub synchronization after validation.

Sources reviewed:
- https://www.calculator.net/401k-calculator.html
- https://www.calculator.net/retirement-calculator.html
- https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions
- https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits
