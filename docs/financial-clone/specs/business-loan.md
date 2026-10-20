# Business Loan Calculator

```json
{
  "id": "business-loan",
  "title": "Business Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/business-loan-calculator.html",
  "modes": [
    "fee-adjusted loan"
  ],
  "fields": [
    "amount,rate,compound,term years/months,pay frequency,origination,documentation,other fees"
  ],
  "outputs": [
    "payment,total payments,interest,interest+fee,APR,schedule"
  ],
  "assumptions": "Payment annuity; solve net-proceeds cashflow rate for APR. Fee unit specifics unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/business-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Business Loan (repayment)

Local inputs: principal, years, months, rate, compound, pay, origination, documentation, other_fee, treatment, insurance.

Local formula: APR solves net proceeds against all periodic loan payments and insurance charges.

Local default outputs: Payment including insurance; Payment per period; Total interest; Total payments; Number of payments; Loan fees; Net proceeds after fees; Nominal APR including insurance.
