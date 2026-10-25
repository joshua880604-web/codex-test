# Automatic conventional PMI — 2026-10-26

Monthly Mortgage now defaults to an automatic PMI estimate. Changing the down payment changes both the original loan amount and the LTV pricing tier. Users can select their assumed credit-score range or choose Manual to enter an actual annual dollar amount or percentage quote. Homeowners insurance remains a separate expense.

## Pricing basis and scope

The estimate uses the standard-coverage rows of National MI's **Monthly Advantage MA.MN.BP.2022-03** traditional rate card, effective March 1, 2022. The provider still lists this card on its Products & Rates page when reviewed on October 26, 2026. This is a dated, unadjusted base-rate illustration, not a live insurer quote, nationwide availability guarantee or government-mandated fee table.

Sources:

-[National MI rate card](https://www.nationalmi.com/wp-content/uploads/2022/02/MA.MN_.BP_.2022-03.pdf): credit/LTV/term base rates and constant-renewal rules.
-[National MI current product listing and agency coverage](https://www.nationalmi.com/products-rates/): current traditional-card listing and standard coverage by term and LTV.
-[Fannie Mae B7-1-02](https://selling-guide.fanniemae.com/sel/b7-1-02/mortgage-insurance-coverage-requirements): independently checked standard coverage levels.
-[CFPB PMI cancellation](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/): original value and requested cancellation, distinct from automatic termination.

Assumptions: fixed-rate, one-unit primary-residence purchase, standard agency coverage, no more than two borrowers, DTI at most 45%. The default **740–759 credit range is an explicit assumption**, not a credit check. State approval, loan eligibility, lender pricing, loan limits, manufactured homes, investment/second homes, HomeReady/Home Possible, refinance and other adjustments are not determined. Manual mode accepts a lender's actual quote.

## Calculation

1. Original value is the lower purchase price or original appraisal at purchase. Blank appraisal assumes it is at least the purchase price.
2. Original LTV = original loan / original value. LTV at or below 80% gives zero automatic PMI. Above 80%, select a tier ending at 85%, 90%, 95% or 97%, plus the selected credit band and the term group (up to 20 years or over 20 years).
3. Standard coverage percentages for those tiers are 6/12/25/35 for terms up to 20 years, and 12/25/30/35 for longer terms. These coverage percentages select a pricing row; they are not the annual premium rate.
4. Monthly premium = original loan × annual premium rate / 12. Constant renewals retain the original loan basis; after 120 payments, use the lesser of the starting annual rate or 0.20%.
5. Automatic mode assumes approved borrower-requested cancellation once the modeled opening balance is at or below 80% of original value. Extra principal can advance this threshold; payoff also ends premiums. The separate 78% original-schedule automatic termination, midpoint and all eligibility requirements remain outside this model.

PMI-bearing automatic estimates support original LTV up to 97% and terms up to 480 months. Outside that range the calculator gives an actionable error pointing to Manual, rather than silently extrapolating or assuming zero. No-PMI cases do not need a rate-card lookup.

At a 400,000 purchase price, 30-year fixed term and assumed credit score 740–759:

| Down payment | Original loan | Initial annual PMI rate | Initial monthly PMI |
| --- | ---: | ---: | ---: |
| 4% | 384,000 | 0.70% | 224.00 |
| 15% | 340,000 | 0.20% | 56.67 |
| 20% | 320,000 | 0.00% | 0.00 |

The monthly total already includes PMI. A separate **PMI** column in monthly/yearly tables and CSV allows reconciliation without adding it twice. Initial monthly PMI, total PMI and months with PMI are separate metrics; the primary summary states the assumed credit band and that actual lender pricing can differ.

## Compatibility and display

Automatic mode hides manual premium/unit/duration/cancellation controls. Manual mode retains fixed-duration or requested 80% policies; duration is hidden and not validated for the latter. Original purchase appraisal is available wherever original LTV is used. Hidden inactive values do not block a calculation.

Old shared links explicitly supplying PMI quotes, units, duration or cancellation settings without a calculation method are restored as Manual, including explicit zero premiums. New links preserve the method and credit assumption. New links specifying Automatic remain automatic even if serialized inactive manual fields are present.

Biweekly Comparison remains a principal-and-interest model. Conventional PMI controls are hidden there and stale values are ignored. FHA MIP and VA purchase rules retain their separate calculations. Cash-purchase results retain ongoing ownership-cost estimates without a fabricated amortization schedule.

## Validation

-917 tests pass: all 838 prior tests, 78 new automatic-PMI tests and one additional worked example. The new model tests verify all 64 selected pricing cells against independently transcribed source fixtures, exact LTV/20-year boundaries, both renewal phases, original appraisal, early repayment, yearly reconciliation, shared links, hidden inputs and unsupported cases.
-Existing manual quote regressions now explicitly select Manual. Their numeric expectations remain unchanged. Date assertions distinguish Mortgage's new review date from unchanged October 25 dates, and allow a page's lastmod to be newer than an unchanged long-tail section.
-38 independent Decimal mortgage scenarios and 12 invalid-input controls pass under the preserved Manual contract. All previously published default metric values across 193 modes remain unchanged. Mortgage monthly adds PMI/original-value metrics; the other 192 complete metric sets are identical.
-39 local browser scenarios pass at 390/768/1440px, including keyboard submission, auto/manual switching, legacy zero quotes, source assumptions, unsupported cases, CSV reconciliation, curves and no-JavaScript defaults. Screenshots reviewed. Thin borders and the 1120px frame/320px desktop rail remain.
-14 homepage first-screen checks pass. Production build, TypeScript, 146 canonical URLs, 529-text-asset brand guard, 30 long-tail pages/40 answers/65 links and 81-tool/195-task discovery checks pass.

Commands: `npm test`; `npm run typecheck`; `SITE_URL=https://calculatorfree.io SITE_INDEXABLE=true npm run build`; `node scripts/browser-automatic-pmi-qa.mjs`; `node scripts/browser-home-first-screen-qa.mjs`; `python3 scripts/check-seo-build.py https://calculatorfree.io`; `node scripts/check-public-brand.mjs`; `node --import tsx scripts/check-long-tail-build.mts`; `node --import tsx scripts/check-page-intents.mts`.

Evidence:[numeric/build summary](evidence/automatic-pmi-qa.json), [browser checks](evidence/browser-automatic-pmi-qa.json), [model tests](../../tests/automatic-pmi.test.ts), [versioned data](../../src/lib/mortgage-pmi-rates.json).

The Mortgage guide, worked example, llms.txt and reviewed sitemap date are synchronized. Canonicals, publisher integration and ads.txt are unchanged. Browser checks stub only the exact existing publisher loader. Direct live-origin response, reference-site parity, ad delivery, indexing and Core Web Vitals are not asserted.
