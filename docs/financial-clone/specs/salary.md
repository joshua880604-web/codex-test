# Salary Calculator

```json
{
  "id": "salary",
  "title": "Salary Calculator",
  "category": "Tax and Salary",
  "source_url": "https://www.calculator.net/salary-calculator.html",
  "modes": [
    "frequency conversion"
  ],
  "fields": [
    "salary amount/frequency",
    "weekly hours",
    "weekly days",
    "annual holidays",
    "annual vacation days"
  ],
  "outputs": [
    "hourly,daily,weekly,biweekly,semimonthly,monthly,quarterly,annual; unadjusted and adjusted"
  ],
  "assumptions": "52 weeks annually; hourly/daily input unadjusted, other inputs already adjusted. Annual workdays=weekly days*52; adjusted factor=(workdays-holidays-vacation)/workdays.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/salary-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Salary Conversion (conversion)

Local inputs: salary, frequency, hours, days, holidays, vacation.

Local formula: Annual pay = hourly rate × weekly hours × 52; adjusted annual pay subtracts unpaid days.

Local default outputs: Unadjusted annual salary; Adjusted annual salary; Unadjusted hourly rate.
