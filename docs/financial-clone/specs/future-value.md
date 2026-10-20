# Future Value Calculator

```json
{
  "id": "future-value",
  "title": "Future Value Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/future-value-calculator.html",
  "modes": [
    "investment future value"
  ],
  "fields": [
    "N",
    "starting PV",
    "I/Y",
    "PMT per period",
    "beginning/end"
  ],
  "outputs": [
    "FV",
    "PV of entire cash flow",
    "periodic deposits",
    "interest",
    "schedule"
  ],
  "assumptions": [
    "Positive accumulation inputs; FV=PV*(1+r)^N+PMT*((1+r)^N-1)/r*(1+r)^due. Displayed PV includes discounted periodic deposits, not only initial principal."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/future-value-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Future Value (growth)

Local inputs: principal, periods, rate, payment, timing.

Local formula: FV = PV × (1+r)^N + PMT × ((1+r)^N−1)/r.

Local default outputs: Future value; Total contributions; Interest earned.
