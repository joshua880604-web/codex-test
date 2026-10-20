# IRA Calculator

```json
{
  "id": "ira",
  "title": "IRA Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/ira-calculator.html",
  "modes": [
    "Traditional/SEP/SIMPLE vs Roth vs taxable"
  ],
  "fields": [
    "current balance",
    "annual pretax contribution",
    "return",
    "current age",
    "retirement age",
    "current marginal tax",
    "retirement tax"
  ],
  "outputs": [
    "balances before/after tax",
    "comparison differences",
    "schedule unknown"
  ],
  "assumptions": [
    "Traditional compounds pretax then applies retirement tax; Roth/taxable starting balance and contributions converted after current tax. These types compared under equal inputs, not plan-specific contribution eligibility."
  ],
  "source_year": 2026,
  "limits": [
    "IRA cap enforcement and schedule details unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/ira-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Traditional, Roth, and Taxable (comparison)

Local inputs: age, retire, balance, contribution, max, return, tax, retire_tax.

Local formula: Traditional after-tax balance = pre-tax account × (1 − retirement tax); Roth uses after-tax contributions.

Local default outputs: Traditional IRA pre-tax balance; Traditional IRA after-tax value; Comparable taxable investment balance; Total contributions; Roth balance with equivalent after-tax contribution.
