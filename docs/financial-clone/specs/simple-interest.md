# Simple Interest Calculator

```json
{
  "id": "simple-interest",
  "title": "Simple Interest Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/simple-interest-calculator.html",
  "modes": [
    "Balance",
    "Principal",
    "Term",
    "Rate"
  ],
  "fields": [
    "end balance",
    "principal",
    "interest rate and rate unit",
    "term and term unit"
  ],
  "outputs": [
    "solved value",
    "total interest",
    "calculation steps",
    "balance graph",
    "breakdown",
    "schedule"
  ],
  "assumptions": [
    "B=P*(1+r*t); algebraically invert selected parameter, consistently convert rate/term units; reject division by zero when underdetermined."
  ],
  "source_year": null,
  "limits": [
    "Unit selectors unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/simple-interest-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Balance (balance)

Local inputs: principal, rate, rate_unit, years, term_unit.

Local formula: A = P × (1 + r × t).

Local default outputs: Balance.

### Principal (principal)

Local inputs: balance, rate, rate_unit, years, term_unit.

Local formula: A = P × (1 + r × t).

Local default outputs: Principal.

### Term (years)

Local inputs: principal, balance, rate, rate_unit, term_unit.

Local formula: A = P × (1 + r × t).

Local default outputs: Term.

### Rate (rate)

Local inputs: principal, balance, rate_unit, years, term_unit.

Local formula: A = P × (1 + r × t).

Local default outputs: Rate.
