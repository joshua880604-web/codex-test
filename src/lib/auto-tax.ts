/** Verified dealer-purchase tax-base treatments, reviewed 2026-10-19.
 * Sources and eligibility details: docs/financial-clone/research/auto-state-rules.json.
 * The entered rate is retained; local surtaxes and taxable dealer fees are not inferred.
 */
export const autoTaxStates = [
  "Manual",
  "California",
  "Texas",
  "Florida",
  "New York",
  "Illinois",
  "Massachusetts",
  "Michigan",
  "Washington",
];
export function autoTaxBase(
  price: number,
  trade: number,
  rebate: number,
  state: string,
  year: number,
  tradeCredit: boolean,
  rebateCredit: boolean,
): number {
  if (!autoTaxStates.includes(state))
    throw new Error("Choose a supported tax treatment.");
  if (state !== "Manual") {
    tradeCredit = state !== "California";
    rebateCredit = ["Texas", "Massachusetts"].includes(state);
    if (state === "Michigan") {
      if (!Number.isInteger(year) || year < 2025 || year > 2029)
        throw new Error(
          "Michigan tax treatment supports purchase years 2025–2029.",
        );
      trade = Math.min(
        trade,
        year === 2029 ? Infinity : 11000 + (year - 2025) * 1000,
      );
    }
  }
  return Math.max(
    0,
    price - (tradeCredit ? trade : 0) - (rebateCredit ? rebate : 0),
  );
}
