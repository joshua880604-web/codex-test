import type { Calculator, Values } from './types';
const loaders: Record<string, () => Promise<Calculator[]>> = {
  'Mortgage and Real Estate': () => import('./calculators/property').then(m => m.propertyCalculators),
  Auto: () => import('./calculators/property').then(m => m.propertyCalculators),
  Investment: () => import('./calculators/investment').then(m => m.investmentCalculators),
  Retirement: () => import('./calculators/retirement-core').then(m => m.retirementCoreCalculators),
  'Tax and Salary': () => import('./calculators/tax-salary').then(m => m.taxCalculators),
  'Everyday Tools': () => import('./calculators/everyday').then(m => m.everydayCalculators),
  Other: () => import('./calculators/other-core').then(m => m.otherCoreCalculators),
};
const businessTools = () => import('./calculators/business-tools').then(m => m.businessTools);
const dataTools: Record<string, () => Promise<Calculator[]>> = {
  roas: businessTools, 'landed-cost': businessTools, 'quick-ratio': businessTools, 'current-ratio': businessTools,
  'tax-equivalent-yield': () => import('./calculators/investment-decisions').then(m => m.investmentDecisions),
  'treasury-bill': () => import('./calculators/investment-decisions').then(m => m.investmentDecisions),
  'mortgage-recast': () => import('./calculators/mortgage-recast').then(m => [m.mortgageRecast]),
  pmi: () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  'biweekly-mortgage': () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  'discount-points': () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  currency: () => import('./calculators/currency').then(m => [m.currencyCalculator]),
  inflation: () => import('./calculators/inflation').then(m => [m.inflationCalculator]),
  rmd: () => import('./calculators/rmd').then(m => [m.rmdCalculator]),
};
export async function runClientCalculation(id: string, category: string, mode: string, values: Values) {
  const load = dataTools[id] ?? (['markup','cagr','emergency-fund','break-even','investment-fee','real-return'].includes(id)
    ? () => import('./calculators/evergreen').then(m => m.evergreenCalculators)
    : loaders[category]);
  if (!load) throw new Error('Unknown calculator category.');
  let loaded: [Calculator[], typeof import('./calculate-mode')];
  try { loaded = await Promise.all([load(), import('./calculate-mode')]); }
  catch { throw new Error('The calculator could not load. Check your connection and reload this page.'); }
  const [calculators, {calculateMode}] = loaded;
  const calc = calculators.find(c => c.id === id);
  if (!calc) throw new Error('Unknown calculator.');
  return calculateMode(calc, mode, values);
}
