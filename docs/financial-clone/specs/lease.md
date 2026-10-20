# Lease Calculator

```json
{
  "id": "lease",
  "title": "Lease Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/lease-calculator.html",
  "modes": [
    "fixed rate",
    "fixed payment"
  ],
  "fields": [
    "asset,residual,years/months,rate or monthly payment"
  ],
  "outputs": [
    "monthly payment or effective rate,total payments,total interest"
  ],
  "assumptions": "Balloon annuity payment=(asset-residual/(1+i)^n)*i/(1-(1+i)^(-n)); exact first-payment timing unknown.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/lease-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Fixed Interest Rate (rate)

Local inputs: price, residual, years, months, rate.

Local formula: Asset value = payment × annuity present-value factor + residual/(1+i)^N.

Local default outputs: Monthly payment; Nominal annual rate; Total lease payments; Total cost with residual purchase.

### Fixed Monthly Payment (payment)

Local inputs: price, residual, years, months, payment.

Local formula: Asset value = payment × annuity present-value factor + residual/(1+i)^N.

Local default outputs: Monthly payment; Nominal annual rate; Total lease payments; Total cost with residual purchase.
