# Payment Calculator

```json
{
  "id": "payment",
  "title": "Payment Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/payment-calculator.html",
  "modes": [
    "fixed term",
    "fixed payments"
  ],
  "fields": [
    "principal",
    "years or monthly payment",
    "interest"
  ],
  "outputs": [
    "monthly payment or payoff term",
    "total interest,total paid,monthly amortization"
  ],
  "assumptions": "Fixed interest monthly annuity; final payment truncated.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/payment-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Fixed Term (term)

Local inputs: principal, rate, years, months.

Local formula: Fixed installment amortization; solve the payment count when the installment is supplied.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Fixed Payment (payment)

Local inputs: principal, rate, payment.

Local formula: Fixed installment amortization; solve the payment count when the installment is supplied.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.
