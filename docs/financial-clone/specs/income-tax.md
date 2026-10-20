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

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/tax-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Federal Income Tax (federal)

Local inputs: year, filing, wages, spouse_wages, business, spouse_business, interest, exempt_interest, dividends, qualified, short, long, social, other, adjustments, student, itemized, salt, age65, tips, overtime, car, children, dependents, education0, education_type0, education1, education_type1, education2, education_type2, education3, education_type3, aotc_refundable, care, care_people, credits, amt, qbi, withheld, dividend_definition, passive, ira_deduction, mortgage_interest, eligible_itemized_charity, property_tax, state_withheld, local_withheld, spouse_state_withheld, spouse_local_withheld, spouse_withheld, estimated_paid, spouse_estimated_paid, medicare_wages, spouse_medicare_wages, cash_gifts.

Local formula: Progressive ordinary tax + preferential capital-gains tax + applicable additional taxes − credits.

Local default outputs: Estimated federal income tax; Estimated refund; Adjusted gross income; Taxable income; Effective federal tax rate.
