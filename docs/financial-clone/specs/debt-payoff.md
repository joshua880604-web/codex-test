# Debt Payoff Calculator

```json
{
  "id": "debt-payoff",
  "title": "Debt Payoff Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/debt-payoff-calculator.html",
  "modes": [
    "avalanche fixed total",
    "avalanche decreasing total"
  ],
  "fields": [
    "up to20 debts name,balance,payment,APR",
    "monthly extra,yearly extra,onetime extra and month",
    "fixed total yes/no"
  ],
  "outputs": [
    "time to repay",
    "optimal payoff sequence"
  ],
  "assumptions": "Yes redistributes retired debt payments; No reduces total payment when debt repaid. Exact annual extra month unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/debt-payoff-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Debt Payoff Plan (avalanche)

Local inputs: debts, rollover, extra, yearly, once, once_month.

Local formula: Accrue each loan’s interest separately and apply minimums followed by avalanche extra payments.

Local default outputs: Months until debt-free; Total interest; Total paid.

### Debt Snowball (snowball)

Local inputs: debts, rollover, extra, yearly, once, once_month.

Local formula: Accrue monthly interest, pay minimums, then rank remaining balances from smallest to largest. Ties use the higher APR first.

Local default outputs: Months until debt-free; Total interest; Total paid.
