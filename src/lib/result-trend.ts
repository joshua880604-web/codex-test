import type { Result, Values } from "./types";

export type TrendPoint = { x: number; balance: number; contributions?: number };
export type ResultTrend = {
  title: string;
  xLabel: string;
  points: TrendPoint[];
  sampled: boolean;
};

// Presentation only: read the computed schedule, never repeat financial formulas.
export function resultTrend(id: string, mode: string, values: Values, result: Result): ResultTrend | null {
  const growth = id === "investment" || (id === "compound-interest" && mode === "growth");
  const loan = id === "loan" && mode === "amortized";
  if (!growth && !loan) return null;
  const columns = growth ? ["Month", "Contributions", "Net earnings", "Balance"] : ["Period", "Payment", "Interest", "Principal", "Balance"];
  if (!result.rows?.length || JSON.stringify(result.columns) !== JSON.stringify(columns)) return null;
  const start = growth ? result.metrics.find(m => m.label === "Starting amount")?.value : Number(values.principal);
  if (start === undefined || !Number.isFinite(start) || (loan && !values.principal?.trim())) return null;
  const points: TrendPoint[] = [{ x: 0, balance: start, ...(growth ? { contributions: start } : {}) }];
  for (const row of result.rows) {
    const x = row[0], balance = row[growth ? 3 : 4], contributions = row[1];
    if (typeof x !== "number" || typeof balance !== "number" || !Number.isFinite(x) || !Number.isFinite(balance) || x <= points.at(-1)!.x * (growth ? 12 : 1)) return null;
    if (growth && (typeof contributions !== "number" || !Number.isFinite(contributions))) return null;
    points.push({ x: growth ? x / 12 : x, balance, ...(growth ? { contributions: contributions as number } : {}) });
  }
  // Preserve both ends and local extrema of every series within each bucket.
  // This keeps year-end tax deductions visible without shipping huge SVG paths.
  const sampled = points.length > 241;
  let visible = points;
  if (sampled) {
    const indices = new Set([0, points.length - 1]);
    const bucketSize = Math.ceil((points.length - 2) / 48);
    for (let first = 1; first < points.length - 1; first += bucketSize) {
      const end = Math.min(first + bucketSize, points.length - 1);
      for (const key of (growth ? ["balance", "contributions"] : ["balance"]) as ("balance" | "contributions")[]) {
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
  return { title: growth ? "Balance over time" : "Remaining loan balance", xLabel: growth ? "Years" : "Payment number", points: visible, sampled };
}

export function trendBounds(points: TrendPoint[]) {
  let min = 0, max = 0;
  for (const point of points) for (const value of [point.balance, point.contributions]) {
    if (value !== undefined) { min = Math.min(min, value); max = Math.max(max, value); }
  }
  return { min, max: max === min ? min + 1 : max };
}
