# Finance Calculator

```json
{
  "id": "finance",
  "title": "Finance Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/finance-calculator.html",
  "modes": [
    "FV",
    "PMT",
    "I/Y",
    "N",
    "PV"
  ],
  "fields": [
    "N periods",
    "annual I/Y",
    "PV",
    "PMT",
    "FV",
    "P/Y payment periods/year",
    "C/Y compounding/year",
    "payment beginning/end"
  ],
  "outputs": [
    "solved variable",
    "sum of periodic payments",
    "total interest",
    "period/PV/PMT/interest/FV schedule"
  ],
  "assumptions": [
    "Signed cash flow TVM: FV+PV*(1+j)^N+PMT*((1+j)^N-1)/j*(1+j)^due=0; j=(1+I/Y/CY)^(CY/PY)-1; j=0 uses FV+PV+PMT*N=0. Solve PV/PMT/FV algebraically, N logarithmically where defined and annual rate numerically. Opposite cash-flow signs required; reject no-solution and document multiple roots."
  ],
  "source_year": null,
  "limits": [
    "Fractional N schedule and solver domain unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/finance-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Solve FV (fv)

Local inputs: N, rate, PV, PMT, pay, compound, timing.

Local formula: PV × (1+i)^N + PMT × annuity factor + FV = 0.

Local default outputs: FV.

### Solve PMT (pmt)

Local inputs: N, rate, PV, FV, pay, compound, timing.

Local formula: PV × (1+i)^N + PMT × annuity factor + FV = 0.

Local default outputs: PMT.

### Solve I/Y (i-y)

Local inputs: N, PV, PMT, FV, pay, compound, timing.

Local formula: PV × (1+i)^N + PMT × annuity factor + FV = 0.

Local default outputs: I/Y.

### Solve N (n)

Local inputs: rate, PV, PMT, FV, pay, compound, timing.

Local formula: PV × (1+i)^N + PMT × annuity factor + FV = 0.

Local default outputs: N.

### Solve PV (pv)

Local inputs: N, rate, PMT, FV, pay, compound, timing.

Local formula: PV × (1+i)^N + PMT × annuity factor + FV = 0.

Local default outputs: PV.
