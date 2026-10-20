# HELOC Calculator

```json
{
  "id": "heloc",
  "title": "HELOC Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/heloc-calculator.html",
  "modes": [
    "interest-only draw then amortization",
    "optional closing expenses and annual charge",
    "maximum credit line from home equity"
  ],
  "fields": [
    "principal",
    "annual rate",
    "draw years",
    "repayment years",
    "closing fee amount/percent",
    "upfront or deducted",
    "annual charge",
    "equity subcalculator: current home value",
    "equity subcalculator: outstanding mortgage",
    "equity subcalculator: lender LTV selection"
  ],
  "outputs": [
    "draw monthly payment",
    "repayment monthly payment",
    "total payments",
    "total interest",
    "schedule",
    "maximum credit line"
  ],
  "assumptions": "Observed draw schedule pays interest only without reducing principal; repayment amortizes full balance. Example 50000 at 8% -> draw 333.33. APR and expense timing require interactive confirmation. Secondary form below amortization: maximum credit = home value * lender LTV - outstanding mortgage. Explicit prose example 500000 * 80% - 210000 = 190000.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/heloc-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Draw and Repayment Periods (draw-repay)

Local inputs: principal, rate, draw, years, closing, closing_unit, closing_treatment, charge.

Local formula: Average draw payment = balance × monthly interest + annual fee/12 during draw only; repayment amortizes the balance without the annual fee.

Local default outputs: Monthly draw payment; Monthly repayment; Cash disbursed at closing; Closing costs paid upfront; Net initial proceeds after closing costs; Total interest; Fees and annual charges; Annual fees during draw; Nominal APR including fees.

### Maximum Credit (maximum-credit)

Local inputs: value, mortgage, ltv.

Local formula: Maximum credit = home value × maximum LTV − outstanding mortgage balance.

Local default outputs: Estimated maximum HELOC; Maximum total secured debt.
