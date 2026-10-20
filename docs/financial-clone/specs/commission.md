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

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/commission-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Commission Calculator (any-two)

Local inputs: sales, rate, commission.

Local formula: Commission = sales × rate / 100.

Local default outputs: Commission; Sales amount; Commission rate.

### Solve commission (commission)

Local inputs: sales, rate.

Local formula: Commission = sales × commission rate.

Local default outputs: Sales amount; Commission rate; Commission.

### Solve sales (sales)

Local inputs: rate, commission.

Local formula: Commission = sales × commission rate.

Local default outputs: Sales amount; Commission rate; Commission.

### Solve rate (rate)

Local inputs: sales, commission.

Local formula: Commission = sales × commission rate.

Local default outputs: Sales amount; Commission rate; Commission.

### Tiered Commission and Base Pay (tiered)

Local inputs: sales, base, tier_unit, method, tiers.

Local formula: Progressive commission applies each rate only to sales inside that band.

Local default outputs: Commission; Base pay; Total earnings.
