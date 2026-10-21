import snapshot from "./currency-snapshot.json";
export const currencyCodes = new Set([
  ...snapshot.currencies.map((c) => c.iso_code),
  "BTC",
]);
export function savedRate(from: string, to: string) {
  const a = snapshot.records.find((x) => x.to === from),
    b = snapshot.records.find((x) => x.to === to);
  if (!a || !b) return null;
  return {
    rate: b.rate / a.rate,
    date: a.date === b.date ? a.date : a.date + " / " + b.date,
    source: "Frankfurter saved reference snapshot — not live",
    stale: true,
    components: [
      { currency: from, date: a.date },
      { currency: to, date: b.date },
    ],
  };
}
