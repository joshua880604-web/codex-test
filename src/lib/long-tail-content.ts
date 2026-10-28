import { calculatorPresetHref } from './preset-links';
import data from "./long-tail-content.json";
import businessContent from './business-tool-content.json';
import refresh from "./researched-calculator-content.json";
import { routeFor } from "./catalog";

export type LongTailLink = { id: string; mode: string; label: string; values?: Record<string, string> };
export type LongTailQuestion = { anchor: string; queries: string[]; question: string; answer: string; links: LongTailLink[]; replacesQuestion?: string };
const original = data as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
const additions = {...refresh,...businessContent} as unknown as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
export const longTailContent = {...original,...Object.fromEntries(Object.entries(additions).map(([id,entry])=>[id,{updatedOn:entry.updatedOn,items:[...(original[id]?.items??[]),...entry.items]}]))};
export function longTailHref(link: LongTailLink) {
  return calculatorPresetHref(routeFor(link.id),link.mode,link.values);
}
