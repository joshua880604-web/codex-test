# HELOC Calculator

```json
{
  "id": "heloc",
  "title": "HELOC Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/heloc-calculator.html",
  "modes": [
    "interest-only draw then amortization",
    "optional closing expenses and annual charge",
    "maximum credit line from home equity"
  ],
  "fields": [
    "principal",
    "annual rate",
    "draw years",
    "repayment years",
    "closing fee amount/percent",
    "upfront or deducted",
    "annual charge",
    "equity subcalculator: current home value",
    "equity subcalculator: outstanding mortgage",
    "equity subcalculator: lender LTV selection"
  ],
  "outputs": [
    "draw monthly payment",
    "repayment monthly payment",
    "total payments",
    "total interest",
    "schedule",
    "maximum credit line"
  ],
  "assumptions": "Observed draw schedule pays interest only without reducing principal; repayment amortizes full balance. Example 50000 at 8% -> draw 333.33. APR and expense timing require interactive confirmation. Secondary form below amortization: maximum credit = home value * lender LTV - outstanding mortgage. Explicit prose example 500000 * 80% - 210000 = 190000.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
