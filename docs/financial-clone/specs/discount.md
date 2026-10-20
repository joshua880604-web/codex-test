# Discount Calculator

```json
{
  "id": "discount",
  "title": "Discount Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/discount-calculator.html",
  "modes": [
    "percent off",
    "fixed amount off"
  ],
  "fields": [
    "before,discount,after,saved(any2)"
  ],
  "outputs": [
    "remaining values"
  ],
  "assumptions": "after=before-saved; percent saved=before*discount.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/discount-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Percent Off (percent)

Local inputs: before, rate.

Local formula: Sale price = original price × (1 − discount rate).

Local default outputs: Original price; Sale price; Amount saved; Discount rate.

### Amount Off (amount)

Local inputs: before, saved.

Local formula: Sale price = original price × (1 − discount rate).

Local default outputs: Original price; Sale price; Amount saved; Discount rate.

### Original Price (original)

Local inputs: after, rate.

Local formula: Sale price = original price × (1 − discount rate).

Local default outputs: Original price; Sale price; Amount saved; Discount rate.

### Discount Rate (rate)

Local inputs: before, after.

Local formula: Sale price = original price × (1 − discount rate).

Local default outputs: Original price; Sale price; Amount saved; Discount rate.
