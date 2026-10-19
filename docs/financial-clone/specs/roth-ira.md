# Roth IRA Calculator

```json
{
  "id": "roth-ira",
  "title": "Roth IRA Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/roth-ira-calculator.html",
  "modes": [
    "Roth vs taxable; manual/max contributions"
  ],
  "fields": [
    "current balance",
    "annual contribution",
    "maximize yes/no",
    "return",
    "current age",
    "retirement age",
    "marginal tax"
  ],
  "outputs": [
    "Roth/taxable retirement balance",
    "principal",
    "interest",
    "tax",
    "annual schedule",
    "difference"
  ],
  "assumptions": [
    "2026 IRA cap 7500 below50, 8600 age50+; Roth earnings untaxed vs annual taxable earnings; observed first year 30000 start +7500 end contribution +1800 interest implies end-year contributions."
  ],
  "source_year": 2026,
  "limits": [
    "Future cap indexing unknown; eligibility is not computed by fields; avoid claiming full Roth tax eligibility."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
