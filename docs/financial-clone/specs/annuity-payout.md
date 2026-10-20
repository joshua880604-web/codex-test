# Annuity Payout Calculator

```json
{
  "id": "annuity-payout",
  "title": "Annuity Payout Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/annuity-payout-calculator.html",
  "modes": [
    "Fix Length",
    "Fix Payment"
  ],
  "fields": [
    "principal",
    "annual interest/return",
    "years or payment amount",
    "payout frequency"
  ],
  "outputs": [
    "payment or duration",
    "total payments",
    "total interest",
    "yearly balance schedule"
  ],
  "assumptions": [
    "Payout annuity inverse; fixed-payment at/below periodic interest may last forever; rate convention must be matched (do not assume effective vs nominal)."
  ],
  "source_year": null,
  "limits": [
    "Fix Payment exact field label and frequency options unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/annuity-payout-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Fix Length (length)

Local inputs: principal, rate, frequency, years.

Local formula: Payout = principal / annuity present-value factor.

Local default outputs: Payment each period; Total payments; Total investment earnings.

### Fix Payment (payment)

Local inputs: principal, rate, frequency, payment.

Local formula: Payout = principal / annuity present-value factor.

Local default outputs: Payout duration in years; Number of payments; Total payouts; Total investment earnings.
