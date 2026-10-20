# Auto Loan Calculator

```json
{
  "id": "auto-loan",
  "title": "Auto Loan Calculator",
  "category": "Auto",
  "source_url": "https://www.calculator.net/auto-loan-calculator.html",
  "modes": [
    "solve monthly payment",
    "solve affordable total price"
  ],
  "fields": [
    "price or monthly budget",
    "months",
    "annual rate",
    "cash incentive",
    "downpayment",
    "trade-in",
    "debt on trade-in",
    "state",
    "sales tax rate",
    "registration/title/other fees",
    "include tax and fees in loan"
  ],
  "outputs": [
    "principal",
    "tax",
    "upfront cash",
    "monthly pay or price",
    "total installments",
    "interest",
    "full expense",
    "amortization"
  ],
  "assumptions": "State rules affect trade-in and incentive taxable base; negative trade equity adds loan debt. Need verified state rule list, not universal trade-in subtraction.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/auto-loan-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Monthly Payment (payment)

Local inputs: tax_state, purchase_year, price, months, rate, rebate, down, trade, owed, tax, fees, trade_credit, rebate_tax, finance_fees.

Local formula: Financed amount = vehicle price − incentives − down payment − trade value + trade debt + financed taxes and fees.

Local default outputs: Vehicle price; Sales tax; Upfront cash; Payment per period; Total interest; Total payments; Number of payments.

### Affordable Vehicle Price (price)

Local inputs: tax_state, purchase_year, payment, months, rate, rebate, down, trade, owed, tax, fees, trade_credit, rebate_tax, finance_fees.

Local formula: Financed amount = vehicle price − incentives − down payment − trade value + trade debt + financed taxes and fees.

Local default outputs: Vehicle price; Sales tax; Upfront cash; Payment per period; Total interest; Total payments; Number of payments.
