# Savings Calculator

```json
{
  "id": "savings",
  "title": "Savings Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/savings-calculator.html",
  "modes": [
    "savings accumulation"
  ],
  "fields": [
    "initial deposit",
    "annual contribution",
    "annual contribution yearly increase",
    "monthly contribution",
    "monthly contribution yearly increase",
    "interest rate",
    "compound",
    "years",
    "tax rate"
  ],
  "outputs": [
    "end balance",
    "initial deposit",
    "contributions",
    "interest earned",
    "monthly/yearly schedule"
  ],
  "assumptions": [
    "Negative deposits/contributions allowed per source; increase contribution amounts annually. Text introduction mentions inflation but extracted form exposes no inflation field: unknown."
  ],
  "source_year": null,
  "limits": [
    "Contribution timing unknown; do not silently substitute Interest fields."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/savings-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Savings Calculator (accumulation)

Local inputs: principal, years, months, rate, compound, annual, monthly, timing, tax, inflation, annual_increase, monthly_increase.

Local formula: Balance grows at the equivalent periodic rate, with contributions added at the selected timing.

Local default outputs: Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Savings Goal: Monthly Deposit (goal-contribution)

Local inputs: end, principal, years, months, rate, compound, annual, timing, tax, inflation.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Required monthly deposit; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Savings Goal: Time Needed (goal-time)

Local inputs: end, principal, rate, compound, annual, monthly, timing, tax, inflation.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Years to savings goal; Months to savings goal; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.
