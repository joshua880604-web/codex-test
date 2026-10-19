# Return on Investment (ROI) Calculator

```json
{
  "id": "roi",
  "title": "Return on Investment (ROI) Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/roi-calculator.html",
  "modes": [
    "use dates",
    "use length"
  ],
  "fields": [
    "invested amount",
    "returned amount",
    "years or from/to dates"
  ],
  "outputs": [
    "gain",
    "ROI",
    "annualized ROI",
    "length in years"
  ],
  "assumptions": [
    "Gain=returned-invested; ROI=gain/invested; annualized=(returned/invested)^(1/years)-1; reject zero capital, nonpositive duration and undefined fractional powers."
  ],
  "source_year": null,
  "limits": [
    "Date year denominator unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
