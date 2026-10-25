import data from "./long-tail-content.json";
import { routeFor } from "./catalog";

export type LongTailLink = { id: string; mode: string; label: string; values?: Record<string, string> };
export type LongTailQuestion = { anchor: string; queries: string[]; question: string; answer: string; links: LongTailLink[]; replacesQuestion?: string };
export const longTailContent = data as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
export function longTailHref(link: LongTailLink) {
  return routeFor(link.id) + "?" + new URLSearchParams({mode:link.mode,...link.values}) + "#calculator-panel";
}
