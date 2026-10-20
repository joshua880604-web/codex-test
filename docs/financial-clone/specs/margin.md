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

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/margin-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Profit · Solve revenue (revenue)

Local inputs: cost, margin.

Local formula: Margin = (revenue − cost)/revenue; markup = (revenue − cost)/cost.

Local default outputs: Revenue; Cost; Profit; Gross margin; Markup.

### Profit · Solve cost (cost)

Local inputs: revenue, margin.

Local formula: Margin = (revenue − cost)/revenue; markup = (revenue − cost)/cost.

Local default outputs: Revenue; Cost; Profit; Gross margin; Markup.

### Profit · Solve margin (margin)

Local inputs: cost, revenue.

Local formula: Margin = (revenue − cost)/revenue; markup = (revenue − cost)/cost.

Local default outputs: Revenue; Cost; Profit; Gross margin; Markup.

### Profit · Solve profit (profit)

Local inputs: cost, revenue.

Local formula: Margin = (revenue − cost)/revenue; markup = (revenue − cost)/cost.

Local default outputs: Revenue; Cost; Profit; Gross margin; Markup.

### Stock Margin (stock)

Local inputs: price, shares, requirement.

Local formula: Required equity = share price × shares × margin requirement.

Local default outputs: Position value; Required equity; Borrowed amount.

### Currency Margin (currency)

Local inputs: units, rate, leverage.

Local formula: Required margin = units × FX rate / leverage.

Local default outputs: Notional value in quote currency; Required margin in quote currency.
