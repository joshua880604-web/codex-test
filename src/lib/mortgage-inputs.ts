import type { Values } from "./types";

export const mortgageLoanBasis = (v: Values) => v.loan_basis === "Loan amount";
const ownership = ["tax", "insurance", "hoa", "other"];
const pmiDraftKeys = ["pmi_method", "pmi_credit", "pmi", "pmi_unit", "pmi_policy", "pmi_years", "property_value", "appraised_value"];
export function mortgagePmiDraft(v: Values): Values {
  return Object.fromEntries(pmiDraftKeys.filter(key => v[key] !== undefined).map(key => [key, v[key]]));
}
export function mortgageInputVisible(mode: string, v: Values, key: string): boolean {
  const direct = mortgageLoanBasis(v);
  if (["price", "down", "down_unit"].includes(key)) return !direct;
  if (["loan_amount", "property_value"].includes(key)) return direct && (key !== "property_value" || mode !== "biweekly");
  if (mode === "biweekly" && ownership.some(k => key === k || key.startsWith(k + "_"))) return false;
  return true;
}

// Changing the input basis keeps the modeled principal, but never infers LTV
// from an unrelated, hidden purchase-price draft.
export function switchMortgageBasis(v: Values, basis: string, pmiDraft?: Values): Values {
  if (basis === v.loan_basis) return v;
  const next: Values = { ...v, loan_basis: basis };
  if (basis === "Loan amount") {
    const price = Number(v.price), down = v.down_unit === "Dollars" ? Number(v.down) : price * Number(v.down) / 100;
    if (Number.isFinite(price - down) && price > down) next.loan_amount = String(price - down);
    next.property_value = "";
    for (const k of ownership) if (v[k + "_unit"] === "Percent of home value" && Number.isFinite(price) && price > 0) {
      next[k] = String(price * Number(v[k]) / 100);
      next[k + "_unit"] = "Dollars";
    }
    next.pmi_method = "Manual";
    next.pmi_policy = "Fixed duration";
  } else if (mortgageLoanBasis(v)) {
    const loan = Number(v.loan_amount), oldPrice = Number(v.price);
    if (Number.isFinite(loan) && loan > 0) {
      const price = Number.isFinite(oldPrice) && oldPrice >= loan ? oldPrice : loan;
      next.price = String(price);
      next.down = String(v.down_unit === "Dollars" ? price - loan : (price - loan) / price * 100);
    }
  }
  return { ...next, ...mortgagePmiDraft(pmiDraft ?? {}) };
}

export function mortgageCostSummary(v: Values): string {
  const value = Number(mortgageLoanBasis(v) ? v.property_value : v.price);
  let total = 0;
  for (const key of ownership) {
    const x = Number(v[key]);
    if (!Number.isFinite(x) || x < 0) return "Check housing costs";
    if (v[key + "_unit"] === "Percent of home value" && !(value > 0)) return "Home value required for percentage costs";
    total += v[key + "_unit"] === "Percent of home value" ? value * x / 100 : x;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(total / 12) + "/mo before PMI";
}
