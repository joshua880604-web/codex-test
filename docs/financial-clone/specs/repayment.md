# Repayment Calculator

```json
{
  "id": "repayment",
  "title": "Repayment Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/repayment-calculator.html",
  "modes": [
    "fixed time",
    "fixed installment"
  ],
  "fields": [
    "balance,APR,compound,payment frequency",
    "years/months or installment"
  ],
  "outputs": [
    "installment or duration,total payments,interest,schedule"
  ],
  "assumptions": "Fixed rate; compounding and pay frequency distinct.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/repayment-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Loan Payoff with Extra Payments (extra-payments)

Local inputs: principal, rate, payment, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Accrue monthly interest; apply the regular payment plus scheduled extra principal. Compare interest and payment count with the regular-payment baseline.

Local default outputs: Interest saved; Months saved; Payment per period; Total interest; Total payments; Number of payments.

### Fixed Term (term)

Local inputs: principal, rate, years, months, compound, pay.

Local formula: Fixed installment amortization; solve the payment count when the installment is supplied.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Fixed Payment (payment)

Local inputs: principal, rate, payment, compound, pay.

Local formula: Fixed installment amortization; solve the payment count when the installment is supplied.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.
