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
