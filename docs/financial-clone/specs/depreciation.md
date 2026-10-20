# Depreciation Calculator

```json
{
  "id": "depreciation",
  "title": "Depreciation Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/depreciation-calculator.html",
  "modes": [
    "straight-line",
    "declining balance",
    "sum-of-years-digits",
    "partial-year variants"
  ],
  "fields": [
    "cost,salvage,life,factor,round dollars,partial year,convention,service date,accounting-year start"
  ],
  "outputs": [
    "unknown"
  ],
  "assumptions": "SL=(cost-salvage)/life; declining=book*factor/life; SYD weighted remaining life. Partial convention options and terminal switch unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/depreciation-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Straight Line (straight)

Local inputs: cost, salvage, life, partial, convention, first_months, service_date, fiscal_end, round.

Local formula: Annual depreciation = (cost − salvage)/life.

Local default outputs: Depreciable basis; Total depreciation; Ending book value.

### Declining Balance (declining)

Local inputs: cost, salvage, life, factor, partial, convention, first_months, service_date, fiscal_end, round.

Local formula: Depreciation = opening book value × factor/life, capped at salvage.

Local default outputs: Depreciable basis; Total depreciation; Ending book value.

### Sum of Years’ Digits (syd)

Local inputs: cost, salvage, life, partial, convention, first_months, service_date, fiscal_end, round.

Local formula: Depreciation = (cost − salvage) × remaining life / sum of years.

Local default outputs: Depreciable basis; Total depreciation; Ending book value.
