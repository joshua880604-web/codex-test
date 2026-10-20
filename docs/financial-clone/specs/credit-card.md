# Credit Card Calculator

```json
{
  "id": "credit-card",
  "title": "Credit Card Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/credit-card-calculator.html",
  "modes": [
    "fixed monthly amount",
    "fixed timeframe"
  ],
  "fields": [
    "balance,APR",
    "monthly amount or years/months",
    "payment shortcuts interest+1%,2%,3%,4%,5%"
  ],
  "outputs": [
    "payoff time or payment"
  ],
  "assumptions": "Shortcut behavior and minimum floors unknown; amortize and detect nonamortization.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/credit-card-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Fixed Monthly Amount (payment)

Local inputs: principal, rate, payment.

Local formula: Monthly interest = opening balance × APR/12; apply the selected payment rule.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Fixed Timeframe (term)

Local inputs: principal, rate, years, months.

Local formula: Monthly interest = opening balance × APR/12; apply the selected payment rule.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Percentage Minimum Payment (minimum)

Local inputs: principal, rate, minimum, floor, interest_extra.

Local formula: Monthly interest = opening balance × APR/12; apply the selected payment rule.

Local default outputs: Months to repay; Total interest; Total payments.
