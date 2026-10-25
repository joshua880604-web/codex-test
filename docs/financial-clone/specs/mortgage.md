# Mortgage Calculator

```json
{
  "id": "mortgage",
  "title": "Mortgage Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/mortgage-calculator.html",
  "modes": [
    "standard",
    "optional taxes and expenses",
    "extra payments",
    "biweekly comparison"
  ],
  "fields": [
    "house price",
    "down payment amount or percent",
    "years",
    "annual interest",
    "start month/year",
    "tax",
    "insurance",
    "PMI",
    "HOA",
    "other expense",
    "annual expense increases",
    "monthly extra and start date",
    "annual extra and start date",
    "dated one-time extra payments"
  ],
  "outputs": [
    "monthly mortgage",
    "monthly and lifetime expenses",
    "principal",
    "interest",
    "payoff date",
    "dated amortization"
  ],
  "assumptions": "Fixed monthly annuity with separate expenses; annual growth and dated extra principal need periodic simulation. PMI cancellation and exact fee base unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/mortgage-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Monthly Mortgage (monthly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, appraised_value.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Monthly principal & interest; Initial monthly total; Down payment; Financed loan amount; Upfront fee; Total interest; Total payments; Number of payments; Total taxes and other costs; Total out of pocket.

### Biweekly Comparison (biweekly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, appraised_value.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Biweekly payment; Total interest; Payments; Years to payoff.


### Approved repairs — 2026-10-25

- Years × 12 + additional months must be an integer from1 through12,000 (floating-point conversion tolerance1e-7). Partial years producing whole months remain supported. Applied to shared Mortgage/FHA/VA modes; other calculator term contracts are unchanged.
- Extra-payment rows require exactly two nonempty cells, with integer month1–12,000 and finite nonnegative amount up to1e15. Blank lines retain original error-row numbering; duplicate months add. Use1000 without thousands separators.
-100% down is an explicit no-loan result in both modes. Preserve initial monthly/annual property costs; omit fabricated schedules, charts and inferred lifetime totals. FHA MIP is zero. Positive-loan ownership totals cover only through modeled payoff.
- Optional Original appraised value at purchase is visible/validated only for Mortgage's requested80% original-LTV PMI option. Original value=min(purchase price, original purchase appraisal); blank assumes appraisal>=price. This is an approved-request assumption, separate from78% automatic and midpoint termination.
-38 independent Decimal control scenarios and12 prior invalid-input controls remain passing.193 default metric sets unchanged. Report:../mortgage-repairs-2026-10-25.md. Reference parity remains unverified.
