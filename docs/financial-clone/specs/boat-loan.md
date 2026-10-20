# Boat Loan Calculator

```json
{
  "id": "boat-loan",
  "title": "Boat Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/boat-loan-calculator.html",
  "modes": [
    "total price",
    "monthly payment inverse"
  ],
  "fields": [
    "price or payment,term/unit,rate,down payment/unit,trade value,tax,fees,finance-fees toggle"
  ],
  "outputs": [
    "payment,loan amount,tax,upfront,total paid,interest,total cost,schedule"
  ],
  "assumptions": "Trade-in tax treatment and inverse down-payment percentage require validation.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/boat-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Monthly Payment (payment)

Local inputs: price, down, trade, tax, fees, finance, rate, years.

Local formula: Financed balance = price − down − trade + financed tax and fees.

Local default outputs: Boat price; Sales tax; Upfront cash; Payment per period; Total interest; Total payments; Number of payments.

### Boat Price (price)

Local inputs: payment, down, trade, tax, fees, finance, rate, years.

Local formula: Financed balance = price − down − trade + financed tax and fees.

Local default outputs: Boat price; Sales tax; Upfront cash; Payment per period; Total interest; Total payments; Number of payments.
