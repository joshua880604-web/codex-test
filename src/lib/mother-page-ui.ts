// Reviewed copy and display decisions for the first six mother pages only.
// Kept separate from the longer server-rendered guide content.
export const motherPageReviewedOn='2026-10-29';
export const motherPageIds=['coast-fire','roi','rent-vs-buy','credit-cards-payoff','brrrr','roas'] as const;
export type MotherPageCopy={intro:string;scope?:string;hints?:Record<string,string>;suppressSingleModeDescription?:boolean};
export const motherPageCopy:Record<string,MotherPageCopy>={
 'coast-fire':{intro:'Find your Coast FIRE number and when your retirement savings could reach it under your assumptions.',scope:'Amounts are in today’s USD. Monthly investing stops at the modeled Coast threshold; living costs before retirement are separate.',suppressSingleModeDescription:true},
 roi:{intro:'Calculate total or annualized ROI from an initial investment, a terminal returned amount and your holding period.'},
 'rent-vs-buy':{intro:'Compare buying and renting over a fixed 30-year projection, including home equity after sale and invested cash-flow differences.',hints:{years:'Loan term only; the comparison stays 30 years.'},suppressSingleModeDescription:true},
 'credit-cards-payoff':{intro:'Estimate payoff time and interest across multiple cards, directing extra payments to the highest APR first.',scope:'Enter one total monthly budget, including all minimums. The plan uses fixed APRs and entered dollar minimums; it excludes new purchases and fees.',suppressSingleModeDescription:true},
 brrrr:{intro:'Estimate cash left in a BRRRR deal, refinance proceeds and rental cash flow for one property.',scope:'One acquisition and refinance in USD. Refinancing creates debt, not profit; cash-on-cash return uses positive cash remaining after refinance.',suppressSingleModeDescription:true},
 roas:{intro:'Calculate ROAS as a multiple or percentage, then check a break-even threshold or target contribution margin.',scope:'ROAS measures attributed revenue per ad dollar. Product costs, overhead and taxes can still turn a high ROAS into a loss.'},
};
