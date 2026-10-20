# Budget Calculator

```json
{
  "id": "budget",
  "title": "Budget Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/budget-calculator.html",
  "modes": [
    "personal budget"
  ],
  "fields": [
    "4 income streams each frequency,total income tax%",
    "housing7,transport6,debt3,living5,health2,children4,savings4,misc6 each amount/frequency"
  ],
  "outputs": [
    "annualized income and expense ratios",
    "budget category breakdown"
  ],
  "assumptions": "Income before tax; 401k/IRA and college savings marked pretax. Exact tax allocation/frequency options unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/budget-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Personal Budget (budget)

Local inputs: tax, Income_0, Incomef0, Income_1, Incomef1, Income_2, Incomef2, Income_3, Incomef3, Housing_0, Housingf0, Housing_1, Housingf1, Housing_2, Housingf2, Housing_3, Housingf3, Housing_4, Housingf4, Housing_5, Housingf5, Housing_6, Housingf6, Transportation_0, Transportationf0, Transportation_1, Transportationf1, Transportation_2, Transportationf2, Transportation_3, Transportationf3, Transportation_4, Transportationf4, Transportation_5, Transportationf5, Debt_0, Debtf0, Debt_1, Debtf1, Debt_2, Debtf2, Living_0, Livingf0, Living_1, Livingf1, Living_2, Livingf2, Living_3, Livingf3, Living_4, Livingf4, Health_0, Healthf0, Health_1, Healthf1, Children_0, Childrenf0, Children_1, Childrenf1, Children_2, Childrenf2, Children_3, Childrenf3, Savings_0, Savingsf0, Savings_1, Savingsf1, Savings_2, Savingsf2, Savings_3, Savingsf3, Miscellaneous_0, Miscellaneousf0, Miscellaneous_1, Miscellaneousf1, Miscellaneous_2, Miscellaneousf2, Miscellaneous_3, Miscellaneousf3, Miscellaneous_4, Miscellaneousf4, Miscellaneous_5, Miscellaneousf5.

Local formula: Monthly surplus = monthly after-tax income − spending − savings allocations.

Local default outputs: Monthly take-home income; Monthly spending and saving; Monthly surplus / deficit; Annual surplus / deficit.
