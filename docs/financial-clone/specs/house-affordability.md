# House Affordability Calculator

```json
{
  "id": "house-affordability",
  "title": "House Affordability Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/house-affordability-calculator.html",
  "modes": [
    "income and debt",
    "fixed housing budget"
  ],
  "fields": [
    "gross annual household income",
    "years",
    "rate",
    "monthly nonhousing debt",
    "down payment amount or percent",
    "annual property tax/HOA/insurance amount or percent",
    "DTI selection",
    "fixed monthly budget in second form",
    "optional maintenance in budget form"
  ],
  "outputs": [
    "unknown: no default result in captured text"
  ],
  "assumptions": "Income model applies selected front-end and back-end housing caps, then solves price including percent expenses. Page discusses conventional 28/36, FHA 31/43, VA 41/41; exact selectable presets unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/house-affordability-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Based on Income (income)

Local inputs: income, debt, front, back, down, down_unit, rate, years, tax_rate, tax_unit, insurance, insurance_unit, hoa, hoa_unit, maintenance, maintenance_unit.

Local formula: Budget = mortgage payment + annual property tax/12 + monthly insurance and HOA.

Local default outputs: Estimated home price; Down payment; Loan amount; Monthly housing budget.

### Based on Monthly Budget (budget)

Local inputs: budget, down, down_unit, rate, years, tax_rate, tax_unit, insurance, insurance_unit, hoa, hoa_unit, maintenance, maintenance_unit.

Local formula: Budget = mortgage payment + annual property tax/12 + monthly insurance and HOA.

Local default outputs: Estimated home price; Down payment; Loan amount; Monthly housing budget.
