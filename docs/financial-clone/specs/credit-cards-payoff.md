# Credit Cards Payoff Calculator

```json
{
  "id": "credit-cards-payoff",
  "title": "Credit Cards Payoff Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/credit-card-payoff-calculator.html",
  "modes": [
    "debt avalanche"
  ],
  "fields": [
    "monthly budget",
    "up to20 cards name,balance,minimum,APR;6 initially visible"
  ],
  "outputs": [
    "payoff schedule"
  ],
  "assumptions": "Pay minima then direct remainder to highest APR. Exact rollover timing unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/credit-card-payoff-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Credit Card Payoff Plan (avalanche)

Local inputs: debts, budget.

Local formula: Debt avalanche: minimums on all debts, extra to the highest rate; freed payments roll over.

Local default outputs: Months until debt-free; Total interest; Total paid.
