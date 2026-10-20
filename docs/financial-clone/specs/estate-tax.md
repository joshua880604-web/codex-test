# Estate Tax Calculator

```json
{
  "id": "estate-tax",
  "title": "Estate Tax Calculator",
  "category": "Tax and Salary",
  "source_url": "https://www.calculator.net/estate-tax-calculator.html",
  "modes": [
    "federal estate tax"
  ],
  "fields": [
    "real estate,investments,cash,vehicles/property,retirement,life insurance,other assets",
    "debt,funeral/admin/claims,charity,state estate tax,lifetime gifts"
  ],
  "outputs": [
    "federal estate tax estimate"
  ],
  "assumptions": "Federal only. Page lists 2026 lifetime exemption $15m and top rate 40%; detailed computation unknown.",
  "source_year": "2026",
  "fetched_at": "2026-10-19",
  "limits": "Observed via text only; exact options/defaults and interactive parity unknown."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/estate-tax-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Federal Estate Tax (federal)

Local inputs: asset0, asset1, asset2, asset3, asset4, asset5, asset6, debts, administration, charity, marital, state, gifts, gift_tax, portability.

Local formula: Unified estate/gift tax on adjusted taxable transfers minus applicable exclusion credit and prior gift tax.

Local default outputs: Gross estate; Taxable estate; 2026 applicable exclusion; Estimated federal estate tax.
