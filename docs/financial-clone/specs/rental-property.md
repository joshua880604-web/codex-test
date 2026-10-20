# Rental Property Calculator

```json
{
  "id": "rental-property",
  "title": "Rental Property Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/rental-property-calculator.html",
  "modes": [
    "cash purchase or financed",
    "repairs or no repairs",
    "known sale value or appreciation"
  ],
  "fields": [
    "purchase price",
    "use loan",
    "down payment",
    "rate",
    "term",
    "closing costs",
    "repair toggle and cost",
    "repaired value",
    "annual tax/insurance/HOA/maintenance/other and annual increases",
    "monthly rent and increase",
    "other income and increase",
    "vacancy",
    "management percent",
    "sale known toggle",
    "annual appreciation or sale price",
    "hold years",
    "sale expense"
  ],
  "outputs": [
    "returns",
    "capitalization",
    "cash flow (exact result labels unobserved)"
  ],
  "assumptions": "Simulate yearly income/expenses, mortgage debt and sale proceeds; initial investment includes repairs and closing. Exact IRR timing, management base and taxable treatment unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/rental-property-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Rental Property Return (projection)

Local inputs: price, financed, down, rate, years, closing, repairs, repaired_value, rent, other_income, vacancy, management, tax, insurance, hoa, maintenance, other, rent_growth, other_income_growth, tax_growth, insurance_growth, hoa_growth, maintenance_growth, other_growth, appreciation, hold, sale_known, sale_price, selling.

Local formula: NOI = effective income − operating expenses; equity cash flow = NOI − debt service.

Local default outputs: Initial cash investment; First-year cash flow; Capitalization rate; First-year cash-on-cash; Net sale proceeds; Total investment profit; Annual IRR 1.
