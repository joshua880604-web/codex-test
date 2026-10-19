# VA Mortgage Calculator

```json
{
  "id": "va-mortgage",
  "title": "VA Mortgage Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/va-mortgage-calculator.html",
  "modes": [
    "funding fee financed",
    "funding fee upfront",
    "eligibility/repeat-use/disability",
    "optional costs/extras/biweekly"
  ],
  "fields": [
    "house price",
    "down payment amount/percent",
    "years",
    "rate",
    "active/veteran or reserve/guard or surviving spouse",
    "previous VA use",
    "service disability 10%+",
    "funding fee treatment",
    "taxes/insurance/HOA/other",
    "start date",
    "annual increases",
    "dated monthly/yearly/lump extra"
  ],
  "outputs": [
    "payment",
    "funding fee rate and amount",
    "principal",
    "down payment",
    "total payments",
    "interest",
    "schedule"
  ],
  "assumptions": "Fee eligibility and down-payment thresholds matter; captured default zero down first-use funding fee 2.15%. Full statutory rate table/year not yet verified.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.
