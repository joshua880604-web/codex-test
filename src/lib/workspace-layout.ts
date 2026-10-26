import type { Metric, Result } from "./types";

// Complex tax forms, multi-debt entry sheets and the 401(k) story keep their wider flow.
export const workspaceIds = [
  "pmi", "biweekly-mortgage", "discount-points",
  "compound-interest", "investment", "loan",
  "mortgage", "fha-loan", "va-mortgage", "amortization", "mortgage-payoff", "refinance", "home-equity-loan", "heloc",
  "auto-loan", "auto-lease", "boat-loan", "business-loan", "personal-loan", "payment", "credit-card", "debt-consolidation", "repayment", "student-loan",
  "interest", "savings", "cd", "mutual-fund", "investment-fee", "annuity", "annuity-payout", "ira", "roth-ira", "retirement", "depreciation",
  "cagr", "real-return", "emergency-fund", "break-even", "markup", "down-payment", "apr", "roi", "payback-period", "future-value", "present-value",
] as const;
export function hasCalculatorWorkspace(id: string): boolean { return (workspaceIds as readonly string[]).includes(id); }
export function workspaceLayout(id: string, mode: string): "split" | "stacked" | null {
  if (!hasCalculatorWorkspace(id)) return null;
  return (id === "retirement" && mode === "required") || (id === "payback-period" && mode === "irregular") ? "stacked" : "split";
}

const priorities: Record<string, string[]> = {
  "pmi": ["Initial monthly PMI", "Original loan-to-value ratio", "Initial total loan payment"],
  "pmi:cancellation": ["Modeled current monthly PMI", "Cancellation status", "LTV using original value"],
  "biweekly-mortgage": ["Biweekly payment", "Interest saved versus standard monthly", "Years to payoff with biweekly payments"],
  "discount-points": ["Net borrowing-cost savings at horizon (B vs A)", "Monthly payment saving (A minus B)", "First net-cost break-even month"],
  "mortgage:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "fha-loan:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "va-mortgage:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "mortgage": ["Monthly principal & interest", "Initial monthly total", "Initial monthly PMI", "Total interest"],
  "fha-loan": ["Monthly principal & interest", "Initial monthly total", "Total interest"],
  "va-mortgage": ["Monthly principal & interest", "Initial monthly total", "Total interest"],
  "mortgage-payoff": ["Current principal balance", "Interest saved", "Years to payoff"],
  "refinance": ["New monthly payment", "Current monthly payment", "Monthly payment reduction"],
  "auto-loan:payment": ["Payment per period", "Vehicle price", "Total interest"],
  "auto-loan:price": ["Vehicle price", "Payment per period", "Total interest"],
  "boat-loan:payment": ["Payment per period", "Boat price", "Total interest"],
  "boat-loan:price": ["Boat price", "Payment per period", "Total interest"],
  "auto-lease:payment": ["Monthly lease payment", "Vehicle price", "Total lease cash outlay"],
  "auto-lease:price": ["Vehicle price", "Monthly lease payment", "Total lease cash outlay"],
  "business-loan": ["Payment including insurance", "Total interest", "Net proceeds after fees"],
  "personal-loan": ["Payment including insurance", "Total interest", "Net proceeds after fees"],
  "student-loan:projection": ["Payment per period", "Balance entering repayment", "Capitalized interest"],
  "student-loan:solve-payment": ["Monthly payment", "Loan balance", "Annual interest rate", "Term in months"],
  "student-loan:solve-rate": ["Annual interest rate", "Loan balance", "Term in months", "Monthly payment"],
  "student-loan:solve-term": ["Term in months", "Loan balance", "Annual interest rate", "Monthly payment"],
  "cd": ["After-tax balance", "Interest earned", "Maturity balance", "Tax on interest"],
  "down-payment:price": ["Home price", "Cash needed", "Loan amount", "Monthly mortgage payment"],
  "down-payment:cash": ["Cash needed", "Down payment", "Loan amount", "Monthly mortgage payment"],
  "down-payment:percent": ["Down payment percentage", "Cash needed", "Loan amount", "Monthly mortgage payment"],
  "markup": ["Selling price", "Markup on cost", "Profit margin"],
  "interest": ["Ending balance", "Total contributions", "Net investment earnings"],
  "savings:accumulation": ["Ending balance", "Total contributions", "Net investment earnings"],
  "savings:goal-contribution": ["Required monthly deposit", "Ending balance", "Net investment earnings"],
  "savings:goal-time": ["Years to savings goal", "Ending balance", "Net investment earnings"],
  "payback-period": ["Payback period (years)", "Discounted payback (years)", "Net present value"],
  "depreciation": ["Ending book value", "Total depreciation", "Depreciable basis"],
  "retirement:required": ["Required savings at retirement", "Required monthly saving", "Projected surplus / shortfall"],
  "retirement:withdrawal": ["Initial monthly withdrawal", "Monthly withdrawal in today’s dollars", "Balance at retirement"],
};
export function workspaceMetrics(id: string, mode: string, result: Result): { primary: Metric; highlights: Metric[]; details: Metric[] } {
  const labels = id === "mortgage" && mode === "monthly"
    ? ["Monthly principal & interest", "Initial monthly total", "Total interest", "Interest saved with extra payments", "Payments avoided", "Years to payoff"]
    : priorities[id + ":" + mode] ?? priorities[id];
  // Preserve the three published pilots' original primary/breakdown presentation.
  const pilot = ["compound-interest", "investment", "loan"].includes(id);
  const selected = labels?.map(label => result.metrics.find(metric => metric.label === label)).filter((metric): metric is Metric => Boolean(metric)) ?? [];
  const shown = selected.length ? selected : result.metrics.slice(0, pilot ? 1 : result.metrics.length <= 4 ? 4 : 3);
  const primary = shown[0] ?? result.metrics[0];
  return { primary, highlights: shown.slice(1), details: result.metrics.filter(metric => !shown.includes(metric)) };
}
