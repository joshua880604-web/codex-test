# Mortgage input workflow — 2026-10-26

The approved change keeps Mortgage Calculator focused on fixed-rate residential repayment while making its first calculation easier. It borrows the direct-principal entry idea from Amortio without claiming competitor formula or visual parity.

## Behavior

- Choose Home price & down payment or Loan amount in both Monthly Mortgage and Biweekly Comparison. Switching retains the principal. Percentage housing costs convert to disclosed dollar amounts when entering direct-principal mode; hidden purchase-price drafts never establish its LTV.
- Direct entry accepts a positive loan amount. Existing-loan users enter current balance and remaining term and use an actual manual PMI quote. Past interest, down payment and purchase costs are excluded.
- Direct entry defaults to Manual PMI. Automatic PMI and 80% original-LTV cancellation require an explicit original home value; percentage housing costs also require that value. Each input basis preserves its own PMI assumptions when revisited. Published PMI rates, model scope and cancellation limitations are unchanged.
- Core fields stay visible; taxes/insurance/fees, PMI/home value and extra payments/dates have separate native disclosures. A monthly housing-cost summary and PMI method/credit assumption remain visible while collapsed. Biweekly controls exclude housing costs and PMI as before.
- Results prioritize principal-and-interest payment, initial total and total interest. Effective extra payments surface interest saved, payments avoided and years to payoff against the same original amortization. Chart and schedule retain full main-column width, monthly/yearly aggregation and CSV export.
- Brand, module borders, 1120px desktop frame and 320px sidebar remain. FHA, VA, refinance and other mortgage tools remain separate. Related links, scope, FAQ and a zero-interest direct-balance example are updated. URLs remain stable; no new sitemap entry is needed.

## Validation

953 tests pass (21 added checks/examples), with all193 existing default metric sets unchanged.41 workflow browser checks,39 retained PMI checks and200 cross-calculator checks pass; TypeScript, production build,146-canonical SEO,529-asset brand guard,30-page long-tail content and81-tool discovery checks pass. The final visual inspector reports zero FAIL at1440/768/390.

Final checks are recorded in [workflow evidence](evidence/browser-mortgage-inputs-qa.json), [retained PMI checks](evidence/browser-automatic-pmi-qa.json), [cross-calculator checks](evidence/mortgage-cross-calculator-qa.json) and [summary](evidence/mortgage-workflow-summary.json).

Independent controls include $100,000 at 6% over360 months ($599.5505251527524 payment), zero-interest $12,000 over12 months ($1,000), and a 50-digit Decimal extra-payment control: $100,000/6%/360 plus $100 monthly yields252 payments, $75,937.93582281066 interest and $39,900.2532321802 interest saved. Controls also cover missing home values, invalid principal, manual and automatic PMI, underwater manual-quote loans, basis/mode switching and private-link reconstruction.

Browser checks use the production static export in Chromium at320/390/414/768/1440 widths. Exact existing publisher loader is stubbed. Native Safari/WebKit and a physical iPhone are unverified. No live-rate, lender-quote, live-ad-delivery or competitor parity claim is made.

Research: [Amortio calculator](https://www.amortio.com/#calculator), [Amortio methodology](https://www.amortio.com/methodology/). Existing PMI official/insurer sources remain listed on the calculator page.
