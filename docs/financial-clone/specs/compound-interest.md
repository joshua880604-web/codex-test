# Compound Interest Calculator

```json
{
  "id": "compound-interest",
  "title": "Compound Interest Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/compound-interest-calculator.html",
  "modes": [
    "rate conversion"
  ],
  "fields": [
    "input interest rate",
    "input compounding frequency",
    "output compounding frequency"
  ],
  "outputs": [
    "equivalent output rate"
  ],
  "assumptions": [
    "This page converts rates; it is NOT an accumulation calculator. Match effective annual rates: Rout=n*((1+Rin/m)^(m/n)-1); continuous limits use exp/log."
  ],
  "source_year": null,
  "limits": [
    "Frequency select options unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/compound-interest-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Equivalent Interest Rate (conversion)

Local inputs: rate, from, to.

Local formula: Effective yield = (1 + r/m)^m − 1; equivalent nominal rate = n × ((1 + yield)^(1/n) − 1).

Local default outputs: Equivalent interest rate; Effective annual yield.

### Compound Growth (growth)

Local inputs: principal, years, months, rate, compound, annual, monthly, timing, tax, inflation.

Local formula: Balance grows at the equivalent periodic rate, with contributions added at the selected timing.

Local default outputs: Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.
