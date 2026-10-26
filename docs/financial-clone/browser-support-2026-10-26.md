# Browser support policy — 2026-10-26

The user confirmed stopping deep compatibility work for iPhone XR/iOS14.4.2 after the device still reported a load failure. This release withdraws the special export transformation and API patches, restores the normal Next static build, and keeps a short upgrade notice for recognized older browsers. Mortgage, automatic PMI, FHA/VA and all other calculation rules remain unchanged.

## Resulting behavior

-Support baseline follows the installed Next16.4.2 documentation: Safari16.4+, Chrome111+, Edge111+ and Firefox111+. Current browser releases are preferred. This is a framework support policy, not a claim that every browser/version has been device-tested.
-Recognized older browsers see: “Update your browser to use these calculators. On iPhone or iPad, update iOS or use a newer device.” The notice is hidden by default and takes no layout space in newer browsers.
-The detection script is small ES5 code independent of the application bundles, so it can reveal the server-rendered notice even if the browser cannot run the app. It checks iOS version before branded browser version on iPhone/iPad; changing browser brands on the same old OS is not presented as a guaranteed solution.
-No browser APIs are patched, no whole-export compilation pass runs, and the special `safari14-v1` asset key is removed. Original Next config, static finalizer and cache headers are restored. The obsolete compatibility bootstrap/compiler/QA/test files are deleted.
-Historical iOS14 repair reports/evidence are retained and explicitly marked superseded. Traffic share for these old devices is unknown; no usage estimate is asserted.

The notice can help when HTML loads in an unsupported browser. It cannot repair DNS, TLS, connectivity or an entirely failed document request, and it does not promise that calculators work on iOS14.4.2.

## Validation

-932 tests pass: all917 retained application/model tests and15 browser-notice tests. The former19 tests specific to the withdrawn compatibility implementation are removed with that implementation. New tests cover iOS/Safari16.4 boundaries, branded iOS browsers, Chromium/Firefox111 boundaries, unknown/crawler UAs, DOM readiness, ES5 parsing and preservation of native methods.
-All193 default metric sets are unchanged. Financial formulas, thresholds, policy data, modes and shared-link behavior are preserved.
-193 modern Chromium calculator modes execute actual hydrated form submissions.200 browser checks cover these modes, the hidden notice,390/414/768/1440 result layouts, the mortgage curve/complete CSV, scientific Enter, and the old-iOS notice with application bundles deliberately blocked. No JavaScript errors occur in the modern runtime.
-14 homepage viewport checks preserve the complete basic calculator in the first screen.149 exported HTML documents contain the hidden notice and none contain the withdrawn compatibility bootstrap or asset key. Matching framework chunk filenames retain their pre-transformation original bytes.
-Production build, TypeScript,146-canonical SEO,529-text-asset brand guard,30 long-tail pages/40 answers/65 links and81-tool/195-task discovery checks pass. Thin module borders, frame/sidebar layout, publisher loader and ads.txt are preserved.

Commands: `SITE_URL=https://calculatorfree.io SITE_INDEXABLE=true npm run build`; `npm run typecheck`; `npm test`; `node scripts/browser-support-qa.mjs`; `node scripts/browser-home-first-screen-qa.mjs`; `python3 scripts/check-seo-build.py https://calculatorfree.io`; `node scripts/check-public-brand.mjs`; `node --import tsx scripts/check-long-tail-build.mts`; `node --import tsx scripts/check-page-intents.mts`.

Evidence:[summary](evidence/browser-support-summary.json), [browser checks](evidence/browser-support-qa.json), [notice tests](../../tests/browser-support.test.ts).

Source:[Next supported browsers](https://nextjs.org/docs/architecture/supported-browsers), also reviewed in the installed package documentation. Chromium execution covers the modern Chromium engine; native Safari/WebKit and historical iOS device testing remain unverified. Old-UA testing verifies notice visibility only. Browser checks stub only the exact existing publisher loader; no direct live-origin, ad-delivery, indexing or Core Web Vitals assertion is made.
