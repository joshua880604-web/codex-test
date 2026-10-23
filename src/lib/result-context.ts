import type {Result,Values} from './types';
import {formatMetric} from './sharing';

// Interpret only known metric contracts; never infer meaning from result position.
export function resultContext(id:string,mode:string,values:Values,result:Result):string|null {
 const metric=(label:string)=>result.metrics.find(m=>m.label===label);
 const text=(label:string)=>{const m=metric(label);return m?formatMetric(m):null;};
 if(id==='markup'&&text('Profit margin'))return `Markup is ${text('Markup on cost')} of cost; profit margin is ${text('Profit margin')} of selling price. They describe the same gross profit using different denominators.`;
 if(id==='cagr'&&text('Compound annual growth rate'))return `The endpoint values imply ${text('Compound annual growth rate')} annual compound growth. This smooths the full period into one rate and excludes any intermediate deposits or withdrawals.`;
 if(id==='emergency-fund'&&mode==='goal'&&text('Remaining savings gap'))return `Your selected reserve target is ${text('Emergency fund target')}. The remaining gap is ${text('Remaining savings gap')}; the reserve duration is your planning choice.`;
 if(id==='emergency-fund'&&mode==='plan'&&text('Months to reach target'))return `At the entered deposit amount, the target takes ${text('Months to reach target')} whole monthly deposits. The final deposit is capped at the remaining gap; interest is not assumed.`;
 if(id==='break-even'&&text('Contribution margin per unit'))return `Each unit contributes ${text('Contribution margin per unit')} toward fixed costs and then profit. The required unit count rounds upward to cover the selected cost and profit target.`;
 if(id==='investment-fee')return values.basis==='After fund fees'?'Your entered return is already net of fund fees, so the expense ratio is not deducted again. Any separate advisor fee still applies.':'Modeled fees paid are direct deductions. The balance reduction also includes lost growth, so these amounts should not be added together.';
 if(id==='real-return'&&mode==='rate'&&text('Real annual return'))return `The exact inflation-adjusted annual return is ${text('Real annual return')}. A negative real return means purchasing power falls, even if the nominal return is positive.`;
 if(id==='mortgage'&&mode==='monthly'&&text('Initial monthly total')&&text('Monthly principal & interest'))
  return `Your initial modeled monthly outlay is ${text('Initial monthly total')}, including the entered ownership costs and extra principal. The principal-and-interest payment alone is ${text('Monthly principal & interest')}; ownership costs may change later.`;
 if(id==='loan'&&mode==='amortized'&&text('Payment per period')&&text('Total interest')&&values.pay)
  return `The payment is ${text('Payment per period')} with payments made ${values.pay.toLowerCase()}. Total modeled interest is ${text('Total interest')}; fees, taxes and insurance are not included.`;
 if(['compound-interest','investment','interest','savings'].includes(id)&&text('Ending balance')&&text('Total contributions')&&text('Net investment earnings')){
  const earnings=metric('Net investment earnings')!;
  return `The ending balance includes ${text('Total contributions')} of your own money (starting amount plus deposits). Net investment ${earnings.value<0?'loss':'earnings'} ${earnings.value<0?'is':'are'} ${text('Net investment earnings')}, after the entered tax on interest. These are modeled amounts, not guaranteed returns.`;
 }
 if(id==='retirement'&&mode==='required'&&metric('Projected surplus / shortfall')){
  const gap=metric('Projected surplus / shortfall')!;
  const absolute=formatMetric({...gap,value:Math.abs(gap.value)});
  return Math.abs(gap.value)<.005?'Your projected savings match the modeled retirement target under the entered assumptions. This does not guarantee that savings will last.':`Your projected savings are ${absolute} ${gap.value<0?'below':'above'} the modeled retirement target. The target depends on your income needs, lifespan, return and inflation assumptions.`;
 }
 if(id==='retirement'&&mode==='saving'&&text('Required monthly saving'))
  return `The monthly plan requires ${text('Required monthly saving')} deposited at each month end. The year-end annual saving listed is an alternative plan; do not add both amounts together.`;
 if(id==='income-tax'&&mode==='federal'&&text('Estimated federal income tax')){
  const refund=text('Estimated refund'),owed=text('Estimated amount owed');
  return `For tax year ${values.year}, estimated federal income tax is ${text('Estimated federal income tax')}.${refund?` Entered withholding and estimated payments exceed that estimate by ${refund}.`:owed?` After entered withholding and estimated payments, ${owed} remains owed.`:''} This federal estimate does not include state/local income tax and is not a complete take-home-pay calculation.`;
 }
 return null;
}

export function inputHint(id:string,mode:string,key:string):string|undefined {
 const hints:Record<string,Record<string,string>>={
  'loan:amortized':{rate:'Enter the annual nominal interest rate, not a lender APR that includes fees.',compound:'How often interest compounds. This can differ from how often you make payments.',pay:'How often you pay. The result is a payment for this frequency.'},
  'compound-interest:growth':{rate:'Annual nominal rate; the compounding selection determines the effective yield.',annual:'An additional yearly deposit, separate from the monthly contribution.',timing:'Beginning deposits earn interest during the deposit period; end deposits start earning afterward.',tax:'Modeled tax on positive interest, charged at each year end. This is not a full investment tax model.'},
  'retirement:required':{other:'Monthly income at retirement, not annual income. This model assumes it rises with inflation afterward.',replacement:'Use the unit selected below: a percentage of projected final income or dollars per year at retirement.',saving:'Use the savings unit selected below. This contributes to the projected balance, not the target balance.'},
  'retirement:saving':{target:'Desired account balance at retirement, in future dollars.',return:'Effective annual return. Monthly growth is converted from this annual rate.'},
  'income-tax:federal':{year:'Use the year the income was earned; deduction and tax rules vary by tax year.',withheld:'Tax already paid through federal withholding. It reduces the amount owed or increases a refund; it does not reduce the tax liability itself.'},
 };
 return hints[id+':'+mode]?.[key];
}
