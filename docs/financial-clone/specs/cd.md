# CD Calculator

```json
{
  "id": "cd",
  "title": "CD Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/cd-calculator.html",
  "modes": [
    "CD accumulation"
  ],
  "fields": [
    "initial deposit",
    "interest rate",
    "compound",
    "deposit years/months",
    "marginal tax rate"
  ],
  "outputs": [
    "end balance",
    "total interest",
    "monthly/yearly schedule"
  ],
  "assumptions": [
    "Tax-adjusted compound accumulation; no contributions."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/cd-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### CD Return (accumulation)

Local inputs: principal, rate, compound, years, months, tax.

Local formula: FV = P × (1 + r/m)^(m×t). Taxes are applied to total interest.

Local default outputs: Maturity balance; Interest earned; Tax on interest; After-tax balance.
