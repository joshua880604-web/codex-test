# Mortgage Recast Calculator

Reviewed 2026-10-26. User approved independent U.S. fixed-rate recast tool after supplying Semrush US keyword and SERP reports. This is a new tool; existing URLs are immutable.

- ID `mortgage-recast`, mode `compare`, legacy-compatible route `/mortgage-recast-calculator.html`; production canonical `https://www.calculatorfree.io/mortgage-recast-calculator`.
- Source behavior reviewed as text: https://www.thetruthaboutmortgage.com/mortgage-recast-calculator/ (three alternatives); https://clark.com/mortgage-recast-calculator/ (actual current balance and remaining term). Not submitted for numerical/visual parity.
- Rule references: https://singlefamily.fanniemae.com/job-aid/loan-delivery/topic/loan_delivery_job_aids_recast_loan_overview.htm and https://www.chase.com/personal/mortgage/education/managing-your-mortgage/what-is-mortgage-recast . No national fee/minimum schedule is asserted.

## Inputs

Current principal $300,000; nominal annual rate6%; remaining25 years +0 months; lump sum$50,000 credited now; cash recast fee0 (user must enter quote); optional actual scheduled monthly P&I blank. USD. Zero rate accepted; whole remaining term1..480 months, additional months0..11. Positive principal, nonnegative fee/lump. Lump must remain below principal: complete payoff does not need recast. Blank P&I derives an amortizing payment from balance/rate/remaining term. Actual P&I excludes escrow and voluntary extra principal. P&I below the fully amortizing amount is rejected; a quote within half a cent is normalized to the exact modeled amortizing payment. Earlier extra principal may make actual scheduled P&I higher and baseline payoff earlier.

## Model and timing

The lump sum is applied at time0, before next monthly interest. Recast keeps rate and contractual remaining term. Three paths: (A) unchanged balance with current P&I; (B) reduced balance and recast P&I; (C) same reduced balance but current P&I retained. Fees are cash paid at time0 only for B. Net interest savings =future interest A−future interest B−fee. Total future cash includes lump sum once, fee once and all subsequent payments; prior payments excluded. Positive monthly relief does not guarantee positive savings. Full internal precision, terminal payment capped/adjusted. Discounted remaining-annuity balances prevent floating-point drift for freshly amortized schedules.

## Output and interactions

Primary new monthly P&I; highlights monthly relief and net future interest savings after fee. Full metrics include principal reduction, all path interest/payoff counts and total future cash. Three-choice comparison appears across main column before chart, with horizontal mobile scroll and comparison CSV. Chart compares B/C balance paths starting after lump sum, not original balance. Monthly schedule shows recast payment/interest/principal/balance plus C balance; yearly sums12 payments and retains end balances. Existing Calculate/Reset, accessible labels, standard CSV, printing, saved/shared input links and rich PNG with optional input details. No runtime API, font or dependency added; independent engine lazy-loads on use.

## Scope

Fully amortizing fixed-rate monthly P&I only. No automatic eligibility approval, PMI cancellation, property tax or homeowners-insurance reduction. No FHA/VA/USDA eligibility, ARM, interest-only, balloon, delinquency, refinancing, daily accrued interest, processing delay, tax deduction, liquidity or investment opportunity-cost model. Minima/fees vary by servicer. Past interest never inferred from the supplied current balance. Actual lender schedules can differ through cent rounding, dates and processing.

## Validation

Seven independent60-digit Python Decimal controls covering standard, short, zero, one-month, long/high-rate, prior extra principal and zero-lump cases. Additional tests check cash/principal conservation, fee effects, negative savings, invalid input, final balance, annual aggregation, graph/PNG parity, search synonyms and lazy client/server consistency. Evidence recorded in mortgage-recast-2026-10-26.md and evidence/mortgage-recast-qa.json. Native Safari, lender submissions and reference visual parity are unverified.
