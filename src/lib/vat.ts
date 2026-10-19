import type { Values } from "./types";
export const vatKeys = ["rate", "net", "gross", "tax"] as const;
/** Solve G=N+T and T=N*r for exactly two known nonnegative values. */
export function solveVAT(values: Values) {
  const known = vatKeys.filter(
    (key) => values[key]?.trim() !== "" && values[key] !== undefined,
  );
  if (known.length !== 2)
    throw new Error(
      "Enter exactly two values and leave the other two fields blank.",
    );
  const input = Object.fromEntries(
    known.map((key) => [key, Number(values[key])]),
  );
  if (
    Object.values(input).some((value) => !Number.isFinite(value) || value < 0)
  )
    throw new Error(
      "Enter valid nonnegative prices, tax amounts, and VAT rates.",
    );
  let net: number, gross: number, tax: number, rate: number;
  const indeterminate = () => {
    throw new Error(
      "These two values do not determine a unique answer. Enter a VAT rate together with a net or gross price, or use a positive net price.",
    );
  };
  if ("rate" in input) {
    rate = input.rate;
    const r = rate / 100;
    if ("net" in input) {
      net = input.net;
      tax = net * r;
      gross = net + tax;
    } else if ("gross" in input) {
      gross = input.gross;
      net = gross / (1 + r);
      tax = gross - net;
    } else {
      tax = input.tax;
      if (r === 0) {
        if (tax > 0)
          throw new Error(
            "A zero VAT rate cannot produce a positive tax amount.",
          );
        return indeterminate();
      }
      net = tax / r;
      gross = net + tax;
    }
  } else {
    if ("net" in input) {
      net = input.net;
      if ("gross" in input) {
        gross = input.gross;
        if (gross < net)
          throw new Error("Gross price must be at least the net price.");
        tax = gross - net;
      } else {
        tax = input.tax;
        gross = net + tax;
      }
    } else {
      gross = input.gross;
      tax = input.tax;
      if (tax > gross)
        throw new Error("Tax amount cannot exceed the gross price.");
      net = gross - tax;
    }
    if (net === 0) {
      if (tax > 0)
        throw new Error("A positive tax amount requires a positive net price.");
      return indeterminate();
    }
    rate = (tax / net) * 100;
  }
  if (![net, gross, tax, rate].every(Number.isFinite))
    throw new Error("These values exceed the supported numeric range.");
  return { net, gross, tax, rate };
}
