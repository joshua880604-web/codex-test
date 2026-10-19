import catalog from "../catalog-data.json";
import type { Calculator, Mode, Result } from "../types";
import { metric, money, num, select } from "../types";
import { amortize, sum, type Extra } from "../finance";
export function tool(id: string, modes: Mode[], intro: string): Calculator {
  const entry = catalog.find((x) => x.id === id);
  if (!entry) throw new Error("Unknown calculator " + id);
  return {
    id,
    title: entry.title,
    category: entry.category,
    source: entry.source_url,
    intro,
    modes,
  };
}
export const frequencies = [
  "Annually",
  "Semiannually",
  "Quarterly",
  "Monthly",
  "Semimonthly",
  "Biweekly",
  "Weekly",
  "Daily",
  "Continuously",
];
export function freq(s: string): number {
  const m: Record<string, number> = {
    Annually: 1,
    Semiannually: 2,
    Quarterly: 4,
    Monthly: 12,
    Semimonthly: 24,
    Biweekly: 26,
    Weekly: 52,
    Daily: 365,
    Continuously: 0,
  };
  if (!(s in m)) throw new Error("Choose a valid frequency.");
  return m[s];
}
export const compoundField = () =>
  select("compound", "Compounding", frequencies, "Monthly");
export const timingField = () =>
  select("timing", "Contribution timing", [
    "End of period",
    "Beginning of period",
  ]);
export function loanResult(
  p: number,
  r: number,
  n: number,
  extra: Extra = {},
  fixed?: number,
): Result {
  const rows = amortize(p, r, n, extra, fixed),
    interest = sum(rows.map((x) => x.interest)),
    paid = sum(rows.map((x) => x.payment));
  return {
    metrics: [
      money("Payment per period", rows[0]?.payment ?? 0),
      money("Total interest", interest),
      money("Total payments", paid),
      metric("Number of payments", rows.length),
    ],
    columns: ["Period", "Payment", "Interest", "Principal", "Balance"],
    rows: rows.map((x) => [
      x.period,
      x.payment,
      x.interest,
      x.principal,
      x.balance,
    ]),
    chart: [
      { label: "Principal", value: p },
      { label: "Interest", value: interest },
    ],
  };
}
export const baseLoanFields = () => [
  num("principal", "Loan amount", 100000, "$"),
  num("years", "Loan term", 10, "years", 0.01),
  num("months", "Additional months", 0, "months"),
  num("rate", "Interest rate", 6, "%"),
];
export const extraFields = () => [
  num("extra_monthly", "Extra monthly payment", 0, "$"),
  num("extra_yearly", "Extra yearly payment", 0, "$"),
  num("extra_once", "One-time extra payment", 0, "$"),
  num("extra_once_month", "One-time payment month", 1, "month", 1),
];
