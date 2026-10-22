import cpi from "../cpi-data.json";
import { tool } from "./helpers";
import { num, select, number as n, money, metric, type Values, type Mode } from "../types";
import { positive } from "../finance";
const pct = (v: Values, k: string) => n(v, k) / 100;
const cpiPeriods = [
  "Annual average",
  ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
];
export const inflationCalculator = tool(
  "inflation",
  ["historical", "forward", "backward", "custom"].map((id): Mode => ({
    id,
    title:
      id === "forward"
        ? "Future Value"
        : id === "backward"
          ? "Past Value"
          : id === "custom"
            ? "Custom CPI Indexes"
            : "Historical CPI",
    fields: [
      num("amount", "Amount", 1000, "$"),
      ...(id === "historical"
        ? [
            num("start_year", "Start year", 2000, "", 1913),
            select("start_period", "Start period", cpiPeriods),
            num("end_year", "End year", 2025, "", 1913),
            select("end_period", "End period", cpiPeriods),
          ]
        : id === "custom"
          ? [
              num(
                "start_cpi",
                "CPI at start date",
                100,
                "index points",
                0.0001,
              ),
              num("end_cpi", "CPI at end date", 150, "index points", 0.0001),
            ]
          : [
              num("rate", "Annual inflation rate", 3, "%", -99),
              num("years", "Number of years", 10, "years"),
            ]),
    ],
    description:
      id === "historical"
        ? "Use the official BLS CPI-U U.S. city average, all items, not seasonally adjusted. Dataset covers 1913 through September 2026."
        : id === "custom"
          ? "Convert using two explicitly supplied CPI values from the same series."
          : "Adjust purchasing power with a constant annual inflation assumption.",
    formula:
      id === "historical" || id === "custom"
        ? "Adjusted amount = original amount × end CPI/start CPI."
        : "Adjusted amount = amount × (1 + inflation)^years; divide to work backwards.",
    calculate: (v) => {
      if (id === "historical" || id === "custom") {
        const find = (key: string) => {
          const year = n(v, key + "_year"),
            period =
              v[key + "_period"] === "Annual average"
                ? "M13"
                : "M" + v[key + "_period"];
          const x = cpi.records.find(
            (r) => r.year === year && r.period === period,
          );
          if (!x)
            throw new Error(
              `No published CPI value for ${year} ${v[key + "_period"]}. Available monthly dataset: 1913–September 2026; 2026 annual average and October 2025 are unavailable.`,
            );
          return x.value;
        };
        const start = id === "historical" ? find("start") : n(v, "start_cpi"),
          end = id === "historical" ? find("end") : n(v, "end_cpi"),
          ratio = end / positive(start, "Starting CPI");
        return {
          metrics: [
            money("Equivalent purchasing-power amount", n(v, "amount") * ratio),
            metric("Cumulative inflation", (ratio - 1) * 100, "percent"),
            metric("Start CPI", start),
            metric("End CPI", end),
          ],
          notes: [
            id === "historical"
              ? `Source: BLS ${cpi.series}, ${cpi.unit}. Published annual averages are used directly, not recalculated from rounded monthly values.`
              : "Custom CPI inputs, not an automatic data lookup.",
          ],
        };
      }
      const factor = (1 + pct(v, "rate")) ** n(v, "years");
      return {
        metrics: [
          money(
            id === "forward"
              ? "Future equivalent amount"
              : "Past equivalent amount",
            id === "forward"
              ? n(v, "amount") * factor
              : n(v, "amount") / factor,
          ),
          metric("Cumulative inflation", (factor - 1) * 100, "percent"),
        ],
      };
    },
  })),
  "Calculate inflation-adjusted purchasing power with official historical CPI data or a constant inflation assumption.",
);
