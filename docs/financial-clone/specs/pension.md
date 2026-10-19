# Pension Calculator

```json
{
  "id": "pension",
  "title": "Pension Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/pension-calculator.html",
  "modes": [
    "lump sum vs monthly",
    "single life vs joint survivor",
    "work longer"
  ],
  "fields": {
    "lump sum vs monthly": [
      "retirement age",
      "lump sum",
      "return",
      "monthly pension",
      "COLA"
    ],
    "single life vs joint survivor": [
      "retirement age",
      "life expectancy",
      "spouse age at retirement",
      "spouse life expectancy",
      "single monthly",
      "joint monthly",
      "return",
      "COLA"
    ],
    "work longer": [
      "retirement age1/monthly1",
      "retirement age2/monthly2",
      "return",
      "COLA"
    ]
  },
  "outputs": [
    "option comparison and breakeven (proposed)"
  ],
  "assumptions": [
    "Discount or accumulate cash flows to common comparison date; continue survivor payments through spouse expectancy. No pension entitlement calculation from years worked."
  ],
  "source_year": null,
  "limits": [
    "Joint survivor percentage assumption and result details unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
