# Calculator preset links — 2026-10-27

## Problem and resulting behavior

The supplied SEMrush export contains390 Software App entries, all for aggregateRating or review:87 base calculator paths and303 query variants.146 URLs have more than three parameters. The production export generated478 internal query anchors pointing at303 unique parameter URLs. These are calculation states, not independently authored pages.

New example/task/search/glossary/methodology/contextual-mode links use the existing version1 #calc= fragment protocol. A lightweight shared helper keeps final extensionless destinations, stringifies explicit values, preserves zeroes/blanks/multiline text and excludes reserved metadata/verified_rate. Unsupported or excessively long states retain clear validation. No new packages, network API, routing layer or data stores.

All old .html/extensionless routes and legacy ?mode= inputs remain supported by the unchanged parser. Canonicals and sitemap still describe the same154 parameter-free documents. Existing field definitions, model outputs, quote/tax data and sharing opt-in remain intact. No query redirects, robots blocking, noindex or rating/schema changes.

## Interaction details

Fragment entry loads the requested mode/values, clears stale results and calculates through the existing lazy engine. It focuses and scrolls to the calculator panel. Clicking the same explicit preset again restores it after editing; this handles the browser not firing hashchange for an identical fragment. Same-tool repeated search submission has the same behavior. Modifier clicks, new tabs and ordinary anchors retain native navigation. Guide anchors preserve edited inputs. Browser back/forward rehydrates different presets, and returning directly to the original unparameterized document restores its original defaults/result. Marriage-tax advanced fields also recognize fragment inputs and reveal the applicable sections.

## Verification

- 1,041 tests, TypeScript and production export passed;3 added regression groups cover all published presets, every mode's legacy interpretation and encoded input boundaries.
- 88 existing catalog paths and202 modes' field/full-default-result hashes unchanged.
- 154 sitemap pages and8,014 internal anchors checked:478 fragment presets,0 internal query anchors, all final routes resolve and titles remain<=70 characters.
- 87 calculators/226 search tasks and synonyms plus30 static long-tail pages/42 answers/69 links passed.
- 29 focused Chromium checks at320/390/768/1440 passed, including no document reload for same-page presets, repeated links/search, history, guide edits, cross-page links, legacy zero-interest mortgage, blank VAT unknown, private-by-default sharing and opt-in round trip, advanced marriage fields, invalid state and no-JS static content.
- 8 existing direct navigation checks passed, including all176 legacy/final catalog addresses, mobile homepage first screen and keyboard search.
- 29 static/lazy checks passed, no page errors or unexpected external requests; engines and export tools load on demand.

Screenshots:/workspace/work/preset-links-20261027/preset-390.png and preset-1440.png. Evidence:evidence/preset-links-20261027.json. Native Safari/live custom-domain HTTP remain unverified. Crawl counts may retain previously discovered parameter URLs until an appropriate re-crawl/reset; this change stops generating those internal URLs but does not erase historical discovery or remove rating eligibility messages. No ranking/revenue promise.

## Source evidence

User supplied calculatorfree.io_structured_data_that_contains_markup_errors_20261026 (2).xlsx and screenshot of the missing aggregateRating/review field. Read all390 rows; no workbook content treated as execution instructions. Local source/production-export inspection and existing sharing/versioned-fragment contract determine implementation. No new external policy/rate claims or research submissions.
