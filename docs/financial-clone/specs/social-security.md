# Social Security Calculator

```json
{
  "id": "social-security",
  "title": "Social Security Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/social-security-calculator.html",
  "modes": [
    "ideal application age",
    "compare application ages"
  ],
  "fields": {
    "ideal application age": [
      "birth year",
      "life expectancy",
      "return",
      "COLA"
    ],
    "compare application ages": [
      "claim age1/monthly1",
      "claim age2/monthly2",
      "return",
      "COLA"
    ]
  },
  "outputs": [
    "ideal claim age",
    "comparison/breakeven (proposed)"
  ],
  "assumptions": [
    "This is claim-age optimization, not wage-history benefit estimation. SSA FRA 66 for 1943-54, increases 2 months/birthyear 1955-59, 67 for >=1960. Claim 62-70; delayed credits need additional official verification."
  ],
  "source_year": 2026,
  "limits": [
    "Ideal mode base benefit normalization unknown; no salary input; exact objective and timing unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
