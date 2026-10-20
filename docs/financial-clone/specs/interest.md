# Interest Calculator

```json
{
  "id": "interest",
  "title": "Interest Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/interest-calculator.html",
  "modes": [
    "accumulation"
  ],
  "fields": [
    "initial investment",
    "annual contribution",
    "monthly contribution",
    "contribute beginning/end",
    "interest rate",
    "compound frequency",
    "investment years/months",
    "tax rate",
    "inflation rate"
  ],
  "outputs": [
    "ending balance",
    "total principal",
    "contributions",
    "interest",
    "interest from initial/contributions",
    "inflation-adjusted buying power",
    "monthly/yearly schedule"
  ],
  "assumptions": [
    "Fixed rate; tax applied to interest each compound period; buying power=end/(1+inflation)^years; schedule frequency interpolation must be checked."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/interest-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Interest Calculator (accumulation)

Local inputs: principal, years, months, rate, compound, annual, monthly, timing, tax, inflation.

Local formula: Balance grows at the equivalent periodic rate, with contributions added at the selected timing.

Local default outputs: Ending balance; Total contributions; Starting amount; Additional contributions; Net investment earnings; Net earnings from starting amount; Net earnings from additional deposits; Tax on interest; Inflation-adjusted balance.
