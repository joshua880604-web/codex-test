// Display taxonomy only. Calculator IDs, source categories, routes and math stay stable.
export type CalculatorCategory = {
  id: string; title: string; popular: string[]; tools: string[]; aliases: string[];
  sections?: { title: string; tools: string[] }[];
};
export const calculatorCategories: CalculatorCategory[] = [
  { id: 'mortgage-housing', title: 'Mortgage & Housing', popular: ['mortgage','pmi','house-affordability','mortgage-payoff'], aliases: ['mortgage-and-real-estate'],
    tools: ['mortgage','amortization','mortgage-payoff','house-affordability','rent','debt-to-income-ratio','real-estate','refinance','rental-property','apr','fha-loan','va-mortgage','home-equity-loan','heloc','down-payment','rent-vs-buy','pmi','biweekly-mortgage','discount-points'],
    sections: [
      { title: 'Buying a home & loan costs', tools: ['mortgage','house-affordability','down-payment','debt-to-income-ratio','pmi','discount-points','fha-loan','va-mortgage','apr'] },
      { title: 'Payoff & interest savings', tools: ['mortgage-payoff','biweekly-mortgage','amortization'] },
      { title: 'Refinancing & home equity', tools: ['refinance','home-equity-loan','heloc'] },
      { title: 'Renting & property investment', tools: ['rent','rent-vs-buy','rental-property'] },
    ] },
  { id: 'loans-debt', title: 'Loans & Debt', popular: ['loan','auto-loan','credit-card','debt-payoff'], aliases: ['auto','other'],
    tools: ['loan','payment','auto-loan','cash-back-or-low-interest','auto-lease','credit-card','credit-cards-payoff','debt-payoff','debt-consolidation','repayment','student-loan','personal-loan','boat-loan','lease'] },
  { id: 'saving-investing', title: 'Savings & Investing', popular: ['compound-interest','savings','investment','cd'], aliases: ['investment'],
    tools: ['interest','investment','finance','compound-interest','interest-rate','savings','simple-interest','cd','bond','mutual-fund','average-return','irr','roi','payback-period','present-value','future-value','inflation','college-cost','cagr','emergency-fund','investment-fee','real-return','currency','budget'],
    sections: [
      { title: 'Savings & personal planning', tools: ['savings','cd','emergency-fund','budget','college-cost'] },
      { title: 'Investment returns & fees', tools: ['investment','compound-interest','roi','cagr','real-return','mutual-fund','investment-fee','average-return','bond','irr','payback-period'] },
      { title: 'Interest & financial basics', tools: ['interest','simple-interest','interest-rate','finance','present-value','future-value','inflation','currency'] },
    ] },
  { id: 'retirement', title: 'Retirement', popular: ['retirement','401k','roth-ira','rmd'], aliases: [],
    tools: ['retirement','401k','pension','social-security','annuity','annuity-payout','roth-ira','ira','rmd'] },
  { id: 'tax-salary', title: 'Tax & Income', popular: ['income-tax','take-home-paycheck','salary','sales-tax'], aliases: ['tax-and-salary'],
    tools: ['income-tax','salary','marriage-tax','estate-tax','take-home-paycheck','sales-tax','vat','commission'] },
  { id: 'business-finance', title: 'Business Finance', popular: ['break-even','margin','markup','business-loan','depreciation'], aliases: [],
    tools: ['break-even','margin','markup','business-loan','depreciation'] },
  { id: 'everyday', title: 'Everyday Tools', popular: ['percentage','scientific','date','unit-converter'], aliases: ['everyday-tools'],
    tools: ['percentage','scientific','date','unit-converter','tip-bill-split','discount'] },
];
const categoryByTool = new Map(calculatorCategories.flatMap(group => group.tools.map(id => [id, group] as const)));
export function calculatorCategory(id: string) { return categoryByTool.get(id); }
export function categoryHref(id: string) { return '/financial-calculator.html#' + id; }
export const categoryNavigation = calculatorCategories.map(({id,title}) => ({id,title,href:categoryHref(id)}));
export const overviewTools = ['mortgage','loan','compound-interest','pmi','savings','retirement','income-tax','take-home-paycheck'];
export function sidebarTools(id?: string) {
  const group = id ? calculatorCategory(id) : undefined;
  if (!group) return { title: 'Popular financial calculators', href: '/financial-calculator.html', ids: overviewTools };
  const section = group.sections?.find(section => section.tools.includes(id!));
  const related = group.id === 'loans-debt' ? ['apr','amortization','business-loan'] : group.id === 'business-finance' ? ['commission','roi','loan'] : [];
  return { title: group.title, href: categoryHref(group.id), ids: [...new Set([...(section?.tools ?? []),...group.popular,...related,...group.tools])].filter(tool => tool !== id && tool !== 'real-estate').slice(0,8) };
}
