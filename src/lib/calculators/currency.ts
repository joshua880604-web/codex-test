import currencySnapshot from "../currency-snapshot.json";
import { tool } from "./helpers";
import { num, select, number as n, money, metric, type Values, type Mode } from "../types";
import { positive } from "../finance";
const pct = (v: Values, k: string) => n(v, k) / 100;
const popularCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "HKD",
  "SGD",
  "INR",
  "NZD",
  "KRW",
  "MXN",
  "BRL",
  "ZAR",
  "SEK",
  "NOK",
  "DKK",
];
const currencies = [
  ...popularCurrencies,
  ...currencySnapshot.currencies
    .map((c) => c.iso_code)
    .filter((code) => !popularCurrencies.includes(code)),
  "BTC",
];
export const currencyCalculator = tool(
  "currency",
  [
    {
      id: "manual",
      title: "Custom Exchange Rate",
      fields: [
        num("amount", "Amount", 1000),
        select("from", "From currency", currencies, "USD"),
        select("to", "To currency", currencies, "EUR"),
        num(
          "rate",
          "Target currency per 1 source currency",
          0.9,
          "",
          0.0000001,
        ),
      ],
      description:
        "Convert using a user-supplied rate. This rate is not live market data.",
      formula: "Converted = source amount × exchange rate.",
      calculate: (v) => ({
        metrics: [
          metric("Converted amount", n(v, "amount") * n(v, "rate")),
          metric("Inverse rate", 1 / positive(n(v, "rate"), "Exchange rate")),
        ],
        notes: [`Manual rate: ${v.from} → ${v.to}. No live quote is implied.`],
      }),
    },
    {
      id: "snapshot",
      title: "Saved Reference Rates",
      fields: [
        num("amount", "Amount", 1000),
        select(
          "from",
          "From currency",
          currencies.filter((x) => x !== "BTC"),
          "USD",
        ),
        select(
          "to",
          "To currency",
          currencies.filter((x) => x !== "BTC"),
          "EUR",
        ),
        select("popular", "Show most popular currencies only?", ["Yes", "No"]),
      ],
      description:
        "Convert using the dated reference-rate snapshot bundled with this application. This is not a live quote.",
      formula:
        "Cross rate = USD-to-target reference / USD-to-source reference.",
      calculate: (v) => {
        const a = currencySnapshot.records.find((x) => x.to === v.from),
          b = currencySnapshot.records.find((x) => x.to === v.to);
        if (!a || !b) throw new Error("No saved reference rate for this pair.");
        const rate = b.rate / a.rate;
        return {
          metrics: [
            metric("Converted amount", n(v, "amount") * rate),
            metric("Reference exchange rate", rate),
          ],
          columns: ["Currency", "Units per " + v.from, "Quote reference date"],
          rows: currencySnapshot.records
            .filter(
              (x) => v.popular !== "Yes" || popularCurrencies.includes(x.to),
            )
            .map((x) => [x.to, x.rate / a.rate, x.date]),
          notes: [
            `Saved Frankfurter reference snapshot: ${v.from} component ${a.date}; ${v.to} component ${b.date}. Dates may differ. This is not live or executable market pricing.`,
          ],
        };
      },
    },
  ],
  "Convert currencies offline using your own exchange rate or bundled dated reference rates. No external API is contacted.",
);
