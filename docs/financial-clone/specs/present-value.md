# Present Value Calculator

```json
{
  "id": "present-value",
  "title": "Present Value Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/present-value-calculator.html",
  "modes": [
    "future lump sum",
    "periodical deposits"
  ],
  "fields": [
    "FV",
    "N",
    "I/Y",
    "PMT",
    "beginning/end"
  ],
  "outputs": [
    "PV",
    "total interest",
    "FV",
    "principal",
    "schedule for deposit mode"
  ],
  "assumptions": [
    "PV=FV/(1+r)^N; deposit PV=PMT*(1-(1+r)^(-N))/r*(1+r)^due, zero-rate PV=PMT*N."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/present-value-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Future Lump Sum (lump)

Local inputs: future, periods, rate.

Local formula: PV = FV/(1+r)^N + PMT × (1 − (1+r)^−N)/r.

Local default outputs: Present value; Lump-sum present value; Payments present value.

### Periodic Payments (annuity)

Local inputs: future, periods, rate, payment, timing.

Local formula: PV = FV/(1+r)^N + PMT × (1 − (1+r)^−N)/r.

Local default outputs: Present value; Lump-sum present value; Payments present value.
