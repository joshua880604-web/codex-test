# Student Loan Calculator

```json
{
  "id": "student-loan",
  "title": "Student Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/student-loan-calculator.html",
  "modes": [
    "simple solve 1of4",
    "payoff altogether",
    "extra repayment",
    "normal repayment",
    "projection"
  ],
  "fields": [
    "balance,term,rate,payment (any3)",
    "monthly/yearly/onetime extra",
    "years to graduation,annual borrowing,current balance,term,grace months,rate,pay-interest-in-school toggle"
  ],
  "outputs": [
    "payment,interest,total",
    "comparison savings/time",
    "borrowed,graduation/grace balance,monthly repayment,total interest"
  ],
  "assumptions": "Projection equal monthly repayment after graduation/grace, no fees. Borrowing timing/capitalization unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/student-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Normal Repayment (normal)

Local inputs: principal, years, months, rate.

Local formula: Monthly payment amortizes the principal over the entered term.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Solve payment (solve-payment)

Local inputs: principal, rate, years.

Local formula: Fixed monthly installment cash-flow equation.

Local default outputs: Loan balance; Annual interest rate; Term in months; Monthly payment.

### Solve principal (solve-principal)

Local inputs: rate, years, payment.

Local formula: Fixed monthly installment cash-flow equation.

Local default outputs: Loan balance; Annual interest rate; Term in months; Monthly payment.

### Solve rate (solve-rate)

Local inputs: principal, years, payment.

Local formula: Fixed monthly installment cash-flow equation.

Local default outputs: Loan balance; Annual interest rate; Term in months; Monthly payment.

### Solve term (solve-term)

Local inputs: principal, rate, payment.

Local formula: Fixed monthly installment cash-flow equation.

Local default outputs: Loan balance; Annual interest rate; Term in months; Monthly payment.

### Extra Repayment (extra)

Local inputs: principal, years, months, rate, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Simulate monthly principal reduction including extra payments.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.

### Pay Off Altogether (all)

Local inputs: principal, rate, payment.

Local formula: Interest avoided = remaining scheduled payments − current principal.

Local default outputs: Immediate principal payoff; Future interest avoided.

### In-School Loan Projection (projection)

Local inputs: principal, annual, school, grace, rate, years, pay_interest.

Local formula: Borrow at each academic year start; accrue simple interest during school and grace, then capitalize once.

Local default outputs: Borrowed principal; Capitalized interest; In-school interest paid; Balance entering repayment; Payment per period; Total interest; Total payments; Number of payments.
