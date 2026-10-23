"use client";
import { useId } from "react";
import { resultTrend, trendBounds } from "@/lib/result-trend";
import type { Result, Values } from "@/lib/types";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Math.abs(value) < .005 ? 0 : value);
const compact = (value: number) => new Intl.NumberFormat("en-US", { notation: Math.abs(value) >= 1e12 || (value !== 0 && Math.abs(value) < .01) ? "scientific" : "compact", maximumFractionDigits: 1 }).format(value);
export default function ResultTrend({ id, mode, values, result }: { id: string; mode: string; values: Values; result: Result }) {
  const uid = useId();
  const trend = resultTrend(id, mode, values, result);
  if (!trend) return null;
  const { points } = trend, first = points[0], last = points.at(-1)!;
  const { min, max } = trendBounds(points);
  const width = 420, height = 250, left = 66, right = 398, top = 18, bottom = 198;
  const x = (value: number) => left + (value - first.x) / (last.x - first.x) * (right - left);
  const y = (value: number) => bottom - (value - min) / (max - min) * (bottom - top);
  const line = (key: "balance" | "contributions" | "comparison") => points.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(2)},${y(p[key]!).toFixed(2)}`).join(" ");
  return <figure className="result-trend">
    <figcaption>{trend.title}</figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
      <title id={`${uid}-title`}>{trend.title}</title>
      <desc id={`${uid}-desc`}>{trend.balanceLabel} in USD, from {money(first.balance)} at {trend.xLabel.toLowerCase()} {first.x} to {money(last.balance)} at {trend.xLabel.toLowerCase()} {last.x.toLocaleString("en-US", { maximumFractionDigits: 2 })}.{trend.secondaryKey ? ` Final ${trend.secondaryLabel}: ${money(last[trend.secondaryKey]!)}.` : ""} Full values are available in the calculation details and CSV.</desc>
      {[0, .5, 1].map(fraction => {
        const value = min + (max - min) * fraction;
        return <g key={fraction}><line x1={left} x2={right} y1={y(value)} y2={y(value)} className="trend-grid" /><text x={left - 9} y={y(value) + 5} textAnchor="end">{compact(value)}</text></g>;
      })}
      {trend.secondaryKey && <path d={line(trend.secondaryKey)} className="trend-contributions" />}
      <path d={line("balance")} className="trend-balance" />
      <circle cx={x(last.x)} cy={y(last.balance)} r="4" className="trend-end" />
      {[0, .5, 1].map(fraction => { const time = first.x + (last.x - first.x) * fraction; return <text key={fraction} x={x(time)} y={bottom + 23} textAnchor={fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"}>{compact(time)}</text>; })}
      <text x={(left + right) / 2} y={height - 6} textAnchor="middle">{trend.xLabel}</text>
      <text x={left} y="12">USD</text>
    </svg>
    <ul className="trend-legend">
      <li><span className="trend-key balance-key" />{trend.balanceLabel}<strong>{money(last.balance)}</strong></li>
      {trend.secondaryKey && <li><span className="trend-key contributions-key" />{trend.secondaryLabel}<strong>{money(last[trend.secondaryKey]!)}</strong></li>}
    </ul>
    <p className="trend-help">{trend.sampled ? "A simplified view of the calculated schedule. " : ""}{trend.help} Open calculation details for exact values.</p>
  </figure>;
}
