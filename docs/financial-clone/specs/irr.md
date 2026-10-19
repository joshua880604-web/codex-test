# Internal Rate of Return (IRR) Calculator

```json
{
  "id": "irr",
  "title": "Internal Rate of Return (IRR) Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/irr-calculator.html",
  "modes": [
    "fixed cash flow",
    "irregular annual cash flow"
  ],
  "fields": [
    "initial investment",
    "holding years/months",
    "ending balance",
    "fixed inflow/outflow and frequency",
    "beginning/end timing",
    "annual cash-flow rows expandable"
  ],
  "outputs": [
    "IRR (proposed; result not fetched)"
  ],
  "assumptions": [
    "Fixed mode allows no recurrent flow. Irregular here means unequal AMOUNTS at annual intervals, not arbitrary dates; dated flows belong to Average Return. Solve NPV(r)=sum(CFt/(1+r)^t)=0; enumerate/flag multiple roots and no sign change rather than always return one number."
  ],
  "source_year": null,
  "limits": [
    "Maximum annual row count unknown; fixed frequency selector unknown; result fields unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
