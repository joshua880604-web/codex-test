# VA Mortgage Calculator

```json
{
  "id": "va-mortgage",
  "title": "VA Mortgage Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/va-mortgage-calculator.html",
  "modes": [
    "funding fee financed",
    "funding fee upfront",
    "eligibility/repeat-use/disability",
    "optional costs/extras/biweekly"
  ],
  "fields": [
    "house price",
    "down payment amount/percent",
    "years",
    "rate",
    "active/veteran or reserve/guard or surviving spouse",
    "previous VA use",
    "service disability 10%+",
    "funding fee treatment",
    "taxes/insurance/HOA/other",
    "start date",
    "annual increases",
    "dated monthly/yearly/lump extra"
  ],
  "outputs": [
    "payment",
    "funding fee rate and amount",
    "principal",
    "down payment",
    "total payments",
    "interest",
    "schedule"
  ],
  "assumptions": "Fee eligibility and down-payment thresholds matter; captured default zero down first-use funding fee 2.15%. Full statutory rate table/year not yet verified.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/va-mortgage-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### VA Mortgage (monthly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, repeat, exempt, fee_treatment.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Monthly principal & interest; Initial monthly total; Down payment; Financed loan amount; Upfront fee; Total interest; Total payments; Number of payments; Total taxes and other costs; Total out of pocket.

### Biweekly Comparison (biweekly)

Local inputs: price, down, down_unit, years, months, rate, start, tax, tax_unit, insurance, insurance_unit, pmi, pmi_unit, pmi_years, pmi_policy, hoa, hoa_unit, other, other_unit, tax_growth, insurance_growth, hoa_growth, other_growth, extra_monthly, extra_yearly, extra_once, extra_once_month, extra_start, extra_yearly_start, dated, repeat, exempt, fee_treatment.

Local formula: Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.

Local default outputs: Biweekly payment; Total interest; Payments; Years to payoff.
