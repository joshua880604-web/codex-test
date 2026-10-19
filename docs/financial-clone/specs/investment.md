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
