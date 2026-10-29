import debtStrategyContent from './debt-strategy-content.json';
import { calculatorPresetHref } from './preset-links';
import data from "./long-tail-content.json";
import fireBudgetContent from './fire-budget-content.json';
import strategyContent from './strategy-tools-content.json';
import coastContent from './coast-fire-content.json';
import businessContent from './business-tool-content.json';
import refresh from "./researched-calculator-content.json";
import { routeFor } from "./catalog";

export type LongTailLink = { id: string; mode: string; label: string; values?: Record<string, string> };
export type LongTailQuestion = { anchor: string; queries: string[]; question: string; answer: string; links: LongTailLink[]; replacesQuestion?: string };
const original = data as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
const additions = {...debtStrategyContent,...fireBudgetContent,...refresh,...businessContent,...coastContent,...strategyContent} as unknown as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
export const longTailContent = {...original,...Object.fromEntries(Object.entries(additions).map(([id,entry])=>[id,{updatedOn:entry.updatedOn,items:[...(original[id]?.items??[]),...entry.items]}]))};
export function longTailHref(link: LongTailLink) {
  return calculatorPresetHref(routeFor(link.id),link.mode,link.values);
}
