# Down Payment Calculator

```json
{
  "id": "down-payment",
  "title": "Down Payment Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/down-payment-calculator.html",
  "modes": [
    "solve home price from cash",
    "solve required cash from home price",
    "solve downpayment percentage from home price and cash"
  ],
  "fields": [
    "cash and/or home price",
    "downpayment percent when applicable",
    "include closing cost toggle with amount/percent",
    "annual rate",
    "years"
  ],
  "outputs": [
    "house price or cash needed or downpayment percentage",
    "downpayment dollars",
    "closing expenses",
    "principal",
    "monthly payment",
    "low-downpayment PMI notice"
  ],
  "assumptions": "Cash = downpayment + closing. For percentage closing costs on house value, price = cash/(downpayment fraction+closing fraction); fixed closing case subtract before dividing.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
