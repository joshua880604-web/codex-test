import {number as read, type Values} from './types';

export function coastFieldVisible(values: Values, key: string) {
  return !['partner_balance', 'partner_monthly'].includes(key) || values.household === 'Couple';
}

/** One shared horizon and budget; assets must be entered once per owner. */
export function coastHousehold(values: Values) {
  const couple = values.household === 'Couple';
  const partnerBalance = couple ? read(values, 'partner_balance') : 0;
  const partnerMonthly = couple ? read(values, 'partner_monthly') : 0;
  if (partnerBalance < 0 || partnerMonthly < 0) throw new Error('Partner assets and monthly investments cannot be negative.');
  return {couple, balance: read(values, 'balance') + partnerBalance, monthly: read(values, 'monthly') + partnerMonthly};
}
