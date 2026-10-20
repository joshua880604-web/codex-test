# College Cost Calculator

```json
{
  "id": "college-cost",
  "title": "College Cost Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/college-cost-calculator.html",
  "modes": [
    "college savings planning"
  ],
  "fields": [
    "current annual cost or preset,increase rate,duration,savings coverage%,current balance,return,tax rate,years until college"
  ],
  "outputs": [
    "unknown"
  ],
  "assumptions": "2025–26 presets private65470/public-in30990/public-out50920/2year21320. 529 tax0; future costs grow annually; contribution timing unknown.",
  "source_year": "2025–2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/college-cost-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### College Savings Plan (planning)

Local inputs: cost, increase, duration, coverage, balance, return, tax, years.

Local formula: Discount future annual college costs to enrollment, then solve the savings contribution required.

Local default outputs: Total projected college costs; Savings required at enrollment; Required monthly saving; Additional lump sum needed today.
