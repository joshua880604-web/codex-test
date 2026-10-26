# Inter and Amortio-inspired appearance — October 26, 2026

The shared site appearance now follows the supplied Amortio screenshots: Inter typography, near-black headings, violet actions, white rounded panels with thin borders, pale controls and lavender schedule headers. The existing calculator grids, input order, 1120px desktop frame, 320px sidebar and full-main-width reports remain.

The user confirmed Inter through browser computed/rendered-font evidence. Titles use weight 900; body text and controls use the same variable family. A single 48,256-byte Latin WOFF2 is hosted locally, preloaded, uses font-display:swap and a content-hashed URL with one-year immutable caching. No font service, UI library or animation dependency was added. This adds a font download on a cold visit; it is not a zero-byte performance change. The exact font binary/version served by the reference website is not asserted.

Font source: @fontsource-variable/inter version 5.3.0, https://registry.npmjs.org/@fontsource-variable/inter/-/inter-5.3.0.tgz. SHA-256: 3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62. The SIL Open Font License is retained in public/fonts/Inter-LICENSE.txt.

The primary gradient starts at a slightly darker #596dcc and uses white labels to improve text contrast while retaining the reference style. Selected navigation and table-header text use #5143de. No calculation code, policy tables, routes, page titles or search matching rules changed; sitemap and llms content need no changes for this appearance release.

## Validation

- Production build and TypeScript checks passed.
- All 953 existing calculation tests passed.
- 50 browser checks passed: unchanged widths/default results on Home, Mortgage, CD, FHA, 401K and Compound Interest at 320/390/768/1440px; custom Inter glyph rendering and 900 title weight; 14 compact homepage viewports; instant sidebar search and menu dismissal; wide reports, table scrolling, period switching, CSV and print; About, Methodology and Glossary.
- The 41 existing Mortgage workflow checks passed, covering the retained input paths and PMI interactions.
- No browser runtime errors or unexpected requests in the 50-check run. The exact pre-existing AdSense loader was stubbed; live advertisements were not measured.
- Taste inspector: zero failures at 1440/768/390px. Four retained warnings concern the deliberately fixed-width frame, component radius hierarchy, independent form/result heights and explanatory content below the fold. Screenshot review included all generated fold and scroll sheets.
- Automated color-contrast checks on Mortgage, Home and CD report no violations; some gradient/complex elements need manual review. White primary-label text has 4.68:1 contrast against the lighter gradient endpoint and 6.37:1 against the darker endpoint. This is not a full accessibility certification.

Evidence: evidence/visual-theme-2026-10-26.json. Browser validation uses Chromium against the actual exported build; physical iPhone Safari and public-origin timing were not measured. To repeat the comparison script, provide the prior exported out/ directory under UI_EVIDENCE_DIR/baseline/out; then run node scripts/browser-visual-theme-qa.mjs.

## Visual review

ROUND 3
Seen in one second: CalculatorFree.io mortgage inputs and the payment answer, in the requested Inter/violet appearance.
Idea (one sentence): The existing financial worksheet gains the reference typography and surfaces while keeping familiar controls and thin module borders.
Live thing: Actual calculator submission and calculator-name search.
Layout words by section: existing header / compact worksheet and sidebar / full-width reports / factual guides.
Scores (self-review, 0–10): design 8.5 · usability 8.5 · creativity 7.5 · content 9 → overall 8.4.
Caps applied: User fixed the layout and requested reference styling, so no new composition draw, hero, imagery, content feed or interaction redesign.
Top three reviewed points:
1. Title font must really render as Inter at 900: verified custom glyph rendering through Chromium CDP at all four widths.
2. Narrow mobile first screen must remain usable: full homepage calculator and Mortgage Calculate action verified; normal input sizes retained.
3. Pale selected labels and white gradient text need contrast: darkened selected text/gradient start and verified automated checks plus gradient endpoints.

Both frontend-design and design-taste-frontend were applied. Violet, gradients, static shadows and thin borders are explicit user requirements and override the taste skill defaults for this release. No sample customer data, stock photos or motion were introduced.
