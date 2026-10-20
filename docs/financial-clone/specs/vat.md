# VAT Calculator — unified any-two form

Source: https://www.calculator.net/vat-calculator.html

## Observed source behavior

The source explicitly instructs users to provide any two values from VAT rate, net price, gross price and tax amount to calculate the remaining values. Four inputs and Calculate/Clear controls are observed via text. Exact defaults, submission error messages, zero-value policies and screenshots are not verified.

## Local implementation

One mode (`any-two`), four optional numeric fields, exactly two known values per calculation. Zero counts as a supplied value. Default local pair: rate 20%, net 100; gross and tax blank. These defaults are not claimed to be extracted from the source. Results show all four values. Clear empties all four fields. Switching tabs is no longer required. Existing shared links with old VAT mode names use the unified form, preserving their supplied inputs without injecting default values.

With percentage rate R, fraction r=R/100:

| Known pair | Solution |
| --- | --- |
| Rate + net | tax=net*r; gross=net+tax |
| Rate + gross | net=gross/(1+r); tax=gross-net |
| Rate + tax | net=tax/r; gross=net+tax (r>0) |
| Net + gross | tax=gross-net; R=100*tax/net (net>0) |
| Net + tax | gross=net+tax; R=100*tax/net (net>0) |
| Gross + tax | net=gross-tax; R=100*tax/net (net>0) |

## Explicit local validation policy

- Fewer or more than two values: request exactly two values.
- Amounts and VAT rate must be finite and nonnegative.
- Gross cannot be below net; tax cannot exceed gross.
- Zero rate with positive tax, or zero net with positive tax: inconsistent.
- Rate 0 with tax 0, or two zero amounts without a known rate: insufficient information; do not invent a price or rate.
- Zero rate plus known net/gross is valid; positive rate plus zero net/gross/tax gives zero amounts and preserves that known rate.
- Internal precision is retained, money displayed to two decimals.

The validation policy follows the equations and ordinary nonnegative VAT amounts; exact original handling of these exceptional cases has not been observed. This is functional parity for the documented any-two workflow, not a verified visual or edge-message match.

## Verification

`tests/vat.test.ts` covers all six pairs, zero-tax cases, indeterminate pairs, invalid combinations and input count. `tests/reference.test.ts` retains source prose VAT examples. `scripts/browser-vat-qa.mjs` covers all six pairs, keyboard submission, Clear, stale-result removal, shared/legacy URLs and responsive widths.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/vat-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### VAT Calculator (any-two)

Local inputs: rate, net, gross, tax.

Local formula: Gross price = net price + tax amount; tax amount = net price × VAT rate / 100.

Local default outputs: Net amount; VAT amount; Gross amount; VAT rate.
