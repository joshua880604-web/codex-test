# Cash Back or Low Interest Calculator

```json
{
  "id": "cash-back-or-low-interest",
  "title": "Cash Back or Low Interest Calculator",
  "category": "Auto",
  "source_url": "https://www.calculator.net/cash-back-or-low-interest-calculator.html",
  "modes": [
    "compare both offers"
  ],
  "fields": [
    "rebate",
    "high APR",
    "low APR",
    "price",
    "months",
    "downpayment",
    "trade-in",
    "state",
    "tax rate",
    "fees",
    "finance fees toggle"
  ],
  "outputs": [
    "recommended offer",
    "interest savings",
    "each principal/tax/upfront/payment/interest/total expense"
  ],
  "assumptions": "Compare total expense (not only interest); rebate taxes differ by state. State exemption list in reference prose needs dated verification.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/cash-back-or-low-interest-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Cash Back vs. Low Interest (compare)

Local inputs: price, down, months, cashback, standard, low, tax_state, purchase_year, trade, owed, tax, fees, trade_credit, rebate_tax, finance_fees.

Local formula: Compare total loan payments on the rebate-reduced balance and the promotional-rate balance.

Local default outputs: Monthly payment with cash back; Monthly payment with low rate; Total payments with cash back; Total payments with low rate; Sales tax with cash back; Sales tax with low rate; Cash-back upfront cash; Low-rate upfront cash; Cash-back cost advantage.
