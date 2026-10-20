# Rent Calculator

```json
{
  "id": "rent",
  "title": "Rent Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/rent-calculator.html",
  "modes": [
    "income/debt affordability"
  ],
  "fields": [
    "pretax income with frequency",
    "monthly debt payments"
  ],
  "outputs": [
    "affordable rent (exact bands/formula unknown)"
  ],
  "assumptions": "Normalize gross income to month. Threshold algorithm unobserved; do not assume 30% exact parity.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/rent-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Affordable Rent (affordability)

Local inputs: income, frequency, debts, housing_ratio, debt_ratio.

Local formula: Rent budget = min(gross monthly income × housing ratio, gross income × debt ratio − other debts).

Local default outputs: Monthly rent budget; Gross monthly income.
