# RMD Calculator

```json
{
  "id": "rmd",
  "title": "RMD Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/rmd-calculator.html",
  "modes": [
    "annual RMD",
    "optional future projection"
  ],
  "fields": [
    "birth year",
    "RMD year",
    "prior Dec31 balance",
    "spouse primary beneficiary yes/no",
    "spouse DOB",
    "optional return"
  ],
  "outputs": [
    "RMD",
    "distribution factor",
    "formula",
    "year/age/factor/RMD/end-balance projection"
  ],
  "assumptions": [
    "Use IRS590-B Uniform Lifetime unless spouse >10years younger and sole beneficiary, then joint table; source UI says primary but source prose sole, resolve discrepancy. RMD=prior-year balance/factor; age75 factor24.6; projection end balance=B*(1+r)-RMD, withdrawal year-end."
  ],
  "source_year": 2026,
  "limits": [
    "Official tables not yet downloaded; do not extrapolate factors. IRS topic URL returned404; use publication directly. Age thresholds vary by birth cohort; don't hardcode73 for all cohorts."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/rmd-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Required Minimum Distribution (annual)

Local inputs: birth, year, balance, spouse, spouse_birth, return, projection.

Local formula: RMD = previous year-end balance / applicable IRS distribution period.

Local default outputs: Age in distribution year; Distribution period; Annual RMD.
