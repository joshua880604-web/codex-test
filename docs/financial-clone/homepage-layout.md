# Homepage layout review — 2026-10-20

The financial directory now uses the complete content width rather than sharing space with a repeated sidebar. Calculator detail pages keep their previous sidebar and forms.

The page presents a labelled search field, eight curated quick-access links, seven category jump links with counts, and the complete 76-entry directory. Quick access is an editorial selection, not a claim about measured user popularity. All tools remain in server-rendered HTML. Searching trims surrounding spaces, filters keyword/task descriptions as before, hides shortcuts while filtering, and offers a clear empty-state recovery. Clear actions return focus to the search field; status text announces the result count.

Category sections use three desktop columns, two tablet columns, and one phone column. Category blocks stay together; links have comfortable padding. Colors and typography retain the existing compact tool-site style. No image, font request, JavaScript package or persistence layer was introduced. No claims about measured Core Web Vitals or search ranking improvements are made.

Validation:
- `npm run build`: passed.
- `node scripts/browser-homepage-qa.mjs`: 11 checks passed, including all directory entries, eight shortcuts, seven working category targets, search/empty/reset behavior, focus restoration and no overflow at 320, 390, 550, 768, 1024 and 1440 pixels.
- `node scripts/browser-ui-qa.mjs`: 20 regression checks passed, including 401(k) keyboard tabs, reset and mobile inputs, plus representative calculator routes.
- `python scripts/check-seo-build.py`: 80 pages passed under default noindex preview configuration.
- Desktop and phone screenshots inspected locally under `work/`. These images have not been uploaded.

Scope: presentation and directory search UX only; no formulas or calculator results changed. GitHub synchronization was explicitly authorized by the user after local validation. The preceding scientific/IRR changes were uploaded as commit `60ecb2904a7347edc59c35a5941e7335ed642c47`.
