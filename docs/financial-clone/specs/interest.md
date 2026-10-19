# Interest Calculator

```json
{
  "id": "interest",
  "title": "Interest Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/interest-calculator.html",
  "modes": [
    "accumulation"
  ],
  "fields": [
    "initial investment",
    "annual contribution",
    "monthly contribution",
    "contribute beginning/end",
    "interest rate",
    "compound frequency",
    "investment years/months",
    "tax rate",
    "inflation rate"
  ],
  "outputs": [
    "ending balance",
    "total principal",
    "contributions",
    "interest",
    "interest from initial/contributions",
    "inflation-adjusted buying power",
    "monthly/yearly schedule"
  ],
  "assumptions": [
    "Fixed rate; tax applied to interest each compound period; buying power=end/(1+inflation)^years; schedule frequency interpolation must be checked."
  ],
  "source_year": null,
  "limits": []
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
