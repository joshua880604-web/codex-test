import {mortgageTools} from "./mortgage-tools";
import {evergreenCalculators} from "./evergreen";
import { calculateMode } from "../calculate-mode";
import data from "../catalog-data.json";
import { propertyCalculators } from "./property";
import { investmentCalculators } from "./investment";
import { retirementCalculators } from "./retirement";
import { taxCalculators } from "./tax-salary";
import { everydayCalculators } from "./everyday";
import { otherCalculators } from "./other";
import { defaults, type Calculator, type Values, type Result } from "../types";
export const calculators: Calculator[] = [
  ...evergreenCalculators,
  ...mortgageTools,
  ...propertyCalculators,
  ...investmentCalculators,
  ...retirementCalculators,
  ...taxCalculators,
  ...otherCalculators,
  ...everydayCalculators,
].sort(
  (a, b) =>
    data.findIndex((x) => x.id === a.id) - data.findIndex((x) => x.id === b.id),
);
export const categories = [...new Set(data.map((x) => x.category))];
export const routeFor = (id: string) =>
  data.find((x) => x.id === id)?.local_route ?? "/financial-calculator.html";
export const calculatorBySlug = (slug: string) =>
  calculators.find((c) => routeFor(c.id) === "/" + slug);
export function runCalculation(id: string, modeId: string, v: Values): Result {
  const calc = calculators.find(c => c.id === id);
  if (!calc) throw new Error("Unknown calculator mode.");
  return calculateMode(calc, modeId, v);
}

export { defaults };
