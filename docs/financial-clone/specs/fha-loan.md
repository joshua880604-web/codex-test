# FHA Loan Calculator

```json
{
  "id": "fha-loan",
  "title": "FHA Loan Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/fha-loan-calculator.html",
  "modes": [
    "standard FHA",
    "optional costs",
    "extra repayments",
    "biweekly comparison"
  ],
  "fields": [
    "house price",
    "down payment amount or percent",
    "years",
    "rate",
    "upfront MIP",
    "annual MIP",
    "MIP duration selection",
    "optional annual property tax/insurance/HOA/other",
    "start date",
    "annual increases",
    "monthly/yearly/lump extras with dates"
  ],
  "outputs": [
    "monthly mortgage",
    "MIP and expense breakdown",
    "loan including upfront MIP",
    "down payment",
    "upfront MIP",
    "total interest",
    "payoff date",
    "schedule"
  ],
  "assumptions": "Observed default example implies upfront MIP basis may be home price: house 500000, down 17500, upfront 8750, financed 491250. Must inspect rate input and compare before implementing statutory formula. Annual MIP duration selectable; exact options unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
