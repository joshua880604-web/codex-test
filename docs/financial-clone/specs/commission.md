# Commission Calculator

```json
{
  "id": "commission",
  "title": "Commission Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/commission-calculator.html",
  "modes": [
    "simple solve1of3",
    "tiered/base"
  ],
  "fields": [
    "sales,rate,commission(any2)",
    "base toggle/amount/unit,vary-with-price toggle,flat commission/unit,up to8 tier bounds/rates/unit"
  ],
  "outputs": [
    "commission"
  ],
  "assumptions": "simple=sales*rate. Tier incremental vs whole-price exact behavior needs validation.",
  "source_year": "not applicable",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
