# Search-intent implementation — October 20, 2026

The user supplied Google Keyword Planner screenshots for Global and United States, English, previous 12 months, average monthly searches. Exact period endpoints were not supplied. keyword-map.json preserves these estimates, primary page ownership and ambiguous truncated compound-interest rows. Advertising competition is not interpreted as organic difficulty; volumes are not traffic forecasts and are not added together.

## Page ownership

- Mortgage Payoff: mortgage calculator with extra payments.
- Mortgage: mortgage calculator with taxes and insurance.
- Amortization: amortization calculator with extra payments.
- Repayment: loan payoff calculator with extra payments.
- Retirement: retirement savings calculator and retirement withdrawal calculator, with mode-specific entrances on one canonical page.
- Savings: savings goal calculator and monthly-deposit balance projection; target amount and target time are separate modes.
- 401(k): growth, contribution and employer-match questions on one canonical page; existing user-requested contribution-summary semantics remain unchanged.
- Compound Interest: growth with monthly contributions/deposits; the original equivalent-rate conversion remains a separate mode.

Keyword-informed metadata, server-visible headings/explanations, calculator shortcut buttons and directory search connect intent to usable features. No hidden keywords, country doorway pages, new duplicate routes, fake ratings or FAQ rich-result promises are added. Parameterized links keep existing canonical behavior; previews remain noindex. No hosted site is deployed.

## Capability changes and limits

Compound growth reuses the independently tested growth model, including nominal rate/frequency conversion, monthly/annual contribution timing, simplified annual tax and inflation. Savings target modes reuse the investment cash-flow solver: contribution is zero when the target is covered without monthly deposits; target time is the first whole month meeting the goal, bounded at 200 years. A future target at a zero horizon is rejected. These are deterministic assumptions, not risk forecasts.

The new monthly loan-payoff mode compares regular-payment baseline and extra monthly/yearly/one-time amounts. Regular payment must alone cover monthly interest so a valid baseline exists. Yearly extras occur every twelfth month; a one-time payment month must be an integer. No prepayment penalties or new borrowing are assumed; the final installment is capped. Existing repayment modes retain independent compounding/payment-frequency controls. Compound Interest and Repayment now default to their new growth/payoff modes; old explicit mode query links still work.

Four new modes bring the total to 158 across 70 actual calculators and one directory entry. Four new examples bring the total to 87; all original guides remain. Additional fixtures independently check positive/zero rates, annuity timing, reached/unreachable goals, goal-month boundaries and hand-worked extra-payment savings with principal conservation.

## Verification

Validation evidence is recorded in evidence/tests.tap, build.log, browser-keyword-qa.json, browser-seo-qa.json and browser-qa.json. These verify mathematical examples, actual mode entrances, initial HTML and browser interactions. They do not establish indexing, rankings, production performance, actual traffic or original-site parity. No Search Console or external keyword API account was accessed.

Current checks: 376 tests, production build and TypeScript passed; initial HTML checked on all 75 pages. Full browser regression passed on 71 routes and 158 modes. Keyword-specific browser checks passed 29 cases, including mode selection, directory intent queries and 320/390/768px layouts. Mathematical fixtures retain full precision; browser assertions allow the actual display rounding (cents for money, four decimal places where applicable).

All 87 published worked-example links passed browser verification (95 SEO browser checks total).
