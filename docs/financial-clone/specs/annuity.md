# Annuity Calculator

```json
{
  "id": "annuity",
  "title": "Annuity Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/annuity-calculator.html",
  "modes": [
    "accumulation"
  ],
  "fields": [
    "starting principal",
    "annual addition",
    "monthly addition",
    "beginning/end",
    "annual growth",
    "years"
  ],
  "outputs": [
    "end balance",
    "starting principal",
    "additions",
    "return",
    "monthly/yearly accumulation schedule"
  ],
  "assumptions": [
    "Accumulation only, not payout; effective annual growth converted to monthly by (1+r)^(1/12)-1, as observed schedule suggests."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
