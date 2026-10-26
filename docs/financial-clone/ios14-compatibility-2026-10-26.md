# iPhone XR / iOS14.4.2 compatibility — 2026-10-26

The user reported that calculators did not work in the built-in Safari on an iPhone XR running **iOS14.4.2**. The release addresses confirmed startup syntax and form-submission incompatibilities across the static site. A physical device or historical WebKit engine was unavailable, so native-device confirmation remains pending.

## Confirmed causes

The published baseline `eae5abb40315dfefb5eff50b2a06638265e2f98b` includes a class static initialization block in the primary framework chunk `1j71-lr846dcd.js`, requested by calculator pages. Old Safari cannot parse that syntax, which prevents the application from becoming interactive even when server-rendered HTML is visible. Next16's documented default browser target is Safari16.4 and later.

Scientific Calculator also invokes `HTMLFormElement.requestSubmit()` for Enter and the equals keypad button. With this API removed in a Chromium reproduction of the missing capability, the baseline throws `e.currentTarget.requestSubmit is not a function`.

The application and framework use relative indexing, own-property checks and Promise resolver helpers. The baseline framework restores some of these after successful startup; it does not overcome an earlier syntax parse failure. The new bootstrap explicitly installs only missing methods before any framework script runs.

## Changes

-The final static-export pass transforms **all framework and application chunks**, including lazy-loaded calculator/chart chunks, with Next's lockfile-provided Babel compiler, Safari14/iOS14.0 targets and Safari bug fixes. Logical assignments are conservatively lowered too, allowing a strict ES2020 parser guard on every emitted chunk. Dynamic imports remain intact.
-An ES5, feature-detected bootstrap is the first script in every exported HTML document. It supplies missing Array/String `at`, `Object.hasOwn`, `Promise.withResolvers` and the form-submission fallback used by this application. Native implementations are preserved.
-The app's no-argument `requestSubmit` path uses a temporary native submit button, preserving required-field validation and React submit events. It does not call native `form.submit()` and bypass application handling.
-Next's `deploymentId: safari14-v1` puts a new cache key on initial and lazy asset requests. This matters because the final-export transform changes precompiled framework bytes whose original filenames can otherwise match a previous deployment. Bump this ID when the compatibility transformation changes materially.
-Tables and search suggestions receive `vh` fallbacks before newer `svh`/`dvh` declarations.

No loan, tax, investment, PMI, FHA or VA calculation rules changed. Existing thin borders, layout dimensions, publisher integration, ads.txt and canonical URLs are retained. The compatibility bootstrap makes no network request and collects no data. No package dependency was added; the existing lockfile's Next compiler is used, and a missing/incompatible compiler causes the build to fail rather than silently skip the pass.

## Validation

-936 tests pass: all917 prior tests and19 new bootstrap/compiler regressions. They cover index boundaries, generic/sparse arrays, UTF16 strings, invalid receivers/conversions, shadowed/symbol properties, Promise resolution/rejection/subclasses, native-method preservation, framework class transformations, dynamic imports and Safari destructuring collisions.
-41 exported framework/application scripts are transformed. All42 JavaScript files, including the standalone bootstrap, and executable inline scripts pass the ES2020 ceiling check. All149 HTML documents load the ES5 bootstrap first, exactly once; framework URLs have the new cache key.
-193 calculator modes across81 tools successfully execute real client-side form submissions in Chromium with an iPhone XR-sized414×896 touch viewport/UA and selected APIs removed before navigation.204 checks pass with zero JavaScript errors or unexpected requests. This is a capability-emulation test, **not native iOS14.4.2 Safari**.
-Focused cases cover scientific Enter/equals, native required-field validation, the mortgage lazy chart and complete360-row CSV, directory live search, the whole basic calculator on the initial XR-sized screen, and result layouts at390/414/768/1440px. Screenshots reviewed.
-All193 server-calculated default metric sets are identical to the published baseline.14 modern-browser homepage viewport checks pass. Build, TypeScript,146-canonical SEO,530-text-asset public brand guard,30 long-tail pages/40 answers/65 links and81-tool/195-task discovery checks pass.

Commands: `SITE_URL=https://calculatorfree.io SITE_INDEXABLE=true npm run build`; `npm run typecheck`; `npm test`; `node scripts/check-browser-compat.mjs`; `node scripts/browser-ios14-compat-qa.mjs`; `node scripts/browser-home-first-screen-qa.mjs`; `python3 scripts/check-seo-build.py https://calculatorfree.io`; `node scripts/check-public-brand.mjs`; `node --import tsx scripts/check-long-tail-build.mts`; `node --import tsx scripts/check-page-intents.mts`.

Evidence:[summary](evidence/ios14-compat-qa.json), [syntax/startup/cache checks](evidence/browser-compat-build-qa.json), [browser checks](evidence/browser-ios14-compat-qa.json), [regressions](../../tests/browser-compat.test.ts).

## Sources and limits

-[Next supported browsers](https://nextjs.org/docs/architecture/supported-browsers): default targets, custom targets and additional polyfills. The installed Next16.4.2 documentation was also inspected.
-[Apple Safari16.4 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes): introduction of class static initialization blocks.
-[MDN requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit): native validation and submit-event behavior.
-[Next deploymentId](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId): asset cache busting.

Local Chromium UA/viewport/API emulation does not prove historical WebKit rendering or native-device compatibility. Direct live-origin response and reference-site parity are unverified. The exact existing publisher loader is stubbed for browser checks; no live-ad, indexing or Core Web Vitals assertion is made.
