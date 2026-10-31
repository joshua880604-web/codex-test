import content from './calculation-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export type CalculationGuideTopic=keyof typeof content;
export const calculationGuideEntries:Record<CalculationGuideTopic,EditorialGuide>={mortgage:content.mortgage.meta,compound:content.compound.meta,annualized:content.annualized.meta,house:content.house.meta,cash:content.cash.meta,landed:content.landed.meta};
export const calculationGuideList:EditorialGuide[]=Object.values(calculationGuideEntries);
