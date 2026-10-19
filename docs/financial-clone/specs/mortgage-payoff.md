# Mortgage Payoff Calculator

```json
{
  "id": "mortgage-payoff",
  "title": "Mortgage Payoff Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/mortgage-payoff-calculator.html",
  "modes": [
    "known remaining term / pay all",
    "known remaining term / extras",
    "known remaining term / biweekly",
    "known remaining term / normal",
    "unknown remaining term / extras",
    "unknown remaining term / biweekly",
    "unknown remaining term / normal"
  ],
  "fields": [
    "original principal and original years if known",
    "remaining years/months if known",
    "otherwise current balance and monthly payment",
    "annual rate",
    "extra monthly/yearly/lump amount"
  ],
  "outputs": [
    "remaining balance",
    "original vs accelerated payments and interest",
    "payoff duration",
    "interest/time saved",
    "amortization link"
  ],
  "assumptions": "Known term infers current balance; unknown term solves remaining payment count. Need catch negative amortization. Exact biweekly interest convention unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
