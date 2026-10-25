# U.S. tax and FHA rule corrections — 2026-10-25

This release fixes the six issue classes reproduced against commit `c81cd24dce39c7925143d2fae25b91ed3166efe8`.

## Federal tax

- **US-01 — Child-credit ordering:** education, dependent-care and entered eligible nonrefundable credits reduce the tax available to the nonrefundable child credit before computing ACTC. A 2025 single filer with $20,000 wages, $13,000 interest, one qualifying child and fully eligible $4,000 AOTC expenses now has $2,700 combined refundable credits instead of $1,368.50. The investment-income amount excludes EITC from this comparison.
- **US-02 — Self-employment earned income:** ACTC's earned-income basis subtracts half of regular self-employment tax. A controlled $10,000 net-profit case now yields $1,019.03 ACTC instead of $1,125, before whole-dollar return rounding.
- **US-03 — MFS residence:** the income-tax and detailed paycheck forms expose an all-year-separation choice for married filing separately. A 2025 MFS filer living apart all year with $40,000 Social Security and no other income has zero taxable benefits, rather than $17,000. The existing lived-together branch is preserved when No is selected or legacy inputs omit the choice.
- **US-04 — Section 68:** the 2026 overall itemized-deduction limit uses the exact statutory fraction 2/37 and the filing-status threshold. It is not applied in 2025. QBI is computed without this reduction, and AMT reverses it. The modeled standard/itemized election compares regular tax plus AMT. A 2026 single filer with $1,000,000 wages and $100,000 otherwise eligible itemized deductions has $5,405.41 of section 68 reduction and $298,157.25 estimated federal tax, instead of $296,157.25.

The shared tax function supplies income-tax, paycheck and marriage comparisons. The tax detail table separates refundable child and education credits and reports the overall deduction reduction.

Sources: [IRS Schedule 8812 instructions](https://www.irs.gov/instructions/i1040s8), [Publication 915](https://www.irs.gov/publications/p915), [26 USC §68](https://uscode.house.gov/us/usc/119-121/t26/s68/), [26 USC §56](https://uscode.house.gov/us/usc/119-118/t26/s56/), [IRS Publication 505](https://www.irs.gov/publications/p505). The statutory ratio is used rather than Publication 505's rounded 5.4% estimated-tax shortcut.

## FHA

- **US-05 — Premium terms:** Automatic selects ordinary forward-loan MIP rates and duration from Mortgagee Letter 2023-05 using base loan amount, term and LTV. The $400,000 purchase /20% down /30-year default now uses 0.50% annual MIP for at most11years. An optional appraisal uses the lower purchase price or appraisal as the LTV denominator; blank assumes the purchase price. Manual settings are available for explicitly checked special or historical terms, seeded from the current ordinary scenario when selected. Older links containing premium values and no method retain those explicit values as Manual.
- **US-06 — Monthly premiums:** each mortgage year's MIP uses the average original scheduled opening balance, staged HUD premium rounding and removal of financed upfront MIP. Extra principal does not directly change that original insurance basis; premiums stop when the modeled loan is paid off or the insurance duration expires. Default MIP is $132.59/month in year1, $110.23/month in year11 and zero in year12. A dedicated schedule column is already included in housing costs and total payments; exports preserve it. The remaining-principal graph continues to use loan balances, separately from premiums.

HUD's published historical worked example is a regression fixture for the calculation method: $106,605 principal, 7.5% interest, $745.40 contractual P&I, 2.25% upfront factor and0.5% annual premium produce monthly MIP $43.26 in year1 and$42.85 in year2. Its historical rates are not the Automatic defaults.

Sources: [HUD premium-rate letter](https://www.hud.gov/sites/dfiles/OCHCO/documents/2023-05hsgml.pdf), [HUD monthly-premium method and worked example](https://www.hud.gov/hud-partners/housing-premium-calculation).

## Scope and validation

These are bounded corrections, not a complete tax-return or mortgage-underwriting engine. IRA eligibility, state/local tax rates, income-based QBI restrictions, inherited RMDs, special ACTC alternatives and FHA maximum eligible financing/approval remain subject to the documented model scope. FHA biweekly output remains a principal-and-interest payoff comparison.

Regression coverage includes both tax years, credit combinations, MFS thresholds, four section68 filing thresholds, QBI/AMT interactions, FHA amount/LTV/15-year boundaries, the HUD worked example, early payoff, manual/legacy shares, public calculation validation and client/server parity. The added suite has44tests; the full suite has771tests. Across193default modes, the existing metric sets of192remain unchanged; the intended changes are FHA monthly insurance and related total costs. Static production, canonical/discovery and browser checks are recorded in the release evidence.
