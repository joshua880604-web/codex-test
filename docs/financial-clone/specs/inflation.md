# Inflation Calculator

```json
{
  "id": "inflation",
  "title": "Inflation Calculator",
  "category": "Other",
  "source_url": "https://www.calculator.net/inflation-calculator.html",
  "modes": [
    "historical CPI",
    "forward flat",
    "backward flat"
  ],
  "fields": [
    "amount,start/end month/year",
    "amount,rate,years"
  ],
  "outputs": [
    "equivalent amount"
  ],
  "assumptions": "Historical CPI-U BLS 1913–2026; value*endCPI/startCPI; forward compounds, backward discounts. Monthly dataset must be sourced.",
  "source_year": "1913–2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/inflation-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Historical CPI (historical)

Local inputs: amount, start_year, start_period, end_year, end_period.

Local formula: Adjusted amount = original amount × end CPI/start CPI.

Local default outputs: Equivalent purchasing-power amount; Cumulative inflation; Start CPI; End CPI.

### Future Value (forward)

Local inputs: amount, rate, years.

Local formula: Adjusted amount = amount × (1 + inflation)^years; divide to work backwards.

Local default outputs: Future equivalent amount; Cumulative inflation.

### Past Value (backward)

Local inputs: amount, rate, years.

Local formula: Adjusted amount = amount × (1 + inflation)^years; divide to work backwards.

Local default outputs: Past equivalent amount; Cumulative inflation.

### Custom CPI Indexes (custom)

Local inputs: amount, start_cpi, end_cpi.

Local formula: Adjusted amount = original amount × end CPI/start CPI.

Local default outputs: Equivalent purchasing-power amount; Cumulative inflation; Start CPI; End CPI.
