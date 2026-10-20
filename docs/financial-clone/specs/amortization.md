# Amortization Calculator

```json
{
  "id": "amortization",
  "title": "Amortization Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/amortization-calculator.html",
  "modes": [
    "standard",
    "extra payments"
  ],
  "fields": [
    "principal",
    "years and months",
    "annual rate",
    "start date",
    "recurring monthly extras with date",
    "yearly extras with date",
    "multiple dated one-time extras"
  ],
  "outputs": [
    "monthly payment",
    "total payments",
    "total interest",
    "monthly schedule"
  ],
  "assumptions": "Monthly amortization, early payoff caps final payment. Internal versus display rounding unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/amortization-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Amortization Schedule (schedule)

Local inputs: principal, years, months, rate, start, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated.

Local formula: Interest = opening balance × monthly rate; principal = payment − interest.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments.
