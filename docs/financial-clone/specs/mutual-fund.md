# Mutual Fund Calculator

```json
{
  "id": "mutual-fund",
  "title": "Mutual Fund Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/mutual-fund-calculator.html",
  "modes": [
    "fund projection"
  ],
  "fields": [
    "initial investment",
    "annual/monthly contributions",
    "annual return",
    "holding years/months",
    "sales charge",
    "deferred sales charge",
    "annual operating expenses"
  ],
  "outputs": [
    "ending value",
    "principal",
    "contributions",
    "net return",
    "net annual IRR",
    "sales charges",
    "operating expenses",
    "total fees"
  ],
  "assumptions": [
    "Model front load on deposits, operating fee throughout holding and back load at sale; net IRR on investor cash flows."
  ],
  "source_year": null,
  "limits": [
    "Exact fee assessment timing and deferred-charge base unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/mutual-fund-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Mutual Fund Return (projection)

Local inputs: principal, years, months, rate, annual, monthly, front, back, expense.

Local formula: Front-end charges reduce each contribution; recurring expenses reduce the effective annual return.

Local default outputs: Net redemption value; Balance without charges; Effect of fees and lost growth.
