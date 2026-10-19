# Margin Calculator

```json
{
  "id": "margin",
  "title": "Margin Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/margin-calculator.html",
  "modes": [
    "profit margin",
    "stock margin",
    "currency margin"
  ],
  "fields": [
    "cost,revenue,margin,profit(any2)",
    "stock price,shares,requirement%",
    "FX rate,margin ratio,units"
  ],
  "outputs": [
    "profit,margin,markup",
    "required stock funds",
    "required FX funds"
  ],
  "assumptions": "profit=revenue-cost; margin=profit/revenue; markup=profit/cost; stock=price*shares*requirement; FX=rate*units/leverage.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
