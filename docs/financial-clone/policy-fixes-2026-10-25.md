# Selected U.S. policy-condition repairs — 2026-10-25

The user approved the six findings from the policy audit, plus RMD, 401(k) and PMI scope clarifications. These changes extend the previously repaired tax/FHA release; they do not replace its fixes or implement a complete tax-return or loan-qualification engine.

## Resulting behavior

- **NIIT:** eligible net rental/royalty/passive income retains its investment-income classification when passed to the tax engine. Income is included in AGI once. An explicit exclusion choice keeps the income taxable without treating it as NII. The detailed paycheck and marriage forms expose the same net-income treatment; the simple paycheck form accepts the portion of already entered other income subject to NIIT and rejects amounts above that other income. Retirement distributions and unrelated other income are not automatically NII. Entered passive income must already reflect applicable expenses and loss limits.
- **MFS standard deduction:** a separate spouse-itemization input makes the standard deduction unavailable, including age additions and the nonitemizer cash-gift deduction. The taxpayer's eligible itemized deductions remain usable. Changing filing status leaves the stored flag harmless outside MFS. This is separate from the existing all-year-separation condition for Social Security taxation.
- **MFS AMT:** calculate the special AMTI increase before the remaining AMT steps. 2025 uses 25% above $900,350, capped at $68,500; 2026 uses 50% above $640,200, capped at $70,100. The 2026 substitution comes from 26 USC §55(d)(4)(A)(ii)(IV), not an assumed carryover of the 2025 percentage. The increase is shown separately in the tax details and is not entered again in Other AMT adjustments.
- **Active QBI minimum:** the 2026 $400 minimum requires an enabled eligible-QBI deduction, material participation and at least $1,000 of eligible net active QBI after half of regular SE tax. Default No does not infer eligibility. Each spouse's active-business choice is independent. Marriage comparisons aggregate eligible QBI and active QBI from both people and apply the minimum once to the joint return; one person's election no longer controls the other's eligible amount. 2025 retains its previous formula. Other eligible QBI adjustments must be reflected in entered amounts; wage/property, SSTB and carryover limitations remain outside this simplified model.
- **Social Security:** Ideal Application Age explicitly takes FRA PIA in age-62 dollars and uses a nominal discount rate. Assumed COLA applies during the wait from 62 and after claiming. Compare Application Ages keeps two separately entered nominal claim-date amounts; it does not inflate those quotes again before claiming. Annual anniversary COLA, month-end payment and simplified delayed-credit timing remain planning conventions; actual SSA calendar changes and benefit rounding differ.
- **VA purchase loans:** Previous VA loan use adds Only a manufactured home. That option keeps first-use funding-fee rates; No/Yes links remain compatible. Exemptions, 5%/10% down-payment bands and financed/upfront fee treatment remain independent. VA's ignored conventional-PMI fields are hidden and bypassed in validation and calculation. Ordinary purchase scope is stated; IRRRL, cash-out refinancing and other VA fee tables are not inferred.

RMD explicitly excludes owner Roth IRA balances and designated Roth plan balances for 2024 onward, alongside the existing inherited-account and employer-deferral exclusions. 401(k) explains that total limits combine traditional/Roth deferrals and that applicable 2026 catch-up must be Roth above the $150,000 prior-year same-sponsor FICA wage threshold. The existing annual projection keeps its start-age convention and explains the difference from IRS calendar-year-end age. Conventional PMI labels 80% as an assumed approved borrower-requested cancellation; it does not pretend to implement the separate 78% original-schedule or midpoint termination rules.

`src/lib/policy-rules.json` records the reviewed sources, tax years/effective dates and model boundaries. Methodology and affected guides link to those sources. Sitemap retains 146 canonical URLs and adds actual reviewed dates for VA and methodology; its existing mortgage date remains valid. No keyword aliases, speculative regional models or new canonical pages were added. llms.txt synchronizes the income-tax, 401(k), RMD and Social Security descriptions while retaining the same 39 curated financial-first links.

## Fixed numerical cases

