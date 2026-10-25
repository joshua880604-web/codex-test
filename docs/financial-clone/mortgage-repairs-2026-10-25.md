# Mortgage Calculator repairs — 2026-10-25

The individual Mortgage audit identified four edge-case problems. This change rejects inconsistent fractional monthly terms and malformed extra-payment rows, gives cash purchases a consistent no-loan result, and adds the original purchase appraisal needed for the selected 80% PMI condition. It preserves ordinary default results and the previous U.S. policy repairs.

## Behavior

| Finding | Repaired behavior |
| --- | --- |
| MORT-01:12.5 monthly periods quoted against13 full-month rows | Require years ×12 + additional months to be a whole month count from1 to12,000.1.5 years still means18 months. Mortgage/FHA/VA share this rule; other finance-model period contracts are unchanged. |
| MORT-02:surplus or empty extra-payment cells silently accepted | Exactly two nonempty values per row: payment month, amount. Errors identify original line numbers, including preceding blank lines. Months must be integers1–12,000; amounts finite, nonnegative and<=1e15. Valid duplicate months add; final payment remains capped at the balance due. |
| MORT-03:100% down produced contradictory monthly/biweekly states | Both modes show no loan and retain initial monthly/annual taxes, home insurance, HOA and other ownership costs. No mortgage-insurance cost, repayment graph, schedule or CSV is invented. No lifetime ownership total is inferred. FHA retains explicit zero MIP metrics. |
| MORT-04:80% PMI threshold omitted a lower original appraisal | The optional original appraisal field appears only for Mortgage's 80% original-LTV policy. Use the lower of purchase price and appraisal at purchase. Blank assumes appraisal is at least the price; current market value is not substituted. Fixed-duration PMI ignores the hidden field. |

For positive loans, ownership-cost totals cover the modeled payment period through payoff; property expenses may continue afterward. The biweekly comparison still accrues nominal annual interest over26 equal periods and pays half the ordinary monthly payment. Notes now clearly distinguish that principal-and-interest repayment model from actual-calendar accrual and lender handling of partial payments.

The PMI option assumes a requested cancellation is approved. The separate78% original-schedule automatic termination and midpoint rules, payment status and other eligibility conditions are not automatically determined. No new underwriting, refinancing or appraisal-eligibility model is implied.

## Verification

-838 tests pass, including32 new repair regressions and all806 prior tests. Coverage includes the shared FHA/VA modes, strict extra-payment parsing, zero-loan states, original appraisal, monthly/yearly reconciliation, lazy calculations and shared links.
-38 independently computed60-digit Decimal scenarios and12 existing invalid-input controls pass. All193 default metric sets are unchanged from363aa492e00b9fa08ed09e887d4dd8f8593838f8.
-Independent PMI example:purchase400,000, loan320,000, original appraisal350,000,6%/30 years, annual PMI1,200. Original value350,000 and80% threshold280,000 produce98 charged months; payment99 is the first PMI-free payment. Monthly/yearly tables and CSV reconcile to9,800.
-33 local browser scenarios pass at390/768/1440px, including keyboard error recovery, malformed rows, no-loan context, PMI CSV, regular biweekly output and FHA/VA cash states. Fine1px module borders remain, as do the1120px desktop frame and320px sidebar. Default and cash-purchase screenshots reviewed.
-14 homepage viewport checks preserve the complete basic calculator in the initial viewport. Production build, TypeScript,146-canonical SEO,529-text-asset public brand guard,30 long-tail pages/40 answers/65 links and81-tool/195-task page-intent checks pass.

Commands: `npm test`; `npm run typecheck`; `SITE_URL=https://calculatorfree.io SITE_INDEXABLE=true npm run build`; `python3 scripts/check-seo-build.py https://calculatorfree.io`; `node scripts/check-public-brand.mjs`; `node --import tsx scripts/check-long-tail-build.mts`; `node --import tsx scripts/check-page-intents.mts`; `node scripts/browser-mortgage-repairs-qa.mjs`; `node scripts/browser-home-first-screen-qa.mjs`.

Evidence:[numeric and build summary](evidence/mortgage-repairs-qa.json), [browser scenarios](evidence/browser-mortgage-repairs-qa.json), [regression tests](../../tests/mortgage-repairs.test.ts), [browser runner](../../scripts/browser-mortgage-repairs-qa.mjs).

`llms.txt` describes the actual PMI and cash-purchase behavior. The canonical URL set remains146; Mortgage's reviewed sitemap date was already2026-10-25, so it is not artificially changed. Publisher integration and ads.txt are unchanged. The exact existing publisher loader is stubbed during browser checks; no live-ad, indexing, revenue or Core Web Vitals assertion is made.

## Sources and limits

-[CFPB:requested cancellation, original value and automatic termination](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/). For purchase loans, original value generally uses the lower contract price or appraisal at purchase. Reviewed2026-10-25.
-[CFPB:partial mortgage payments](https://www.consumerfinance.gov/ask-cfpb/my-mortgage-servicer-refuses-to-accept-my-payment-what-can-i-do-en-221/).
-[CFPB:prepayment penalties](https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/).

The audit's original before-repair evidence remains separate. Local validation does not establish Calculator.net same-input or screenshot parity, direct live-origin response, lender acceptance or personalized financial advice.
