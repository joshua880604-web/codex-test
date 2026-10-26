import rates from './mortgage-pmi-rates.json';
import type {Values} from './types';
import {mortgageLoanBasis} from './mortgage-inputs';
export const pmiCreditBands = rates.credit_bands;
export const automaticPmi = (v:Values) => v.pmi_method === 'Automatic estimate';
const pmiFields = new Set(['pmi_method','pmi_credit','pmi','pmi_unit','pmi_years','pmi_policy','appraised_value']);
export function mortgagePmiFieldVisible(mode:string,v:Values,key:string):boolean {
  if(!pmiFields.has(key))return true;
  if(mode==='biweekly')return false;
  if(key==='appraised_value' && mortgageLoanBasis(v))return false;
  const auto=automaticPmi(v);
  if(key==='pmi_credit')return auto;
  if(['pmi','pmi_unit','pmi_policy'].includes(key))return !auto;
  if(key==='pmi_years')return !auto&&v.pmi_policy!=='Cancel at 80% original LTV';
  if(key==='appraised_value')return auto||v.pmi_policy==='Cancel at 80% original LTV';
  return true;
}
export function estimateMortgagePmi(principal:number,originalValue:number,months:number,credit:string) {
  if(!Number.isFinite(principal)||principal<0||!Number.isFinite(originalValue)||originalValue<=0)
    throw new Error('Enter a valid loan amount and original home value for PMI.');
  const ltv=principal/originalValue*100;
  if(ltv<=80+1e-9)return {ltv,annualPercent:0,coveragePercent:0};
  const band=pmiCreditBands.indexOf(credit);
  if(band<0)throw new Error('Choose a credit score range for the automatic PMI estimate.');
  if(!Number.isInteger(months)||months<1||months>rates.maximum_months)
    throw new Error('Automatic PMI supports terms up to 40 years. Choose Manual and enter your lender quote for another term.');
  const tier=rates.ltv_upper_bounds.findIndex(max=>ltv<=max+1e-9);
  if(tier<0)throw new Error('Automatic PMI supports original LTV up to 97%. Choose Manual and enter your lender quote for higher LTV; eligibility is not determined here.');
  const table=months>240?rates.over_20_years:rates.up_to_20_years;
  return {ltv,annualPercent:table.annual_percent[tier][band],coveragePercent:table.coverage_percent[tier]};
}
export function automaticPmiPremium(principal:number,annualPercent:number,monthIndex:number) {
  const rate=monthIndex<rates.constant_renewal.initial_months?annualPercent:Math.min(annualPercent,rates.constant_renewal.later_annual_percent_cap);
  return principal*rate/100/12;
}
export const automaticPmiNote = `Automatic PMI is an illustrative National MI Monthly Advantage base-rate estimate (card effective ${rates.effective_from}, reviewed ${rates.reviewed_on}), not a live lender quote or a government-set rate. It assumes a fixed-rate, one-unit primary-residence purchase, standard agency coverage, up to two borrowers and DTI at most 45%; state eligibility, loan limits, special programs and pricing adjustments are not determined. The selected credit score range is an assumption. Premiums use the original loan amount; after 120 payments, the annual rate falls to the lesser of the initial rate or 0.20%. Requested cancellation at 80% original value is assumed approved; automatic 78% or midpoint termination is not modeled. Select Manual to enter your actual quote.`;
