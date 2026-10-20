# Marriage Tax Calculator

```json
{
  "id": "marriage-tax",
  "title": "Marriage Tax Calculator",
  "category": "Tax and Salary",
  "source_url": "https://www.calculator.net/marriage-calculator.html",
  "modes": [
    "before versus after marriage"
  ],
  "fields": [
    "each spouse earned/business income,interest/dividends,passive income,short/long gains,qualified dividends,retirement savings",
    "prior filing status,dependents,standard deduction toggle,total deductions,state/city rate,self-employed"
  ],
  "outputs": [
    "unknown"
  ],
  "assumptions": "2026 US federal; compare joint filing against two unmarried filings, not simply married-filing-separately.",
  "source_year": "2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/marriage-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Before vs. After Marriage (comparison)

Local inputs: year, filing1, filing2, wages, business, interest, exempt_interest, dividends, qualified, short, long, social, other, adjustments, student, itemized, salt, age65, tips, overtime, car, children, dependents, education0, education_type0, education1, education_type1, education2, education_type2, education3, education_type3, aotc_refundable, care, care_people, credits, amt, qbi, p2_wages, p2_business, p2_interest, p2_exempt_interest, p2_dividends, p2_qualified, p2_short, p2_long, p2_social, p2_other, p2_adjustments, p2_student, p2_itemized, p2_salt, p2_age65, p2_tips, p2_overtime, p2_car, p2_children, p2_dependents, p2_education0, p2_education_type0, p2_education1, p2_education_type1, p2_education2, p2_education_type2, p2_education3, p2_education_type3, p2_aotc_refundable, p2_care, p2_care_people, p2_credits, p2_amt, p2_qbi.

Local formula: Marriage penalty = joint federal liability − sum of unmarried federal liabilities.

Local default outputs: Your unmarried federal tax; Partner unmarried federal tax; Combined unmarried tax; Married filing jointly tax; Marriage penalty / negative bonus.
