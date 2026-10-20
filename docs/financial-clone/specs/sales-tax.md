# Sales Tax Calculator

```json
{
  "id": "sales-tax",
  "title": "Sales Tax Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/sales-tax-calculator.html",
  "modes": [
    "solve any missing value"
  ],
  "fields": [
    "before price,tax rate,after price"
  ],
  "outputs": [
    "missing value"
  ],
  "assumptions": "after=before*(1+rate); two inputs required.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/sales-tax-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### After-Tax Price (after)

Local inputs: before, rate.

Local formula: After-tax price = before-tax price × (1 + tax rate).

Local default outputs: Before-tax price; Sales tax; After-tax price; Tax rate.

### Before-Tax Price (before)

Local inputs: after, rate.

Local formula: After-tax price = before-tax price × (1 + tax rate).

Local default outputs: Before-tax price; Sales tax; After-tax price; Tax rate.

### Sales Tax Rate (rate)

Local inputs: before, after.

Local formula: After-tax price = before-tax price × (1 + tax rate).

Local default outputs: Before-tax price; Sales tax; After-tax price; Tax rate.
