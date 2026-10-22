# Methodology and current review record — 2026-10-22

This record describes the local implementation and the checks performed for the methodology update. It is not independent professional certification, a complete tax audit, a claim of exhaustive input coverage, or certification of equivalence with another calculator site.

## What was checked for this update

- Reviewed existing calculation modules, validation, display formatting, field configurations, source-data metadata and test fixtures.
- Replaced the short methodology overview with an explanation of calculation specification, independent arithmetic/fixtures, boundary and schedule checks, browser checks and review limitations.
- Nine representative defaults are read from the real calculator fields: Retirement Required Savings return/inflation; Investment End Amount annual rate; Investment Fee Impact annual rate; 401(k) projection return/inflation; Real Return inflation; Emergency Fund reserve months; Amortized Loan rate. They are labeled illustrative editable presets. No historical series or authority forecast is cited as their numerical basis because the project has no such basis recorded for those presets.
- Documented selected 2025/2026 federal tax rules, fixed 2026 contribution limits, IRS owner-account RMD table scope, the dated BLS CPI-U dataset, and component-dated Frankfurter reference rates. Data acquisition/verification dates remain the dates in the bundled records; they were not advanced as part of a documentation edit.
- Two published mathematical checks are reproducible: a $12,000 zero-rate 12-payment loan ($1,000/payment), and $1,000 at 5% compounded annually for two years ($1,102.50). Two exact real-return sensitivity cases are 3.4146% and 2.4155%, for 6% nominal return with respectively 2.5% and 3.5% inflation.
- Clarified rate basis, cash-flow timing, fees already reflected in returns, floating-point calculation versus display rounding, currency minor units and model-specific discrete rounding.
- Added a direct assumptions link on relevant Investment/Retirement forms and all calculator guides, plus a mobile-menu methodology link. No formula or source-data value changed.

## Validation evidence

- `npm test`: 570 passing tests, including the new methodology examples and exact inflation sensitivity cases. Test totals include default-operation and interface/support tests; they are not 570 independent external validations.
- `npm run build`: static export succeeds. Production-origin and default-preview HTML audits pass for 95 canonical pages. Production SITE_URL/SITE_INDEXABLE remain environment-controlled.
- `evidence/browser-methodology-qa.json`: 20 checks, including 320/390/768/1440px layout, navigation anchors, nine defaults matched to real forms, reproducible examples, sensitivity links, assumptions help, the extensionless methodology entry, explicit GitHub reporting link and no-JavaScript reading. No script errors or automatic external requests.
- `evidence/browser-mobile-layout-qa.json`: 30 representative calculator-layout cases pass.
- `evidence/browser-mobile-navigation-qa.json`: 7 navigation checks pass after adding the tenth mobile-menu link.
- Mobile top/default-assumption screenshots visually inspected; screenshots remain outside the source repository.

Prior dated evidence remains evidence of the version tested. For example, the earlier full-mode mobile regression and portrait exports covered 193 modes; this documentation update did not repeat all calculations at all possible inputs. New and previous test evidence should be interpreted at that scope.

## Current limits

- Forecasts generally assume constant selected rates, the cash-flow timing stated by each mode, and only the taxes/fees explicitly modeled. They do not predict realized returns or evaluate a personalized portfolio.
- Federal estimates and annual paycheck allocations are not a complete filing or withholding service; eligibility, state/local details and uncommon exceptions depend on the tool's documented scope.
- Retirement projections hold the bundled contribution limits constant. Plan-specific vesting, eligibility and all aggregate limits are not independently inferred for a person. Owner-account RMD tools do not cover every inherited-account or other exception.
- Historical CPI and currency rates are stored datasets. Missing official CPI periods are not interpolated, saved FX is not live, component dates can differ, and retail spreads/transaction fees are outside the snapshot.
- IRR searches have bounded domains and can have multiple/no solutions. A default case passing does not prove that every high-order cash-flow pattern's roots have been found.
- Most monetary models keep floating-point precision internally; lender daily-interest/cent-rounding conventions, line-item tax rules and currency allocations can produce differences.
- Source/reference text and selected prose examples are not evidence of full original-site interactive parity. See historical audits and later implementation notes for specific changes rather than interpreting the oldest audit as current feature coverage.

## Publication and feedback

AI tools have assisted development and drafting. Live results are calculated by deterministic local code, without a runtime AI service. The project does not publish a named independent professional review for each tool.

The public repository has issues enabled (read-only repository metadata check on 2026-10-22). The report link opens GitHub and may require sign-in; this change does not send reports automatically or set a response-time commitment. Reports should use non-sensitive reproducible inputs, expected/actual results and sources. Corrections can be traced through public commits and related test changes.

The existing `/methodology.html` metadata/canonical path and internal links are preserved. Cloudflare Pages serves its extensionless counterpart `/methodology` by default; the local static server now supports that entry too. No reverse redirect is installed that could loop with Pages' clean-URL handling.

## References consulted

- Omni editorial policies, for the general presentation of source transparency, review stages and meaningful update dates: https://www.omnicalculator.com/editorial-policies . The project does not adopt Omni's staffing/peer-review claims.
- Google AdSense guidance, for original content, navigation and user experience: https://support.google.com/adsense/answer/7299563?hl=en . A methodology page is not an approval guarantee.
- Cloudflare static HTML routing: https://developers.cloudflare.com/pages/configuration/serving-pages/ . No general calculator URL migration is made here.
- Financial data sources remain the official/source links named in the actual bundled files and on the methodology page. Default forecast values are not attributed to these sources.
