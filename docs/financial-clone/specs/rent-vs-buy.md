# Rent vs. Buy Calculator

```json
{
  "id": "rent-vs-buy",
  "title": "Rent vs. Buy Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/rent-vs-buy-calculator.html",
  "modes": [
    "buy/rent cost comparison"
  ],
  "fields": [
    "house price",
    "downpayment",
    "mortgage annual rate",
    "years",
    "purchase closing costs",
    "property tax and increase",
    "insurance",
    "HOA",
    "maintenance",
    "home appreciation",
    "expense increase",
    "sale closing costs",
    "rent",
    "rent increase",
    "renter insurance",
    "deposit",
    "upfront rental costs",
    "investment return",
    "federal marginal tax",
    "state marginal tax",
    "filing status"
  ],
  "outputs": [
    "crossover years",
    "average annual and monthly buy/rent expense by stay length through 30 years"
  ],
  "assumptions": "Requires yearly cashflows, sale proceeds and opportunity return; tax deduction assumptions and source year unknown. Do not implement as simple mortgage-minus-rent.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/rent-vs-buy-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Rent vs. Buy (comparison)

Local inputs: price, down, rate, years, buy_closing, selling, tax, insurance, hoa, maintenance, cost_growth, tax_growth, appreciation, rent, rent_growth, renter_insurance, deposit, rental_costs, return, tax_rate, standard.

Local formula: Compare buyer equity after sale with the renter portfolio, adding monthly cash-flow differences.

Local default outputs: First year buying leads; Buyer equity after 30 years; Renter terminal wealth after 30 years.
