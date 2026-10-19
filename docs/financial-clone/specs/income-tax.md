# Income Tax Calculator

```json
{
  "id": "income-tax",
  "title": "Income Tax Calculator",
  "category": "Tax and Salary",
  "source_url": "https://www.calculator.net/tax-calculator.html",
  "modes": [
    "2025 federal return",
    "2026 federal estimate"
  ],
  "fields": [
    "filing status",
    "young/other dependents",
    "each spouse age,wages,federal/state/local withholding,business income,estimated tax,Medicare wages",
    "Social Security,interest,ordinary/qualified dividends,passive income,short/long gains,other income,state/local rate",
    "tips,overtime,car interest,IRA,property tax,mortgage interest,charity,student interest,dependent care,4 education expenses,other deductions"
  ],
  "outputs": [
    "refund or amount owed"
  ],
  "assumptions": "US federal 2025/2026; automatically chooses larger standard/itemized deduction. Article contains conflicting legacy standard-deduction text; verify IRS before coding.",
  "source_year": "2025,2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
