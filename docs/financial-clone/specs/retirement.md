# Retirement Calculator

```json
{
  "id": "retirement",
  "title": "Retirement Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/retirement-calculator.html",
  "modes": [
    "required savings",
    "saving plan",
    "monthly withdrawal",
    "savings longevity"
  ],
  "fields": {
    "required savings": [
      "age",
      "retirement age",
      "life expectancy",
      "pretax income",
      "income growth",
      "replacement income value/unit",
      "return",
      "inflation",
      "other monthly income",
      "current savings",
      "future saving value/unit"
    ],
    "saving plan": [
      "age",
      "retirement age",
      "target",
      "current savings",
      "return"
    ],
    "monthly withdrawal": [
      "age",
      "retirement age",
      "life expectancy",
      "current savings",
      "annual/monthly contribution",
      "return",
      "inflation"
    ],
    "savings longevity": [
      "balance",
      "monthly withdrawal",
      "return"
    ]
  },
  "outputs": [
    "target/shortfall",
    "required savings plan",
    "monthly withdrawal",
    "depletion time (proposed; results not submitted)"
  ],
  "assumptions": [
    "Separate accumulation and payout phases; inflation escalation distinct from nominal returns; nondepleting portfolio must yield explicit sustainable result."
  ],
  "source_year": null,
  "limits": [
    "Exact contribution/withdrawal timing, selectors and result details unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Retirement feature update — 2026-10-20

See ../retirement-parity-improvements.md for the current model: 401(k) now includes a separate inflation-indexed retirement schedule and CSV; matching includes a conservative contribution window and infeasibility checks; early withdrawal has explicit qualification fields; Retirement monthly-withdrawal includes separate year-end annual deposits. Original mode/query IDs and annual accumulation are preserved. New numerical results have independent tests; exact original-site form/output parity remains unverified.
