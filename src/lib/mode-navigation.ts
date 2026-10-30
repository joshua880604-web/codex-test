import { defaults, type Mode, type Values } from "./types";

export type ModeChoice = { id: string; label: string };
export type TaskGroup = { id: string; label: string; choices: ModeChoice[]; detailLabel?: string };
export const taskModeGroups: Record<string, TaskGroup[]> = {
  "student-loan": [
    { id: "repayment", label: "Repayment", detailLabel: "Repayment plan", choices: [
      { id: "normal", label: "Regular payments" }, { id: "extra", label: "Extra payments" }, { id: "all", label: "Pay off now" },
    ] },
    { id: "solve", label: "Find a loan value", detailLabel: "Calculate", choices: [
      { id: "solve-payment", label: "Monthly payment" }, { id: "solve-principal", label: "Loan balance" },
      { id: "solve-rate", label: "Interest rate" }, { id: "solve-term", label: "Repayment term" },
    ] },
    { id: "school", label: "In-school borrowing", choices: [{ id: "projection", label: "In-school borrowing" }] },
  ],
  margin: [
    { id: "profit", label: "Business profit margin", detailLabel: "Calculate", choices: [
      { id: "revenue", label: "Revenue" }, { id: "cost", label: "Cost" },
      { id: "margin", label: "Gross margin" }, { id: "profit", label: "Gross profit" },
    ] },
    { id: "stock", label: "Stock margin", choices: [{ id: "stock", label: "Stock margin" }] },
    { id: "currency", label: "Forex margin", choices: [{ id: "currency", label: "Forex margin" }] },
    { id: "markup", label: "Markup pricing", choices: [{ id: "markup", label: "Markup pricing" }] },
  ],
  commission: [
    { id: "simple", label: "Simple", detailLabel: "Find", choices: [
      { id: "any-two", label: "Auto (enter any two)" }, { id: "commission", label: "Commission earned" },
      { id: "sales", label: "Sales amount" }, { id: "rate", label: "Commission rate" },
    ] },
    { id: "tiered", label: "Tiered", choices: [{ id: "tiered", label: "Tiered commission" }] },
  ],
};
export const savingsChoices: ModeChoice[] = [
  { id: "accumulation", label: "Balance" },
  { id: "goal-contribution", label: "Deposit" },
  { id: "goal-time", label: "Time" },
];

// Scopes describe input meaning, not just matching field keys. Nothing is persisted.
export function modeDraftScope(calculatorId: string, modeId: string): string | undefined {
  if (calculatorId === "cash-on-cash-return" || calculatorId === "cap-rate") return modeId;
  if (calculatorId === "mortgage") return "mortgage";
  if (calculatorId === "mortgage-payoff") return modeId.split("-")[0];
  if (calculatorId === "savings") return "savings";
  if (calculatorId === "student-loan") {
    if (["normal", "extra"].includes(modeId)) return "original-loan";
    if (modeId.startsWith("solve-")) return "loan-unknown";
    return modeId === "all" ? "current-payoff" : "in-school";
  }
  if (calculatorId === "margin") return ["revenue", "cost", "margin", "profit"].includes(modeId) ? "profit" : modeId;
  if (calculatorId === "commission") return modeId === "tiered" ? "tiered" : "simple";
}
export function switchModeInputs(calculatorId: string, current: Mode, next: Mode, values: Values, drafts: Record<string, Values>) {
  const currentScope = modeDraftScope(calculatorId, current.id), nextScope = modeDraftScope(calculatorId, next.id);
  if (!currentScope || !nextScope) return { values: defaults(next), drafts };
  let currentDraft = { ...drafts[currentScope], ...values };
  // A dedicated commission solver supplies only two known values. Normalize its
  // unknown now, including when the user visits Tiered before returning to Simple.
  if (calculatorId === "commission" && !["any-two", "tiered"].includes(current.id)) {
    currentDraft = Object.fromEntries(["sales", "rate", "commission"].map(key => [key, current.fields.some(f => f.key === key) ? values[key] ?? "" : ""]));
  }
  const saved = { ...drafts, [currentScope]: currentDraft };
  const draft = saved[nextScope];
  const nextValues = Object.fromEntries(next.fields.map(field => [field.key, draft?.[field.key] ?? String(field.value)]));
  return { values: nextValues, drafts: saved };
}
