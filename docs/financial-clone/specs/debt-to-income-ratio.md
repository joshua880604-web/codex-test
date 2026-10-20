# Debt-to-Income Ratio Calculator

```json
{
  "id": "debt-to-income-ratio",
  "title": "Debt-to-Income Ratio Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/debt-ratio-calculator.html",
  "modes": [
    "income and liability totals"
  ],
  "fields": [
    "salary",
    "pension/social security",
    "investment earnings",
    "other income",
    "rent",
    "mortgage",
    "real estate tax",
    "HOA",
    "homeowner insurance",
    "card debt",
    "student loan",
    "auto loan",
    "other liability",
    "individual frequency for each"
  ],
  "outputs": [
    "DTI",
    "exact result breakdown unknown"
  ],
  "assumptions": "Convert each selected period to common monthly basis; debt/income *100. Front-end housing and back-end all debts discussed.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/debt-ratio-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Debt-to-Income Ratio (ratio)

Local inputs: v0, f0, v1, f1, v2, f2, v3, f3, v4, f4, v5, f5, v6, f6, v7, f7, v8, f8, v9, f9, v10, f10, v11, f11, v12, f12.

Local formula: DTI = monthly debt payments / gross monthly income × 100%.

Local default outputs: Total debt-to-income ratio; Housing-to-income ratio; Gross monthly income; Monthly debt payments.
