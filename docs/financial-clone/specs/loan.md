# Loan Calculator

```json
{
  "id": "loan",
  "title": "Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/loan-calculator.html",
  "modes": [
    "amortized",
    "deferred single payment",
    "bond present value"
  ],
  "fields": [
    "amount or face value",
    "term years/months",
    "annual interest",
    "compounding",
    "payment frequency for amortized"
  ],
  "outputs": [
    "periodic payment,total payments,total interest,schedule",
    "maturity value and interest",
    "initial proceeds and interest"
  ],
  "assumptions": "Convert compound frequency to payment frequency; FV=P(1+r/m)^(mt), PV inverse.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Amortized Loan (amortized)

Local inputs: principal, years, months, rate, compound, pay.

Local formula: Payment = P × i/(1−(1+i)^−N). Compound frequency and payment frequency are independent.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Deferred Payment Loan (deferred)

Local inputs: principal, years, months, rate, compound.

Local formula: Maturity value = principal × (1+r/m)^(m×years).

Local default outputs: Amount due at maturity; Total interest.

### Bond Present Value (bond)

Local inputs: face, years, months, rate, compound.

Local formula: Present value = face value/(1+r/m)^(m×years).

Local default outputs: Bond present value; Discount from face value.
