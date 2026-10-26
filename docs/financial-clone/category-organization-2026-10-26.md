# Category organization — 2026-10-26

User approved organizing the existing tools and explicitly required all old page URLs to remain unchanged. The seven display categories are Mortgage & Housing, Loans & Debt, Savings & Investing, Retirement, Tax & Income, Business Finance and Everyday Tools. This is a display taxonomy, independent of the source categories used by calculator engines.

## Delivery

- One shared primary-category definition powers homepage groups, desktop navigation, mobile navigation, breadcrumbs, real-estate scenario sections and contextual sidebar discovery. Each of the85 catalog entries has exactly one primary category;84 are functional tools, one is the retained Real Estate directory. The directory is linked separately rather than counted as a calculator.
- Business Loan, Margin, Markup, Break-Even and Depreciation belong to Business Finance. Budget and Currency belong to the personal-planning/financial-basics sections of Savings & Investing. Discount stays with supporting Everyday Tools.
- Mortgage & Housing has four scenario sections: buying and loan costs; payoff and interest savings; refinancing and home equity; renting and property investment. Savings & Investing has savings/personal planning, investment returns/fees and interest/financial basics. The old real-estate-calculator.html directory presents the same four housing sections.
- Contextual sidebars show up to eight related tools with a link back to the primary category, plus the shared category index. Existing global instant search remains available, including the real-estate directory. Cross-category related links reuse each tool's only existing URL.

## Compatibility

- Existing calculator IDs, routes, modes, fields, defaults, engines, policy data, guide/FAQ copy and canonical destinations are retained. No category route or redirect is added.
- Existing #mortgage-housing, #loans-debt, #saving-investing, #retirement, #tax-salary and #everyday remain, as do older #mortgage-and-real-estate, #auto, #other, #investment, #tax-and-salary and #everyday-tools aliases. Business adds #business-finance on the existing financial-calculator.html page. Display label changes do not rename fragments.
- The catalog, redirect artifacts, sitemap and Next routing configuration are byte-identical to the captured baseline.198 full default results, field definitions and mode IDs are exactly unchanged, not just the top-line values.
- Preserve local Inter, violet/amber branding, thin borders, existing1120px frame/320px rail, all chart/table/export flows and the compact mobile homepage quick calculator. No dependencies or runtime APIs added.

## Evidence

1001 unit/regression checks passed.38 browser checks cover85 existing URL responses, canonical paths, all category anchors, unique tool lists, category/name consistency, contextual sidebars, search, no-JS content and responsive behavior at320/390/768/1440. Phone homepage at320x480 and390x844 still displays the entire quick calculator before scrolling. Evidence: evidence/browser-categories-qa.json and evidence/categories-qa.json. Chromium production-export verification; no native Safari or live production HTTP claim.

Visual inspection at1440/768/390 passed with zero failures. Tablet navigation wraps rather than clipping category labels. The remaining unequal-card-height warning is intentional: categories contain different numbers of tools; preserve the approved directory layout without filling short categories with artificial rows. Lazy/static checks:23 passed; financial engines and PNG code remain on demand.