| Finding | Entered conditions | Repaired result |
| --- | --- | --- |
| POL-01 |2026 Single; wages $200,000; eligible net rental income $100,000 | NIIT $3,800; AGI $300,000 |
| POL-02 |2026 MFS; wages $80,000; spouse itemizes; no own itemized deductions | Standard deduction $0; federal income tax $12,312 |
| POL-03 |2025 MFS; AMTI before special increase $920,350 | AMTI increase $5,000; example federal tax $256,707 |
| POL-03 |2026 MFS; wages $100,000; other AMT adjustments $650,000 | AMTI increase $54,900; example federal tax $222,927 |
| POL-04 |2026 Single; wages $50,000; eligible business profit $1,500; material participation | QBI deduction $400, versus $278.81 without active-minimum eligibility |
| POL-05 | Default ideal-age PIA $2,000 in age-62 dollars; COLA 2%; nominal discount 3%; lifespan 90 | Highest modeled present value at 70; initial monthly amount $2,905.72 |
| POL-06 | Ordinary VA purchase $400,000; zero down; previous manufactured-home-only use; no exemption | Funding fee $8,600, versus $13,200 for regular subsequent use |

The Social Security example is a sensitivity result under entered assumptions, not a personal claiming recommendation. The tax examples use marginal-rate formulas and internal precision, not every whole-dollar IRS form or under-$100,000 Tax Table rounding convention.

## Verification

- 806 tests pass, including 35 new targeted regression tests; the previous 771 tests are retained. The marriage layout's exact input count increases from 71 to 77 while its complete partner-pair assertion remains intact.
- 193 default-mode metric sets compared with the preceding published source:192 unchanged; only Social Security Ideal Application Age changes as intended. Default FHA and conventional/VA payment values remain unchanged.
- Production build and TypeScript checks pass. 146-page canonical/sitemap validation, 81 tools/195 search tasks, 30 enriched pages/40 answers/65 contextual links, and the public-domain guard pass.
- Browser checks at 390 px and 1440 px cover repaired values, NIIT exclusion, MFS field visibility, 2025/2026 QBI switching, both paycheck modes, marriage controls when only one partner elects QBI, VA purchase/biweekly behavior, claim-date quote treatment and RMD/401(k) scope. Default Social Security works without JavaScript. No page errors or unexpected external requests were observed. The existing AdSense loader is stubbed during QA.
- The homepage 14-viewport first-screen suite passes. The 1120 px frame, 320 px sidebar, thin module borders and existing ad publisher configuration are preserved. No live-ad rendering, revenue, search-indexing or Core Web Vitals improvement is asserted.

Evidence: `tests/policy-fixes.test.ts`, `evidence/policy-fixes-qa.json`, `evidence/browser-policy-fixes-qa.json`; maintained browser script: `scripts/browser-policy-fixes-qa.mjs`. Local baseline, detailed logs and screenshots are in `/workspace/work/policy-fixes-20261025/`. The original audit in `/workspace/work/policy-audit-20261025/` is preserved as historical evidence.

## Primary sources

- [IRS NIIT Q&A](https://www.irs.gov/newsroom/questions-and-answers-on-the-net-investment-income-tax)
- [IRS 2026 Form 1040-ES: standard deduction and active-QBI changes](https://www.irs.gov/pub/irs-pdf/f1040es.pdf)
- [IRS 2025 Form 6251 instructions, line 4](https://www.irs.gov/instructions/i6251)
- [26 USC §55: MFS AMTI increase and 2026 substitution](https://uscode.house.gov/us/usc/119-118/t26/s55/)
- [IRS 2026 inflation-adjusted AMT parameters](https://www.irs.gov/irb/2025-45_IRB)
- [26 USC §199 A(i): active-QBI minimum](https://uscode.house.gov/us/usc/119-120/t26/s199A/)
- [SSA: COLA before claiming and benefit factors](https://www.ssa.gov/policy/docs/statcomps/supplement/2025/apnc.html)
- [VA: funding fees and prior manufactured-home-only use](https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/)
- [IRS RMD account-type exclusions](https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs)
- [IRS Roth catch-up conditions](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-catch-up-contributions)
- [CFPB PMI cancellation and termination](https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/)
