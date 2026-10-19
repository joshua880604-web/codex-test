# Marriage Tax Calculator layout — October 19, 2026

Reorganized the existing 71 inputs without changing field keys, defaults, tax rules or calculation functions. This is a usability improvement; full original-site interaction/visual parity remains unverified.

The basic section shows tax year plus paired prior filing status, annual wages, qualifying children and other dependents. Desktop uses shared row headings with You/Partner columns; mobile keeps both people together under each item, with visible person labels and 44px controls. Full labels remain associated with inputs for assistive technology.

Other income, deductions/adjustments and tax credits/other adjustments are three independently collapsible sections. All fields remain available. Descriptions clarify annual USD, federal-only scope, default assumptions and counting dependents once. A shared URL with nondefault advanced fields opens the relevant sections once after hydration; subsequent edits respect manual collapsing. Reset restores all existing defaults. Native invalid-field handling opens the relevant section.

The leading result displays the absolute estimated annual savings/additional tax/difference with an explicit direction. The four original comparison totals remain below; underlying signed tax delta and the tax engine are unchanged. Results distinguish unmarried returns versus married-joint filing, not married filing separately.

Validation: 291 tests (including complete paired-field coverage and basic-field placement), TypeScript, production build, and initial HTML SEO validation for 75 pages. Dedicated browser checks cover all 71 controls, initial collapsed groups, desktop alignment, default/two-income/high-income result directions and unchanged amounts, shared advanced inputs, Reset, and all-field accessibility/no overflow at 320/390/768/1440px. See evidence/browser-marriage-qa.json. Screenshots are local review artifacts and are not uploaded. No hosted website deployment.
