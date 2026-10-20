# Debt Consolidation Calculator

```json
{
  "id": "debt-consolidation",
  "title": "Debt Consolidation Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/debt-consolidation-calculator.html",
  "modes": [
    "existing versus consolidated loan"
  ],
  "fields": [
    "up to20 debts name,balance,payment,APR",
    "new amount,rate,term years/months,fee/points and unit"
  ],
  "outputs": [
    "APR,monthly payments,payoff duration,total interest comparisons"
  ],
  "assumptions": "Solve fee-adjusted new APR from net proceeds; combined existing APR algorithm unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/debt-consolidation-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Debt Consolidation (comparison)

Local inputs: debts, new_rate, years, fees, finance.

Local formula: Consolidate balances and compare total interest plus origination fees on future cash flows.

Local default outputs: Payment per period; Total interest; Total payments; Number of payments; Origination fee; Current plan total interest; Interest and fee savings.
