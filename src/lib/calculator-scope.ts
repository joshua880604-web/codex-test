import type { Values } from "./types";

// Scope labels describe implemented rules, not a promise of worldwide tax support.
export function calculatorScope(id: string, mode: string, values: Values): string | undefined {
  switch (id) {
    case "mortgage-recast": return "Fixed-rate monthly P&I only. Same rate and remaining contractual term; recast requires servicer approval. Taxes, insurance, PMI cancellation and FHA/VA/USDA eligibility are not modeled.";
    case "pmi": return "U.S. conventional borrower-paid PMI. Original-value 80% requests, scheduled 78% termination and original-term midpoint are distinct; FHA/VA and investor-specific appreciation rules are excluded.";
    case "biweekly-mortgage": return "Fixed-rate P&I comparison with 26 credited periods/year; not twice-monthly payments or a dated daily-accrual simulation.";
    case "discount-points": return "Compare entered fixed-rate quotes and upfront costs in USD. One point costs 1% of principal; rate reductions are lender-specific.";
    case "mortgage":
      return mode === "biweekly"
        ? "Fixed-rate residential mortgage comparison. Biweekly results exclude taxes, insurance and PMI."
        : "U.S. PMI assumptions; enter your local housing costs.";
    case "fha-loan":
      return "U.S. FHA payment planning. Automatic premiums use ordinary forward-loan rules; Manual accepts checked special or historical terms. Appraisal, underwriting and local loan eligibility still require verification.";
    case "va-mortgage":
      return "U.S. ordinary VA purchase-loan planning using the fee table effective April 7, 2023. Prior manufactured-home-only use keeps first-use rates; entitlement and exemption eligibility are entered assumptions. Other VA loan types require different fee rules.";
    case "401k":
      if (mode === "early") return "U.S. 401(k) early-withdrawal estimate using your entered tax rates and selected exceptions to the modeled 10% additional tax. This is not a complete income-tax return.";
      return "U.S. 401(k) planning using fixed 2026 contribution and age-based catch-up rules. Limits combine traditional and Roth deferrals; applicable high-earner catch-up must be Roth. This projection does not split those tax treatments or project future legal limit changes.";
    case "ira":
    case "roth-ira":
      return "U.S. IRA planning using fixed 2026 contribution limits. Contribution eligibility and tax treatment depend on the stated assumptions.";
    case "rmd":
      return "U.S. RMD planning for traditional IRA and other eligible non-Roth owner accounts. Roth IRA owner balances, designated Roth plan balances for 2024 onward, inherited accounts and employer-plan deferrals are excluded.";
    case "income-tax":
      return `U.S. federal income tax for tax year ${values.year === "2025" ? "2025" : "2026"}. Select the tax year before comparing estimates.`;
    case "estate-tax":
      return "U.S. federal estate tax using the 2026 exclusion. State estate taxes are not computed.";
    case "take-home-paycheck":
      return "U.S. paycheck planning using 2026 federal rules. Entered state and local rates are assumptions, not jurisdiction-specific tax calculations.";
    case "social-security":
      return mode === "compare"
        ? "U.S. Social Security planning. Enter your own monthly benefit estimates for both ages; changing the ages does not recalculate those quoted amounts."
        : "U.S. Social Security retirement-benefit planning. Enter FRA PIA in age-62 dollars; assumed COLA applies while waiting and after claiming. Use a nominal discount rate. Earnings records and benefit statements are not retrieved.";
  }
}
