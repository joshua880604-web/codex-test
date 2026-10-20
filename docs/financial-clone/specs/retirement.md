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

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/retirement-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Required Savings (required)

Local inputs: age, retire, life, income, salary_growth, replacement, replacement_unit, return, inflation, other, balance, saving, saving_unit.

Local formula: Target = sum of first-year income gap × (1 + inflation)^(year − 1) / (1 + return)^year; required monthly saving funds target less future current savings.

Local default outputs: Required savings at retirement; Required monthly saving; Projected retirement savings; Projected surplus / shortfall; First-year retirement income need.

### Saving Plan (saving)

Local inputs: age, retire, target, balance, return.

Local formula: Monthly saving = (target − future current savings)/annuity accumulation factor.

Local default outputs: Required monthly saving; Annual total of monthly savings; Required year-end annual saving; Current savings future value.

### Monthly Withdrawal (withdrawal)

Local inputs: age, retire, life, balance, saving, annual, return, inflation.

Local formula: Retirement balance includes current savings, month-end deposits and additional year-end deposits. Initial monthly withdrawal = retirement balance × (1 + monthly inflation) / real-rate monthly annuity present-value factor.

Local default outputs: Balance at retirement; Initial monthly withdrawal; Monthly withdrawal in today’s dollars.

### Savings Longevity (longevity)

Local inputs: balance, withdrawal, return.

Local formula: N = −ln(1 − PV×i/PMT)/ln(1+i); actual month-end withdrawals use ceil(N), with the last withdrawal capped at the available balance.

Local default outputs: Years savings last; Monthly withdrawals; Total withdrawn; Final monthly withdrawal.
