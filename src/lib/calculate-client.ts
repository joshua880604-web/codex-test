import type { Calculator, Values } from './types';
import { calculateMode } from './calculate-mode';
const loaders: Record<string, () => Promise<Calculator[]>> = {
  'Mortgage and Real Estate': () => import('./calculators/property').then(m => m.propertyCalculators),
  Auto: () => import('./calculators/property').then(m => m.propertyCalculators),
  Investment: () => import('./calculators/investment').then(m => m.investmentCalculators),
  Retirement: () => import('./calculators/retirement').then(m => m.retirementCalculators),
  'Tax and Salary': () => import('./calculators/tax-salary').then(m => m.taxCalculators),
  'Everyday Tools': () => import('./calculators/everyday').then(m => m.everydayCalculators),
  Other: () => import('./calculators/other').then(m => m.otherCalculators),
};
export async function runClientCalculation(id: string, category: string, mode: string, values: Values) {
  const calculators = ['markup','cagr','emergency-fund','break-even','investment-fee','real-return'].includes(id) ? (await import('./calculators/evergreen')).evergreenCalculators : await loaders[category]();
  const calc = calculators.find(c => c.id === id);
  if (!calc) throw new Error('Unknown calculator.');
  return calculateMode(calc, mode, values);
}
