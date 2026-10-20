# SEO and AI-search readiness — updated 2026-10-20

## Implemented

- Unique calculator metadata, Open Graph/Twitter text cards and configurable absolute canonicals. Share-query URLs canonicalize to the base calculator path when a final origin is configured.
- A permanent HTTP 308 redirect from `/` to `/financial-calculator.html` removes duplicate directory entry points.
- `/robots.txt` allows page crawling and excludes the reference-rate API. It advertises a sitemap only when indexing is explicitly enabled. A missing origin is never replaced with an invented production domain.
- `/sitemap.xml` lists 75 unique canonical pages when indexing is enabled: the 71 source directory entries, the financial directory, About, Privacy and Methodology. It excludes `/`, API URLs and parameter variants. No synthetic daily `lastmod` values are emitted.
- The preview configuration emits `noindex, follow`; it does not block page crawling in robots.txt, so compliant crawlers can see the noindex instruction. Vercel preview environments stay noindex even when production settings are inherited.
- Real WebApplication data on 70 calculation pages; with a configured origin, WebPage and BreadcrumbList data use the same canonical page. No fake reviews, ratings, expert identities or promised rich results.
- Server-rendered model descriptions/formulas are available for all 154 modes, including modes hidden behind interactive tabs.
- All 70 functional calculators now have individual English guides, at least two contextual questions, explicit scope and source/provenance links. There are 83 reproducible examples across the site (12 original, 71 added). Nine added positive-rate installment examples and two nonzero tax/paycheck examples supplement the transparent simple/boundary illustrations. Expected values use separately specified arithmetic or closed-form equations, not saved calculator outputs. Example links populate the complete stated settings.
- Ten priority pages have manually selected related tools; other pages retain category-based related links. Expanding manual contextual linking remains useful.
- `/methodology.html` explains calculation validation, official data versions, rounding, review status and model limitations. About/footer link to it. Notes carry a real content-check date, without inventing a human professional review.

## Enable the final production domain

Copy `.env.example` to `.env.local` for a local production build, or set the same variables in the hosting project's build environment:

```dotenv
SITE_URL=https://your-real-domain.com
SITE_INDEXABLE=true
```

Use the final origin only: HTTPS, no credentials, path, query or fragment. The domain above is an instruction placeholder, not the project's chosen URL. Rebuild after changing either variable. A Vercel deployment with `VERCEL_ENV=preview` remains noindex; the actual production environment must be used for public indexing.

Default local previews need no environment variables. With no final origin and no indexing opt-in, the sitemap is empty and canonicals are omitted; the pages remain noindex. This is intentional preview behavior, not a claim that SEO is active before release.

## Validation

- All published examples are independently specified fixtures checked against the actual calculation functions (`tests/seo.test.ts`).
- SEO configuration tests cover preview/production flags, URL validation, all 75 sitemap entries, canonical paths, schema escaping and contextual-link integrity.
- `python3 scripts/check-seo-build.py` validates the 75 generated HTML pages in default preview mode; passing a test origin validates production canonicals, schema and sitemap output. The `.example` origin used in evidence is a reserved QA fixture, never a chosen live origin.
- `node --import tsx scripts/browser-seo-qa.mjs` follows the visible worked-example links, verifies their results, checks the root redirect, methodology, noindex behavior and responsive layout.
- Full local calculator/browser regression checks remain separate from source parity and search performance measurements.

## Remaining work and measurement

The 60 additional guides provide an initial individual explanation, limitations, questions and at least one verified example each. This is not exhaustive coverage of every mode, market or user scenario. Add richer worked scenarios as justified by actual user/search evidence. content-topics.json records candidate intents for those 60 pages; search volume and traffic are explicitly unresearched/unmeasured. Content coverage does not establish that these are high-volume keywords.

A final domain and public deployment are still needed to verify HTTP/CDN behavior, indexing eligibility and Core Web Vitals in real use. Search Console/Bing verification, sitemap submission and ongoing coverage/performance reports require the actual hosting/domain account. Search ranking, AI citations and traffic have not been measured or guaranteed.

Financial accuracy work remains open as documented in calculation-audit.md and remaining-work.md. SEO descriptions intentionally describe implemented functions: for example, the Compound Interest page currently converts rates, and the 401(k) accumulation model does not claim complete distribution or contribution-limit modeling.

No special AI file or FAQ rich-result promise is required for these changes. Visible questions help users understand the tool; structured data describes actual content. See Google's guidance:

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## Screenshot distribution

The SEO update's new browser screenshots are retained locally. Automatic approval review rejected uploading a large screenshot to the public repository; screenshots are optional evidence, so this update synchronizes source and textual validation reports only. Existing PNG files in the repository predate the SEO guides and should not be treated as screenshots of this revision. Re-running the browser QA script produces current images locally.
