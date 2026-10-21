# Six evergreen finance tools — 2026-10-21

## Delivery and overlap decisions

Six independently specified tools add 19 modes to the existing 174: 82 directory entries, 81 functioning tools, 193 modes. Original Calculator.net reference parity status is unchanged; these additions are not claimed to be replicas of original calculators.

| Tool | Modes | Boundary |
|---|---|---|
| Markup | selling price, reverse cost, margin-based price, direct rate conversion, cost/price comparison | Existing Margin and its legacy markup mode remain functional. New page owns the broad markup target. |
| CAGR | rate, ending value, beginning value, dates | No intermediate cash flows. Existing Average Return owns its annualized-return query; IRR covers cash flows. |
| Emergency Fund | reserve goal, saving time | User selects reserve months. No prescribed universal reserve or assumed interest. |
| Break-Even | units/sales, target profit, selling price | Single-product contribution model, same accounting period, upward whole-unit rounding. No unsupported multi-product inference. |
| Investment Fee | impact, compare | Fund expense ratio plus separate percentage advisor fee. Existing Mutual Fund retains its own investment/loads scope. |
| Real Return | exact real rate, future purchasing power, required nominal return | User-entered future rates. Existing Inflation retains historical CPI purchasing-power comparisons. |

## Model conventions

- USD display is a currency label, not a market feed or conversion. Inputs are local, all formulas are static and no policy parameters or external API are used.
- CAGR: positive start, nonnegative end, positive years. Zero end means −100%; rates for inverse modes must exceed −100%. Date convention is actual UTC days/365.2425 and is explicitly shown.
- Markup: positive cost/price; markup = profit/cost, margin = profit/price. Direct conversion allows negative margins; markup must exceed −100%, margin must be below 100%. Gross profit excludes unspecified overhead/tax.
- Emergency: necessary expenses × chosen months; current savings may exceed target. Whole saving months round up; last deposit is capped. A zero deposit with an unmet target is an error, while a met target needs zero months.
- Break-even: contribution must be positive for units mode. Theoretical units differ from whole units. Price solving does not round internal currency to cents.
- Fees: each year starts with growth, then applicable fund expense ratio, then advisor fee, then contribution. After fund fees skips the fund deduction to avoid double charging. This annual model differs from fund daily accrual; comparisons use equal entered return assumptions. No hidden estimate of fund fees already embedded in a net return.
- Real return: exact Fisher ratio, not nominal minus inflation. Future value holds rates constant and has no contributions. Optional tax applies annually to positive nominal gains only; no loss credit, deferred-tax or jurisdictional rules.

## Content and research

User-provided US/English Keyword Planner evidence is summarized in research/evergreen-keywords-2026-10-21.json. Close variants are not summed. Advertising competition is not organic difficulty. Unrelated suggestions are excluded.

Six pages have specific titles, 13 new reproducible examples, scope/assumptions, three questions each, formula explanations and related links. Excel CAGR demand is addressed with a real copyable formula, not an advertised workbook download. Targets are assigned to useful modes and existing historical purchasing power/annualized return ownership is preserved. Searches can match aliases. No duplicate pages are created for every keyword.

Static indexing remains disabled pending a final domain. No hosted deployment or search/AI performance claim.

## Validation

- 552 automated tests passed, including independent recurrences, inverse checks, loss/zero cases, fee ordering, whole-unit rounding and invalid inputs.
- Production static export: 86 .html routes. SEO checks: 86 pages, 81 guides, 195 unique keyword/task expressions.
- Final browser reports: evidence/browser-evergreen-qa.json, browser-static-qa.json, browser-seo-qa.json. These verify local operation, not full original-source parity.
- New tools inherit explicit input-sharing opt-in, recalculable links, formatted summaries, local PNG cards and CSV for fee schedules.
