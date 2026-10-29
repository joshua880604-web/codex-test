// First rollout: user-selected calculators only. Existing sharing stays available elsewhere.
export const shareToolIds=['coast-fire','fire','lean-fire','fat-fire','barista-fire','rmd','hsa','brrrr','rent-vs-buy','mortgage-vs-invest','mortgage-payoff','house-affordability','pmi','heloc','debt-snowball','debt-avalanche','credit-cards-payoff','roas','landed-cost','break-even'] as const;
export function hasShareTools(id:string){return (shareToolIds as readonly string[]).includes(id);}
