# Personal Loan Calculator

```json
{
  "id": "personal-loan",
  "title": "Personal Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/personal-loan-calculator.html",
  "modes": [
    "basic",
    "fee and insurance"
  ],
  "fields": [
    "amount,rate,years/months,start month/year",
    "origination amount/unit,deduct-from-loan or upfront,monthly insurance"
  ],
  "outputs": [
    "monthly payment,total payments,interest,payoff date,dated schedule"
  ],
  "assumptions": "Origination handling and insurance add-on need parity testing.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/personal-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Personal Loan (repayment)

Local inputs: principal, years, months, rate, origination, documentation, other_fee, treatment, insurance.

Local formula: APR solves net proceeds against all periodic loan payments and insurance charges.

Local default outputs: Payment including insurance; Payment per period; Total interest; Total payments; Number of payments; Loan fees; Net proceeds after fees; Nominal APR including insurance.
