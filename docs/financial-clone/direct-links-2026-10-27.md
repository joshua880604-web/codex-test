# Direct internal navigation and concise titles — 2026-10-27

User approved final extensionless navigation while keeping all old .html URLs compatible, explicitly reconsidered .html as the preferred form, then confirmed continuing with final extensionless links. No URL migration or calculation-model change is intended.

## Implementation

A pure SiteLink renders ordinary anchors using a shared whitelist-based navigationHref helper. It normalizes known document paths, site-host absolute links and homepage links to current final destinations, preserving query strings/fragments. External sources, static assets and in-page anchors remain untouched. All server and client anchor output uses the same transformation, so links do not rely on post-load DOM edits and do not conflict with hydration. Search keyboard/submit navigation and newly copied calculation/share/PNG links use final tool paths too. Existing query and input-fragment parsing is unchanged. Local routeFor/catalog filenames, static documents and all calculators remain intact. The homepage redirect now goes directly to the final directory path. Local preview serves both old document names and extensionless aliases without redirects, supporting reproducible checks; production's existing .html redirects remain hosting behavior.

Long title cores are retained in full, omitting the appended site name when it would exceed70 characters. About avoids repeating the site name. Short titles retain the existing brand suffix. Headings, descriptions, keyword ownership, canonical destinations and schema content are unchanged. No rating/review markup is invented.

## Validation

- 1,023 unit/regression tests, TypeScript and production export passed.
- 152 pages and7,887 internal anchors statically checked: final document destinations exist, no internal .html or homepage redirect links remain, and every document title is at most70 characters. This character threshold is not a guarantee of a particular rendered Google title/pixel width.
- Eight focused browser checks cover172 old/final catalog responses on local export,320/390/768/1440px viewports,mobile quick-calculator first screen,keyboard search,CD14-month preset,old Mortgage query inputs and server-rendered links without JavaScript.
- Eighteen category checks cover navigation,menu closing,breadcrumbs,all86 catalog routes and three no-JS directories.
- Prior198 default mode/field/result hashes remain identical; the Recast engine and all other199 mode implementations are untouched.

Evidence: evidence/direct-links-20261027.json and evidence/browser-direct-links-qa.json. Work folder:/workspace/work/direct-links-20261027/. Direct hosted HTTP/Safari and ranking measurements are unavailable; re-run Site Audit to validate changes in redirect and incoming-link counts. Old .html links are deliberately still supported through the host's existing redirects.

Final static/lazy-loading suite:25 checks passed, no page errors or unexpected external requests. Parallel attempt timed out at network idle; isolated rerun passed. No field-performance or zero-network-latency claim is made.
