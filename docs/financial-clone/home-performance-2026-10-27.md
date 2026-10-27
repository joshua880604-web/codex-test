# Home rendering and search loading — 2026-10-27

DirectoryEntry now re-exports a Server Component. Directory categories, featured cards and trust cues stay outside the client boundary; search and quick calculator keep their own interactive boundaries. Avoid passing a duplicate full catalog when the search already has the default catalog. All original110 main links and complete main text match the prior export.

CalculatorSearch loads its matching engine on nonempty input rather than initial page load. Concurrent loads share a promise; failed loads have an explicit fallback while normal directory links remain available. Submit waits for the engine and checks the current input before navigating so an old query cannot hijack a newer one. Existing ranking, presets, selection, keyboard controls and repeat-preset event remain. No changes to ads, font, CSS, browser compatibility, models or routes.

Local Chromium initial first-party JavaScript:550913→487331 decoded bytes (−63582/11.54%);8→6 requests; summed gzip estimate160657→144210 bytes (−16447). These are local production-export resource measurements with the exact external ad loader stubbed, not PageSpeed score, live transfer bytes, user field data or promised LCP gains.

Validation:1041 tests, TypeScript/build,154-page SEO and8022 anchors passed.8 direct-browser,29 preset/history and29 static/lazy checks passed.5 focused checks prove no search engine before input, stale-query safety with delayed module load, immediate submit with tax preset, failure fallback and readable no-JS directory/quick form. Lazy suite explicitly requires directory text absent from client bundles and search engine absent before interaction. Native Safari/live PSI/CrUX unverified. Evidence:evidence/home-performance-20261027.json.
