# Usability and loading update — October 19, 2026

Preserved the compact calculator layout, all 71 entries/154 modes, financial formulas, the customized 401(k) contribution summary, and default noindex settings.

- Mobile labels appear above 44px inputs; units remain visible. Tablet content uses the full column. Large result values wrap, table headers remain sticky, and reduced-motion preferences are respected.
- Non-VAT Clear is now Reset because it restores starting values. VAT Clear still empties all four fields.
- 401(k) matching fields have accessible explanations. Detail headers distinguish annual employee/employer contributions and year-end age/balance. Table instructions explain USD and year-end contribution timing.
- Mode tabs support arrow keys, Home and End. Native validation expands hidden advanced options before focusing invalid fields. Input descriptions reference units/help via aria-describedby.
- Directory search trims surrounding whitespace, announces the count and provides Clear search. All 71 links remain server-rendered.
- Server renders form definitions and default results without sending function definitions. Financial category code loads through explicit dynamic imports only when calculating or hydrating shared inputs. Computation stays local; exchange-rate feed behavior is unchanged. The first calculation may need a category-code request.

## Measured results

Fresh Chromium contexts against production builds; totals are decoded JavaScript response bytes, not compressed wire transfers or Core Web Vitals. The measured routes are the financial directory, Mortgage, 401(k), and VAT.

| Measurement | Before | After |
| --- | ---: | ---: |
| Initial JavaScript per representative route | 840,707 bytes | 491,897 bytes |
| Mortgage after first calculation | 840,707 bytes | 526,163 bytes |
| 401(k) after first calculation | 840,707 bytes | 621,686 bytes |
| VAT after first calculation | 840,707 bytes | 638,124 bytes |

Initial JS is 41.5% smaller. Framework/runtime code remains substantial. These measurements do not establish hosted loading speed or field performance. Do not claim LCP/INP/CLS targets have been measured or met.

## Validation

289 tests passed; TypeScript and production build passed. Full browser regression: 71 routes/154 modes with no page errors. UI checks: 20 passed, including 320/390/768/1440px no horizontal overflow, search, matching help, table labels, Reset and keyboard tabs. SEO regression: 20 browser checks/12 examples; generated initial HTML validated for all 75 pages in default-noindex configuration. Text reports are in evidence/browser-ui-qa.json, ui-js-before.json and ui-js-after.json. Local screenshots are not uploaded.

Original-site visual/interaction parity remains unverified; this update intentionally improves usability. No domain or hosted deployment has been created.
