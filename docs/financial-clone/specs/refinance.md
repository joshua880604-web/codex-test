# Refinance Calculator

```json
{
  "id": "refinance",
  "title": "Refinance Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/refinance-calculator.html",
  "modes": [
    "current loan information selector (exact option names unknown)"
  ],
  "fields": [
    "current balance",
    "current monthly payment",
    "original principal",
    "original years",
    "remaining years/months",
    "current rate",
    "new term",
    "new rate",
    "points",
    "fees",
    "cash out"
  ],
  "outputs": [
    "side-by-side existing and new loan",
    "exact output fields unknown"
  ],
  "assumptions": "Infer missing current balance/payment/term from selected information mode. Compare future cashflows and upfront fees; break-even conventions unobserved.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/refinance-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Current Balance and Payment (balance)

Local inputs: principal, payment, rate, new_rate, new_years, cashout, points, fees, finance.

Local formula: New principal = balance + cash out + financed costs; compare amortization cash flows.

Local default outputs: New monthly payment; Current monthly payment; Monthly payment reduction; Closing costs; Simple closing-cost break-even (months); Current future interest; New total interest.

### Original Loan Information (original)

Local inputs: principal, years, months, rate, elapsed, new_rate, new_years, cashout, points, fees, finance.

Local formula: New principal = balance + cash out + financed costs; compare amortization cash flows.

Local default outputs: New monthly payment; Current monthly payment; Monthly payment reduction; Closing costs; Simple closing-cost break-even (months); Current future interest; New total interest.
