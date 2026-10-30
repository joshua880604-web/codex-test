import {tool} from './helpers';
import {minimumPaymentPlan,type MinimumPlan} from '../credit-minimum';
import {num,select,money,metric,number as read,type Values,type Result} from '../types';
export function cardMinimumResult(v:Values):Result{
 const amount=(key:string)=>{const x=read(v,key);if(x<0||x>1e9)throw Error('Enter nonnegative USD amounts up to one billion.');return x;};
 const apr=read(v,'rate'),percent=read(v,'minimum');if(apr<0||apr>100||percent<0||percent>100)throw Error('Use an APR and minimum percentage between 0% and 100%.');
 if(!['Yes','No'].includes(v.interest_extra))throw Error('Choose whether monthly interest is added to the percentage minimum.');
 const input:MinimumPlan={balance:amount('principal'),apr,percent,floor:amount('floor'),interestExtra:v.interest_extra==='Yes',extra:amount('extra')};
 const bounded=(x:MinimumPlan)=>{const p=minimumPaymentPlan(x);if(p.months>1200)throw Error('The balance is not repaid within this calculator’s 100-year projection limit. Increase the payment or review the rule.');return p;};
 const plan=bounded(input),baseline=(()=>{try{return bounded({...input,extra:0});}catch{return null;}})();
 const comparison=[...new Set([0,input.extra,25,50,100])].sort((a,b)=>a-b).map(extra=>{try{const p=bounded({...input,extra});return [extra,p.firstPayment,p.months,p.total,p.totalPayments];}catch{return [extra,'Not available','Not repaid within supported rules','Not available','Not available'];}});
 return {metrics:[money('Initial modeled minimum payment',plan.firstMinimum),money('Initial payment including extra',plan.firstPayment),metric('Months to repay',plan.months),money('Total interest',plan.total),money('Total payments',plan.totalPayments),money('First-month interest',input.balance*input.apr/1200),money('First-month principal reduction',plan.rows[0]?.[3]??0),baseline?metric('Months saved versus minimum only',baseline.months-plan.months):{...metric('Months saved versus minimum only',0),displayValue:'No supported minimum-only payoff'},baseline?money('Interest saved versus minimum only',baseline.total-plan.total):{...money('Interest saved versus minimum only',0),displayValue:'No supported minimum-only payoff'}],
 columns:['Month','Payment','Interest','Principal','Balance'],rows:plan.rows,
 additionalTables:[{title:'Minimum only versus extra monthly payments',columns:['Extra above recalculated minimum (USD)','First payment (USD)','Months to repay','Total interest (USD)','Total payments (USD)'],rows:comparison,note:'Each row recalculates the minimum as the balance changes, then adds the stated fixed extra amount. It is not a fixed-total-payment strategy. Unsupported paths do not receive invented payoff dates or savings.'}],
 notes:[
 'This is a user-defined single-balance estimate, not the minimum due on your actual statement. Interest is opening balance × APR / 12. Percentage amount is opening balance × minimum percentage; add monthly interest to that amount only when Yes is selected. Take the larger of this amount and the dollar floor, capped by balance plus interest.',
 'The extra amount is added above each recalculated minimum, not used to hold the total payment fixed. As a percentage minimum declines, the total monthly payment may decline too. The final payment is capped at the amount owed. A dollar floor can repay a small remaining balance sooner.',
 'No new purchases, fees, past-due amounts, grace periods, promotional rate changes, multiple APR balances or installment-plan amounts are modeled. Real card issuers often accrue interest daily, use statement balances and round charges or minimums differently. Refer to your cardmember agreement and current statement for the actual required amount.',
 'Internal calculations retain fractional cents and round only for display. Small differences from statement rounding accumulate over a long schedule. The supported estimate ends within 1,200 months (100 years); non-amortizing or longer paths return an error rather than a payoff promise.',
 'Savings compare the same balance, APR and minimum rule with and without your selected extra payment. If the minimum-only path is not repayable under supported rules, savings are undefined. New borrowing and changes to the minimum formula can invalidate the comparison. No credit-score, lender-approval or affordability assessment is made.'
 ]};
}
export const cardMinimumCalculator=tool('credit-card-minimum-payment',[{id:'minimum',title:'Minimum Payment & Payoff Cost',description:'Estimate a first minimum payment, the changing monthly schedule and the cost of paying only the minimum versus adding extra.',formula:'Interest = opening balance × APR / 12. Minimum = min(balance + interest, max(dollar floor, opening balance × percentage + optional interest)). Payment = min(balance + interest, minimum + extra).',fields:[
 {...num('principal','Current credit card balance',5000,'$'),max:1e9},
 {...num('rate','Annual percentage rate (APR)',24,'%'),max:100},
 {...num('minimum','Minimum payment percentage',2,'%'),max:100,hint:'Applied to the opening balance each month. Check the rule in your card agreement.'},
 {...num('floor','Minimum dollar payment floor',25,'$'),max:1e9,hint:'The minimum is at least this amount, unless the total owed is smaller.'},
 {...select('interest_extra','Add monthly interest to the percentage amount?',['Yes','No'],'Yes'),hint:'Yes: percent of opening balance plus interest. No: percent of opening balance alone. The dollar floor applies to the combined minimum.'},
 {...num('extra','Extra above each monthly minimum',0,'$'),max:1e9,hint:'A fixed extra amount on top of the changing minimum, not a fixed total payment.'}
 ],calculate:cardMinimumResult}], 'Use this free credit card minimum payment calculator to estimate the first payment, payoff time and interest. Compare minimum-only payments with paying a little extra each month.');
