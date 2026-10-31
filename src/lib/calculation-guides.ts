import content from './calculation-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export type CalculationGuideTopic=keyof typeof content;
export const calculationGuideEntries:Record<CalculationGuideTopic,EditorialGuide>={mortgage:content.mortgage.meta,compound:content.compound.meta,annualized:content.annualized.meta};
export const calculationGuideList:EditorialGuide[]=Object.values(calculationGuideEntries);
