# Average Return Calculator

```json
{
  "id": "average-return",
  "title": "Average Return Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/average-return-calculator.html",
  "modes": [
    "dated cash flows",
    "average and cumulative return"
  ],
  "fields": [
    "start balance/date",
    "end balance/date",
    "up to 50 deposit/withdrawal amount/date rows",
    "up to 60 return/years/months rows"
  ],
  "outputs": [
    "annual average return",
    "cumulative return"
  ],
  "assumptions": [
    "Dated cash flow mode is money-weighted return solving discounted flows with actual dates; compounded return mode multiplies growth factors and annualizes over summed time."
  ],
  "source_year": null,
  "limits": [
    "Source prose for second average is ambiguous; exact arithmetic-vs-geometric output requires submission; day/year denominator unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/average-return-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Average and Cumulative Return (returns)

Local inputs: returns, periods.

Local formula: Arithmetic = sum(r)/N; geometric = product(1+r)^(1/N)−1.

Local default outputs: Arithmetic average; Geometric average; Cumulative return; Annualized geometric return.

### Dated Cash Flows (cashflows)

Local inputs: cashflows.

Local formula: Σ CFᵢ/(1+r)^((dateᵢ−date₀)/365) = 0.

Local default outputs: Annual IRR 1.

### Variable Period Returns (variable-periods)

Local inputs: period_returns.

Local formula: Growth = product(1 + period return); annualized return = growth^(1/total years) − 1.

Local default outputs: Total holding years; Cumulative return; Annualized compound return; Time-weighted simple annual return.
