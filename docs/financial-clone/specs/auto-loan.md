# Auto Loan Calculator

```json
{
  "id": "auto-loan",
  "title": "Auto Loan Calculator",
  "category": "Auto",
  "source_url": "https://www.calculator.net/auto-loan-calculator.html",
  "modes": [
    "solve monthly payment",
    "solve affordable total price"
  ],
  "fields": [
    "price or monthly budget",
    "months",
    "annual rate",
    "cash incentive",
    "downpayment",
    "trade-in",
    "debt on trade-in",
    "state",
    "sales tax rate",
    "registration/title/other fees",
    "include tax and fees in loan"
  ],
  "outputs": [
    "principal",
    "tax",
    "upfront cash",
    "monthly pay or price",
    "total installments",
    "interest",
    "full expense",
    "amortization"
  ],
  "assumptions": "State rules affect trade-in and incentive taxable base; negative trade equity adds loan debt. Need verified state rule list, not universal trade-in subtraction.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
