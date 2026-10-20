# FHA Loan Calculator

```json
{
  "id": "fha-loan",
  "title": "FHA Loan Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/fha-loan-calculator.html",
  "modes": [
    "standard FHA",
    "optional costs",
    "extra repayments",
    "biweekly comparison"
  ],
  "fields": [
    "house price",
    "down payment amount or percent",
    "years",
    "rate",
    "upfront MIP",
    "annual MIP",
    "MIP duration selection",
    "optional annual property tax/insurance/HOA/other",
    "start date",
    "annual increases",
    "monthly/yearly/lump extras with dates"
  ],
  "outputs": [
    "monthly mortgage",
    "MIP and expense breakdown",
    "loan including upfront MIP",
    "down payment",
    "upfront MIP",
    "total interest",
    "payoff date",
    "schedule"
  ],
  "assumptions": "Observed default example implies upfront MIP basis may be home price: house 500000, down 17500, upfront 8750, financed 491250. Must inspect rate input and compare before implementing statutory formula. Annual MIP duration selectable; exact options unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/fha-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### FHA Mortgage (monthly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, upfront, annual_mip, mip_years.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Monthly principal & interest; Initial monthly total; Down payment; Financed loan amount; Upfront fee; Total interest; Total payments; Number of payments; Total taxes and other costs; Total out of pocket.

### Biweekly Comparison (biweekly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, upfront, annual_mip, mip_years.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Biweekly payment; Total interest; Payments; Years to payoff.
