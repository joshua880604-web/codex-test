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
export async function referenceRate(
  from: string,
  to: string,
  fetcher: typeof fetch = fetch,
) {
  if (!currencyCodes.has(from) || !currencyCodes.has(to))
    throw new Error("Unsupported currency.");
  if (from === to)
    return {
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      source: "Identity conversion",
      stale: false,
    };
  if (from === "BTC" || to === "BTC") {
    const quote = from === "BTC" ? to : from;
    try {
      const response = await fetcher(
        "https://api.coinbase.com/v2/prices/BTC-" + quote + "/spot",
        { signal: AbortSignal.timeout(8000), cache: "no-store" },
      );
      if (!response.ok) throw new Error("Spot feed unavailable");
      const data = await response.json(),
        price = Number(data.data?.amount);
      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        data.data?.currency !== quote
      )
        throw new Error("Invalid spot price");
      return {
        rate: from === "BTC" ? price : 1 / price,
        date: new Date().toISOString(),
        source: "Coinbase public spot price; timestamp is retrieval time",
        stale: false,
      };
    } catch {
      throw new Error(
        "Bitcoin spot feed is unavailable for this currency pair. Select Custom Exchange Rate; no Bitcoin quote has been substituted.",
      );
    }
  }

  try {
    const response = await fetcher(
      "https://api.frankfurter.dev/v2/rate/" +
        from.toLowerCase() +
        "/" +
        to.toLowerCase(),
      { signal: AbortSignal.timeout(8000), cache: "no-store" },
    );
    if (!response.ok) throw new Error("Reference feed unavailable");
    const data = await response.json();
    if (
      !Number.isFinite(data.rate) ||
      data.rate <= 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    )
      throw new Error("Invalid reference rate");
    return {
      rate: data.rate,
      date: data.date,
      source: "Frankfurter v2 daily blended reference rate",
      stale: false,
    };
  } catch {
    const saved = savedRate(from, to);
    if (saved) return saved;
    throw new Error(
      "Reference feed is unavailable, and no saved rate exists. Use Custom Exchange Rate.",
    );
  }
}
