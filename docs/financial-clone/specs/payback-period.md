# Payback Period Calculator

```json
{
  "id": "payback-period",
  "title": "Payback Period Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/payback-period-calculator.html",
  "modes": [
    "fixed annual cash flow",
    "irregular annual cash flow"
  ],
  "fields": [
    "initial investment",
    "annual cash flow",
    "annual change selector/value",
    "years",
    "discount rate",
    "expandable annual flows"
  ],
  "outputs": [
    "payback period",
    "discounted payback",
    "average returns",
    "schedule"
  ],
  "assumptions": [
    "Track cumulative nominal and discounted flows separately; interpolate fraction of crossing year; report never recovered if no crossing."
  ],
  "source_year": null,
  "limits": [
    "Change selector options and average-return definition unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/payback-period-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Fixed Cash Flow (fixed)

Local inputs: initial, discount, annual, change, change_unit, years.

Local formula: Find when cumulative (discounted) cash flow first recovers the initial investment.

Local default outputs: Net cash flow after investment; Net present value; Payback period (years); Discounted payback (years).

### Irregular Cash Flows (irregular)

Local inputs: initial, discount, flows.

Local formula: Find when cumulative (discounted) cash flow first recovers the initial investment.

Local default outputs: Net cash flow after investment; Net present value; Payback period (years); Discounted payback (years).
