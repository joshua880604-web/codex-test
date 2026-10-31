import content from './decision-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export type DecisionGuideTopic='mortgage'|'drip'|'roth';
export const decisionGuideEntries:Record<DecisionGuideTopic,EditorialGuide>={mortgage:content.mortgage.meta,drip:content.drip.meta,roth:content.roth.meta};
export const decisionGuideList:EditorialGuide[]=[decisionGuideEntries.roth,decisionGuideEntries.mortgage,decisionGuideEntries.drip];
