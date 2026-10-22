export type Values = Record<string, string>;
export type Field = {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  type?: "number" | "select" | "textarea" | "date";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  optional?: boolean;
};
export type Metric = {
  currency?: string;
  displayValue?: string;
  label: string;
  value: number;
  format?: "money" | "number" | "percent";
  digits?: number;
};
export type Result = {
  metrics: Metric[];
  rows?: (number | string)[][];
  columns?: string[];
  annualRows?: (number | string)[][];
  annualColumns?: string[];
  schedulePeriod?: string;
  additionalTables?: { title: string; columns: string[]; rows: (number | string)[][]; note?: string }[];
  notes?: string[];
  chart?: { label: string; value: number }[];
};
export type Mode = {
  id: string;
  title: string;
  fields: Field[];
  calculate: (values: Values) => Result;
  formula: string;
  description: string;
};
export type Calculator = {
  id: string;
  title: string;
  category: string;
  intro: string;
  modes: Mode[];
  related?: string[];
  directory?: boolean;
};
export const num = (
  key: string,
  label: string,
  value: number,
  unit?: string,
  min = 0,
): Field => ({ key, label, value, unit, min });
export const select = (
  key: string,
  label: string,
  options: string[],
  value = options[0],
): Field => ({ key, label, value, type: "select", options });
export const area = (
  key: string,
  label: string,
  value: string,
  hint?: string,
): Field => ({ key, label, value, type: "textarea", hint });
export const date = (key: string, label: string, value: string): Field => ({
  key,
  label,
  value,
  type: "date",
});
export const money = (label: string, value: number): Metric => ({
  label,
  value,
  format: "money",
});
export const metric = (
  label: string,
  value: number,
  format: Metric["format"] = "number",
): Metric => ({ label, value, format });
export function number(v: Values, key: string): number {
  const raw = v[key];
  if (raw === undefined || raw.trim() === "")
    throw new Error(`Enter ${key.replaceAll("_", " ")}.`);
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error("Enter a valid finite number.");
  return n;
}
export const defaults = (mode: Mode): Values =>
  Object.fromEntries(mode.fields.map((f) => [f.key, String(f.value)]));
