import type { Values } from "./types";

// Scope labels describe implemented rules, not a promise of worldwide tax support.
export function calculatorScope(id: string, mode: string, values: Values): string | undefined {
  switch (id) {
    case "401k":
      if (mode === "early") return "U.S. 401(k) early-withdrawal estimate using your entered tax rates and selected exceptions to the modeled 10% additional tax. This is not a complete income-tax return.";
      return "U.S. 401(k) planning using fixed 2026 contribution and age-based catch-up rules. Future legal limit changes are not projected.";
    case "ira":
    case "roth-ira":
      return "U.S. IRA planning using fixed 2026 contribution limits. Contribution eligibility and tax treatment depend on the stated assumptions.";
    case "rmd":
      return "U.S. owner-account RMD rules for the selected distribution year and IRS life-expectancy table. Inherited-account rules are not modeled.";
    case "income-tax":
      return `U.S. federal income tax for tax year ${values.year === "2025" ? "2025" : "2026"}. Select the tax year before comparing estimates.`;
    case "estate-tax":
      return "U.S. federal estate tax using the 2026 exclusion. State estate taxes are not computed.";
    case "take-home-paycheck":
      return "U.S. paycheck planning using 2026 federal rules. Entered state and local rates are assumptions, not jurisdiction-specific tax calculations.";
    case "social-security":
      return mode === "compare"
        ? "U.S. Social Security planning. Enter your own monthly benefit estimates for both ages; changing the ages does not recalculate those quoted amounts."
        : "U.S. Social Security retirement-benefit assumptions. Enter your benefit estimate; earnings records and benefit statements are not retrieved.";
  }
}
