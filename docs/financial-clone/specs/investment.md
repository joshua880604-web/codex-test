# Investment Calculator

```json
{
  "id": "investment",
  "title": "Investment Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/investment-calculator.html",
  "modes": [
    "Contribute Amount",
    "End Amount",
    "Return Rate",
    "Starting Amount",
    "Invest Length"
  ],
  "fields": [
    "target/end amount",
    "starting amount",
    "years",
    "return rate",
    "compound frequency",
    "additional contribution",
    "beginning/end",
    "month/year contribution"
  ],
  "outputs": [
    "solved parameter",
    "end balance",
    "starting amount",
    "total contributions",
    "total interest",
    "monthly/yearly accumulation schedule"
  ],
  "assumptions": [
    "Use FV=P(1+j)^n+C*((1+j)^n-1)/j*(1+j)^due; convert compounding to contribution-period rate; solve selected variable, root-find return/length with no-solution handling."
  ],
  "source_year": null,
  "limits": [
    "Mode-specific hide/show not browser-checked."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/investment-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### End Amount (end)

Local inputs: principal, years, months, rate, compound, annual, monthly, timing, tax, inflation.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Contribute Amount (contribution)

Local inputs: principal, years, months, rate, compound, annual, timing, tax, inflation, end.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Contribute Amount; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Return Rate (return)

Local inputs: principal, years, months, compound, annual, monthly, timing, tax, inflation, end.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Return Rate; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Starting Amount (starting)

Local inputs: years, months, rate, compound, annual, monthly, timing, tax, inflation, end.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Starting Amount; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.

### Invest Length (length)

Local inputs: principal, rate, compound, annual, monthly, timing, tax, inflation, end.

Local formula: Solve the periodic contribution and compound growth cash-flow equation.

Local default outputs: Invest Length; Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.
