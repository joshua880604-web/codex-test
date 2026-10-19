# Auto Lease Calculator

```json
{
  "id": "auto-lease",
  "title": "Auto Lease Calculator",
  "category": "Auto",
  "source_url": "https://www.calculator.net/auto-lease-calculator.html",
  "modes": [
    "solve monthly payment",
    "solve total price"
  ],
  "fields": [
    "price or monthly payment",
    "months",
    "rate type selector (APR/money factor inferred from prose, exact options unknown)",
    "rate",
    "downpayment",
    "trade-in",
    "tax",
    "residual dollars"
  ],
  "outputs": [
    "payment or price",
    "exact other labels unknown"
  ],
  "assumptions": "Standard lease payment = depreciation/term + (adjusted capital cost + residual)*moneyFactor; percentage APR/2400 gives money factor. Need tax and downpayment conventions confirmed.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
