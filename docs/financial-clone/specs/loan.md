# Loan Calculator

```json
{
  "id": "loan",
  "title": "Loan Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/loan-calculator.html",
  "modes": [
    "amortized",
    "deferred single payment",
    "bond present value"
  ],
  "fields": [
    "amount or face value",
    "term years/months",
    "annual interest",
    "compounding",
    "payment frequency for amortized"
  ],
  "outputs": [
    "periodic payment,total payments,total interest,schedule",
    "maturity value and interest",
    "initial proceeds and interest"
  ],
  "assumptions": "Convert compound frequency to payment frequency; FV=P(1+r/m)^(mt), PV inverse.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
