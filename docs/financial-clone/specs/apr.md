# APR Calculator

```json
{
  "id": "apr",
  "title": "APR Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/apr-calculator.html",
  "modes": [
    "general loan APR",
    "mortgage APR"
  ],
  "fields": [
    "general: principal",
    "years/months",
    "rate",
    "compound period",
    "payback period",
    "financed fees",
    "upfront fees",
    "mortgage: house value",
    "down payment",
    "years",
    "rate",
    "fees",
    "points",
    "annual PMI"
  ],
  "outputs": [
    "APR",
    "financed amount",
    "upfront fees",
    "periodic payment",
    "total payments",
    "interest",
    "all payments and fees",
    "amortization link"
  ],
  "assumptions": "APR solves discounted net proceeds against actual repayment cashflows, including fees and PMI. Convert compound frequency separately from pay frequency. Exact APR annualization and PMI duration unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
