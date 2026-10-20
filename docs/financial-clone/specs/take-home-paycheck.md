# Take-Home-Paycheck Calculator

```json
{
  "id": "take-home-paycheck",
  "title": "Take-Home-Paycheck Calculator",
  "category": "Tax and Salary",
  "source_url": "https://www.calculator.net/take-home-pay-calculator.html",
  "modes": [
    "2026 paycheck/W-4"
  ],
  "fields": [
    "annual salary,pay frequency,filing status,children under17,other dependents,other income",
    "pretax withheld deductions,nonwithheld deductions,itemized deductions",
    "additional 2 incomes,state/city rates,each spouse65+,tips,overtime,vehicle interest,cash charity,self-employed"
  ],
  "outputs": [
    "net paycheck estimate",
    "W-4 steps3/4 assistance"
  ],
  "assumptions": "2026 US tax/W-4 incorporating OBBBA. Exact payroll and multi-job allocation needs validation.",
  "source_year": "2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/take-home-pay-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Paycheck Estimate (source-paycheck)

Local inputs: salary, pay_frequency, file_status, children, dependents, other_income, pretax, deductions, itemized, multiple_jobs, job2, job3, state_rate, local_rate, senior, spouse_senior, tips, overtime, car, cash_gifts, self_employed.

Local formula: This-job net = this-job gross − withheld deductions − allocated annual federal tax − this-job payroll taxes − entered state/city tax. Other job wages affect brackets but are not included in this paycheck.

Local default outputs: Take-home pay per period; Annual take-home pay; Gross pay per period; Annual federal tax allocated to this job.

### Take-Home Paycheck (paycheck)

Local inputs: filing, wages, spouse_wages, business, spouse_business, interest, exempt_interest, dividends, qualified, short, long, social, other, adjustments, student, itemized, salt, age65, tips, overtime, car, children, dependents, education0, education_type0, education1, education_type1, education2, education_type2, education3, education_type3, aotc_refundable, care, care_people, credits, amt, qbi, frequency, pretax, aftertax, state_rate, local_rate, extra_withheld.

Local formula: Net pay = gross wages − pre-tax deductions − estimated taxes − after-tax deductions.

Local default outputs: Take-home pay per period; Annual take-home pay; Gross pay per period.
