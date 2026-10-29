import type { Result, Values } from "./types";
import {coastHousehold} from './coast-household';

export type TrendPoint = { x: number; balance: number; contributions?: number; comparison?: number };
export type ResultTrend = {
  title: string; xLabel: string; balanceLabel: string; help: string;
  secondaryKey?: "contributions" | "comparison"; secondaryLabel?: string;
  points: TrendPoint[]; sampled: boolean;
};
const loanIds = ["pmi", "biweekly-mortgage", "loan", "mortgage", "fha-loan", "va-mortgage", "amortization", "mortgage-payoff", "refinance", "home-equity-loan", "heloc", "auto-loan", "boat-loan", "business-loan", "personal-loan", "payment", "credit-card", "debt-consolidation", "repayment", "student-loan"];
const loanColumns = [
  ["Month", "Payment", "Interest", "Principal", "Balance", "PMI if requested", "PMI automatic only"],
  ["Period", "Payment", "Interest", "Principal", "Balance"],
  ["Month", "Payment", "Interest", "Principal", "Balance"],
  ["Payment #", "Payment", "Interest", "Principal", "Balance"],
  ["Month", "Date", "Payment", "Interest", "Principal", "Balance"],
  ["Month", "Date", "Payment", "Interest", "Principal", "Balance", "Taxes & costs", "Total"],
  ["Month", "Date", "Payment", "Interest", "Principal", "Balance", "Taxes & costs", "Total", "FHA MIP"],
  ["Month", "Date", "Payment", "Interest", "Principal", "Balance", "Taxes & costs", "Total", "PMI"],
  ["Month", "Payment incl. allocated fee", "Interest", "Principal", "Balance"],
];
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
// Presentation only: select already calculated balances. No model/engine imports.
export function resultTrend(id: string, mode: string, values: Values, result: Result): ResultTrend | null {
  const rows = result.rows, columns = result.columns;
  if (!rows?.length || !columns) return null;
  const matches = (expected: string[]) => expected.length === columns.length && expected.every((column, i) => column === columns[i]);
  const input = (key: string) => values[key]?.trim() ? Number(values[key]) : NaN;
  let title = "Balance over time", xLabel = "Years", balanceLabel = "Balance", help = "";
  let xIndex = 0, balanceIndex = -1, scale = 1, secondaryIndex = -1;
  let secondaryKey: ResultTrend["secondaryKey"], secondaryLabel: string | undefined;
  let start: TrendPoint | null = null;
  if (['debt-snowball','debt-avalanche'].includes(id) && columns[0]==='Month' && columns[3]==='Total balance') {
    const original=result.metrics.find(m=>m.label==='Starting total debt')!.value;
    start={x:0,balance:original};balanceIndex=3;xLabel='Payment month';
    title='Debt balance on your payoff plan';balanceLabel='Remaining debt';
    help='Monthly interest is added before minimum and prioritized extra payments. This is the selected strategy with fixed entered APRs and minimums, not a lender statement or credit-score forecast.';
  } else if (["fire","lean-fire","fat-fire"].includes(id) && matches(["Age", "Balance", "FIRE target", "Cumulative new investments"])) {
    const target=result.metrics.find(m=>m.label==="FIRE portfolio target")?.value;
    if(!finite(target))return null;
    start={x:input("age"),balance:input("balance"),comparison:target};
    xLabel="Age";balanceIndex=1;secondaryIndex=2;secondaryKey="comparison";secondaryLabel="Full FIRE target (today’s USD)";
    title="Invest toward a full FIRE target";balanceLabel="Modeled portfolio (today’s USD)";
    help="The calculated savings path ends at the first full-target crossing or projection age limit. All amounts are in today’s USD; no later deposits, withdrawals, market volatility or success probability are simulated.";
  } else if (id === "coast-fire" && matches(["Age", "Balance", "Coast threshold", "Cumulative new investments"])) {
    const coast=result.metrics.find(m=>m.label==="Coast FIRE number today")?.value;
    if(!finite(coast))return null;
    start={x:input("age"),balance:coastHousehold(values).balance,comparison:coast};
    xLabel="Age";balanceIndex=1;secondaryIndex=2;secondaryKey="comparison";secondaryLabel="Coast threshold (today’s USD)";
    title="Invest, then coast: today’s purchasing power";balanceLabel="Modeled portfolio (today’s USD)";
    help="The portfolio follows the calculated path: month-end investments stop at the first modeled threshold crossing, or continue through the target age if it is not reached. All amounts are in today’s USD; neither line simulates market volatility or pays pre-retirement living costs.";
  } else if (id === "mortgage-recast" && matches(["Month", "Recast payment", "Recast interest", "Recast principal", "Recast balance", "Lump-sum-only balance"])) {
    const opening = result.metrics.find(m => m.label === "Principal after lump sum")?.value;
    if (!finite(opening)) return null;
    start = { x: 0, balance: opening, comparison: opening };
    balanceIndex = 4; secondaryIndex = 5; scale = 1 / 12;
    secondaryKey = "comparison"; secondaryLabel = "Lump sum; keep payment";
    title = "Balance after the lump sum"; balanceLabel = "Lump sum + recast";
    help = "Both curves start after the same immediate principal payment. Recast uses a lower P&I over the remaining contractual term; keeping the payment can finish sooner. The unchanged-loan baseline appears in the comparison table.";
  } else if (id === "discount-points" && matches(["Month", "Net cash-flow savings", "Balance advantage of B", "Net borrowing-cost savings", "Balance A", "Balance B"])) {
    const upfront = result.metrics.find(m => m.label === "Additional upfront cost for B")?.value;
    if (!finite(upfront)) return null;
    start = { x: 0, balance: -upfront, comparison: -upfront };
    balanceIndex = 3; secondaryIndex = 1; scale = 1 / 12; secondaryKey = "comparison"; secondaryLabel = "Net cash-flow savings";
    title = "Discount points savings over the full term"; balanceLabel = "Net borrowing-cost savings";
    help = "Positive favors offer B; negative favors A. Borrowing-cost savings include the remaining-balance difference. The primary result uses your selected holding period, while this curve covers the full loan term.";
  } else if (["investment", "interest", "savings", "compound-interest"].includes(id) && matches(["Month", "Contributions", "Net earnings", "Balance"])) {
    const principal = result.metrics.find(m => m.label === "Starting amount")?.value;
    if (!finite(principal)) return null;
    start = { x: 0, balance: principal, contributions: principal };
    balanceIndex = 3; scale = 1 / 12; secondaryIndex = 1; secondaryKey = "contributions"; secondaryLabel = "Contributions";
    help = "Contributions include your starting amount. The gap is net investment earnings or loss.";
  } else if (loanIds.includes(id) && loanColumns.some(matches)) {
    balanceIndex = columns.indexOf("Balance");
    const firstBalance = rows[0][balanceIndex], firstPrincipal = rows[0][columns.indexOf("Principal")];
    if (!finite(firstBalance) || !finite(firstPrincipal)) return null;
    // Opening = closing + principal repaid: includes financed fees, solved prices,
    // elapsed mortgages and capitalized student-loan interest without recalculation.
    start = { x: 0, balance: firstBalance + firstPrincipal };
    title = "Remaining loan balance"; xLabel = "Payment number"; balanceLabel = "Remaining principal";
    help = "Principal remaining after each payment; interest and ownership costs are separate.";
    if (id === "pmi") help = "Underlying loan principal only. PMI premiums and cancellation scenarios appear separately in results and calculation details.";
    if (id === "biweekly-mortgage") help = "Principal after each credited biweekly payment, using 26 equal modeled periods per year. Taxes, insurance and PMI are excluded.";
    if (id === "refinance") help = "New loan principal after each payment, including any financed closing costs or cash-out. This is not the old-loan schedule.";
    if (id === "heloc") help = "Principal across the modeled draw and repayment phases. This schedule assumes the initial advance and no additional draws.";
  } else if (id === "cd" && matches(["Month", "Period interest", "Cumulative interest", "Balance before tax"])) {
    start = { x: 0, balance: input("principal") }; balanceIndex = 3; scale = 1 / 12;
    title = "CD balance before tax"; balanceLabel = "Before-tax balance";
    help = "The curve is before tax. The after-tax maturity amount is shown separately in the result.";
  } else if (id === "annuity" && matches(["Month", "Addition including initial principal", "Investment return", "Ending balance"])) {
    start = { x: 0, balance: input("principal") }; balanceIndex = 3; scale = 1 / 12;
    title = "Annuity accumulation"; balanceLabel = "Account balance";
    help = "Account values follow the entered deposits, timing and constant return assumptions.";
  } else if (["annuity-payout", "retirement"].includes(id) && matches(["Period", "Time (years)", "Opening balance", "Investment return", "Payout", "Ending balance"])) {
    const opening = rows[0][2]; if (!finite(opening)) return null;
    start = { x: 0, balance: opening }; xIndex = 1; balanceIndex = 5;
    title = "Balance during withdrawals"; balanceLabel = "Remaining balance";
    help = "Balance after each modeled withdrawal. The final payout can be smaller when the account is depleted.";
  } else if (["ira", "roth-ira"].includes(id) && matches(["Age", "Annual contribution", "IRA balance", "Taxable balance"])) {
    start = { x: input("age"), balance: input("balance") }; balanceIndex = 2; xLabel = "Age";
    title = id === "ira" ? "IRA balance before withdrawal tax" : "Roth IRA account balance"; balanceLabel = "IRA account balance";
    help = id === "ira" ? "This curve shows the pre-tax IRA account. After-tax withdrawal value and the taxable-account comparison are separate result figures." : "Account balances follow the entered contribution and return assumptions. Qualified-withdrawal rules are explained in the calculation notes.";
  } else if (id === "investment-fee" && mode === "impact" && matches(["Year", "Balance", "Fund fees", "Advisor fees", "Cumulative fees"])) {
    start = { x: 0, balance: input("balance") }; balanceIndex = 1;
    title = "Balance after modeled fees"; balanceLabel = "After-fee balance";
    help = "The curve includes the modeled fees. Fees paid and lost investment growth are different amounts; do not add them together.";
  } else if (id === "investment-fee" && mode === "compare" && matches(["Year", "Option A balance", "Option B balance"])) {
    start = { x: 0, balance: input("balance"), comparison: input("balance") }; balanceIndex = 1; secondaryIndex = 2;
    secondaryKey = "comparison"; secondaryLabel = "Option B"; balanceLabel = "Option A"; title = "Compare balances after fees";
    help = "Both options use the entered starting balance, deposits and return basis, with their respective modeled fees.";
  } else if (id === "depreciation" && matches(["Year", "Depreciation", "Accumulated depreciation", "Book value"])) {
    start = { x: 0, balance: input("cost") }; balanceIndex = 3; xLabel = "Schedule year";
    title = "Remaining book value"; balanceLabel = "Book value";
    help = "Book value follows the selected depreciation method and partial-year convention. It is not an estimate of market resale value.";
  }
  if (!start || !finite(start.x) || !finite(start.balance) || (secondaryKey && !finite(start[secondaryKey]))) return null;
  const points: TrendPoint[] = [start];
  for (const row of rows) {
    const time = row[xIndex], balance = row[balanceIndex], secondary = secondaryIndex < 0 ? undefined : row[secondaryIndex];
    if (!finite(time) || !finite(balance) || time * scale <= points.at(-1)!.x || (secondaryKey && !finite(secondary))) return null;
    points.push({ x: time * scale, balance, ...(secondaryKey ? { [secondaryKey]: secondary } : {}) });
  }
  // Retain endpoints and both series' bucket extrema, with a fixed SVG size cap.
  const sampled = points.length > 241;
  let visible = points;
  if (sampled) {
    const indices = new Set([0, points.length - 1]), bucketSize = Math.ceil((points.length - 2) / 48);
    const keys = secondaryKey ? ["balance", secondaryKey] as const : ["balance"] as const;
    for (let first = 1; first < points.length - 1; first += bucketSize) {
      const end = Math.min(first + bucketSize, points.length - 1);
      for (const key of keys) {
        let min = first, max = first;
        for (let i = first + 1; i < end; i++) {
          if (points[i][key]! < points[min][key]!) min = i;
          if (points[i][key]! > points[max][key]!) max = i;
        }
        indices.add(min); indices.add(max);
      }
    }
    visible = [...indices].sort((a, b) => a - b).map(i => points[i]);
  }
  return { title, xLabel, balanceLabel, help, secondaryKey, secondaryLabel, points: visible, sampled };
}

export function trendBounds(points: TrendPoint[]) {
  let min = 0, max = 0;
  for (const point of points) for (const value of [point.balance, point.contributions, point.comparison]) {
    if (value !== undefined) { min = Math.min(min, value); max = Math.max(max, value); }
  }
  return { min, max: max === min ? min + 1 : max };
}
