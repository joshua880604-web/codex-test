# IRR review — October 20, 2026

## Reproduced issues

1. Scaling [-100, 110] to [-1e-200, 1.1e-200] changed the old solver's result from 10% to about 9.4174%. Products used in sign checks could underflow. Log-scaled signed evaluations now avoid that scale dependence; same-time amounts are netted exactly using decimal integer representations before constructing signed logs. This also preserves tiny valid flows next to extremely large ones and removes leading-time discount underflow.
2. Equal-and-opposite same-date flows returned 1,488 pseudo-roots. Same-time netting now rejects a zero cash-flow function as having no unique IRR. Nonfinite/mismatched/out-of-range inputs are explicitly rejected.
3. Fixed cash-flow duration was silently rounded (1.1 years annually became one period). It now must form a whole number of periods at the selected frequency; fractional years are allowed when they form valid monthly/quarterly periods.
4. Monthly and quarterly cash-flow rows were labeled Year and used period indices as years. The schedule now shows Period, Time (years) and Net cash flow. Rates are labeled Annual IRR and are effective annual rates, using compounding rather than multiplying a periodic rate.

## Numerical method and limitations

The search variable remains log(1+r) in [-12,12]. Cash-flow times must be finite in [0,12000], with 2–12001 supplied values. Same-time decimal representations are netted before calculation; a common time offset does not change roots. Signed log-scaled sums with compensated accumulation avoid ordinary overflow/underflow. Conventional one-sign-change cash flows use a direct bracket; nonconventional flows retain a bounded stationary-point/grid search with residual checks and finer root de-duplication.

This does not guarantee every mathematical root of every exponential polynomial. Nearly repeated/closely spaced roots remain ill-conditioned and depend on numerical precision. The UI describes the bounded search, shows detected multiple roots without recommending the first, and distinguishes no detected root from proof that no mathematical root exists. IRR is not total ROI or a measure of risk.

## Input and presentation

Existing fixed/irregular mode query IDs remain supported. The irregular tab is now Unequal Annual Cash Flows: unequal amounts at successive year ends, not actual irregular dates. Negative later amounts are additional outflows; zero entries preserve empty years. The initial positive investment input becomes a negative time-zero flow. Commas separate amounts and must not be used as thousands separators. Beginning-of-period recurring flows start at time zero; terminal value stays at the final horizon. For actual dates, the guide links the existing dated cash-flow return in Average Return Calculator.

The three captured original prose reference fixtures retain their source metric names and numeric expectations; the reference test maps the renamed Annual IRR display label. Two new examples explain monthly-to-annual conversion and the 10%/20% multiple-root pattern, bringing published examples to 97.

## Verification

420 mathematical/regression tests passed. Added checks cover scale invariance at tiny/huge magnitudes, extreme ratios, same-date cancellation, positive/negative/zero/multiple/repeated roots, independently checked NPV residuals, invalid inputs, whole-period duration, monthly schedule time and beginning-period timing. Since the shared solver also supports APR and other tools, full browser regression is required and recorded separately. Build, TypeScript, initial HTML, dedicated IRR browser checks and example reports are in evidence/. No live deployment or original-site visual/form parity claim is made.

Final browser evidence: 9 IRR-specific checks; 75 routes / 170 modes in full regression; 105 SEO checks including all 97 example links. No page errors.
