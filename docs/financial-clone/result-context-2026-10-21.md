# Contextual input and result explanations — 2026-10-21

Keep the existing compact calculation flow. No modal, automatic history, installation prompt, new dependency or external API.

## Scope

- Mortgage monthly: distinguish principal-and-interest from starting modeled ownership outlay.
- Loan amortized: identify selected payment frequency, interest total and excluded costs.
- Compound growth, Interest and Savings accumulation: separate deposits (including initial principal) from net earnings/loss after entered interest tax. Rate conversion receives no accumulation explanation.
- Retirement required savings: explain projected surplus/shortfall without promising adequacy. Saving Plan: monthly versus alternative year-end annual saving are not additive.
- Federal income tax: retain selected tax year and distinguish total liability from refund/balance due. Does not describe the model as a complete take-home-pay estimate.
- Targeted accessible field hints cover annual nominal vs effective rates, compounding vs payment frequency, annual vs monthly deposits, retirement units, and tax-year/withholding meaning. Existing model-specific hints take precedence.

Explanations derive from named result metrics. They disappear with stale results when inputs change and recompute with valid results. Existing schedules, model notes, sharing, precision and calculation formulas remain unchanged. No explanation is invented for unmatched tools or modes.

## Independent fixtures

See tests/result-context.test.ts: annual two-payment annuity; negative-return compound growth ($1,000 at -10% annually for two years = $810); 384-month retirement funding using independently summed monthly factors; 2025 single wages-only federal tax ($50,000 wages, $15,750 standard deduction, $11,925 first bracket at 10%, remainder at 12%). Surplus/shortfall signs and rounded zero are checked separately.

These are independent local fixtures, not evidence of full original-site parity. The broader source verification gaps remain recorded in progress.json.
