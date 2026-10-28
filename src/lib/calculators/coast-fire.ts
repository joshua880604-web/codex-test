import { tool } from './helpers';
import {num, money, metric, number as read, type Result, type Values} from '../types';

const finite=(value:number)=>{
 if(!Number.isFinite(value))throw new Error('These assumptions exceed the supported projection range. Check the return, inflation, budget and horizon.');
 return value;
};
const elapsed=(months:number)=>`${Math.floor(months/12)} years, ${months%12} months`;
/** All balances and recurring investments are in start-date purchasing power. */
export function coastFireProjection(v:Values):Result {
 const age=read(v,'age'),retire=read(v,'retire'),years=retire-age;
 if(!Number.isInteger(age)||!Number.isInteger(retire)||age<0||retire>120||years<=0)throw new Error('Use whole-number ages from 0 to 120, with retirement age above current age.');
 const months=years*12,initial=read(v,'balance'),spending=read(v,'spending'),withdrawal=read(v,'withdrawal')/100,contribution=read(v,'monthly');
 if(spending<=0)throw new Error('Annual retirement budget must be greater than zero.');
 if(withdrawal<=0||withdrawal>1)throw new Error('Assumed withdrawal rate must be greater than zero and no more than 100%.');
 const nominal=read(v,'return')/100,inflation=read(v,'inflation')/100;
 if(nominal<=-1||inflation<=-1)throw new Error('Return and inflation must be above -100%.');
 if(initial<0||contribution<0)throw new Error('Invested assets and monthly investments cannot be negative.');
 const logAnnual=Math.log1p(nominal)-Math.log1p(inflation),growth=Math.exp(logAnnual/12),real=Math.expm1(logAnnual),target=finite(spending/withdrawal);
 const threshold=(month:number)=>{
  const value=finite(target*Math.exp(-logAnnual*(months-month)/12));
  if(value<=0)throw new Error('These assumptions underflow the supported projection range.');
  return value;
 };
 const coast=threshold(0),noDeposits=finite(initial*Math.exp(logAnnual*years));
 let balance=initial,added=0,first:number|null=balance>=coast?0:null;
 const rows:(number|string)[][]=[];
 for(let month=1;month<=months;month++){
  // Deposit at month end only until the first modeled coast threshold is reached.
  const deposit=first===null?contribution:0;
  balance=finite(balance*growth+deposit);added=finite(added+deposit);
  const required=threshold(month);
  if(first===null&&balance>=required)first=month;
  if(month%12===0||month===months||month===first)rows.push([age+month/12,balance,required,added]);
 }
 const time=first===null?'Not reached by target age':first===0?'Now':first===months?'At target retirement age':elapsed(first);
 const status=first===0?'Meets modeled threshold now':first===null?'Not reached by target retirement age':first===months?'Reached only at retirement':'Below today; reaches threshold later';
 const returnRows=[-2,0,2].map(change=>read(v,'return')+change).filter(rate=>rate>-100&&rate<=1000).flatMap(rate=>{
  const log=Math.log1p(rate/100)-Math.log1p(inflation),required=target*Math.exp(-log*years);
  return Number.isFinite(required)&&required>0?[[rate,Math.expm1(log)*100,required,Math.max(0,required-initial)]]:[];
 });
 const ageRows=[retire-5,retire,retire+5].filter(endAge=>endAge>age&&endAge<=120).flatMap(endAge=>{
  const required=target*Math.exp(-logAnnual*(endAge-age));
  return Number.isFinite(required)&&required>0?[[endAge,endAge-age,required,Math.max(0,required-initial)]]:[];
 });
 return {metrics:[
  money('Coast FIRE number today',coast),
  {...metric('Modeled Coast status',first===0?1:first===null?0:first===months?2:3),displayValue:status},
  {...metric('Time until Coast FIRE',first===null?0:first/12),displayValue:time},
  {...metric('Age at Coast FIRE',first===null?0:age+first/12),displayValue:first===null?'Not reached by target age':first===0?`${age} years`:elapsed(age*12+first)},
  money('Full FIRE portfolio target',target),money('Current gap to Coast threshold',Math.max(0,coast-initial)),
  money('Retirement balance without new investments',noDeposits),money('Retirement shortfall without new investments',Math.max(0,target-noDeposits)),
  money('Retirement balance on modeled path',balance),money('New investments on modeled path',added),
  metric('Real annual return assumption',real*100,'percent'),
 ],columns:['Age','Balance','Coast threshold','Cumulative new investments'],rows,additionalTables:[
  {title:'Compare nominal return assumptions',columns:['Nominal return (%)','Real return (%)','Coast number today (USD)','Current gap (USD)'],rows:returnRows,note:'Changes only nominal annual return by two percentage points below and above your input. Budget, inflation, withdrawal rate and ages stay fixed. This compares today’s threshold, not your Coast age or a probability of success. Unsupported rates or numerical ranges are omitted. All money is in today’s USD.'},
  {title:'Compare target retirement ages',columns:['Target retirement age','Years remaining','Coast number today (USD)','Current gap (USD)'],rows:ageRows,note:'Changes only target retirement age by five years below and above your input. Current age, budget, inflation, return and withdrawal rate stay fixed. Only ages above your current age and at most 120 are shown; unsupported numerical ranges are omitted. This does not reprice healthcare, pension benefits or the withdrawal assumption. All money is in today’s USD.'},
 ],notes:[
  'Every monetary result, chart point and table amount is in today’s USD. Exact real growth = (1 + nominal return) / (1 + inflation) − 1. Do not inflate the retirement budget again. Returns are constant effective annual assumptions, not market forecasts.',
  'Monthly investments are constant in today’s purchasing power, which implies nominal increases with inflation. They are deposited at month end until the first whole month that the modeled Coast threshold is met; then deposits stop. Rows show that stop-and-coast path, or continued investing through the target age if the threshold is never reached.',
  first===0?'The entered portfolio meets the threshold under these assumptions now. Future monthly investments are not used on the modeled path. This is not proof that you can retire today.':first===null?'The entered monthly investment does not reach the threshold by the target retirement age under these assumptions. No Coast age is inferred beyond that horizon.':first===months?'The threshold is first met at the target retirement age, so no earlier contribution-free coast period remains.':'The modeled threshold is first reached after '+elapsed(first)+'. Deposits stop after that month; growth then continues to the target retirement age.',
  'Coasting does not fund living costs before retirement. Market volatility, sequence risk, account access, contribution limits, taxes, pensions and Social Security benefits are not modeled. Enter only assets set aside for this retirement portfolio; do not count a separately needed emergency fund or home equity as available investments.',
  'The withdrawal rate is an input used to size a portfolio target. This is not a retirement drawdown simulation or a guarantee that any withdrawal rate, including the illustrative 4%, is safe. Budget for any taxes and costs the portfolio must fund separately in your inputs.',
 ]};
}
export const coastFire=tool('coast-fire',[{id:'coast',title:'Coast FIRE Projection',fields:[
 {...num('age','Current age',35,'years'),max:119,step:1},
 {...num('retire','Target retirement age',65,'years',1),max:120,step:1},
 {...num('balance','Current invested retirement assets',150000,'$'),hint:'Today’s USD. Only this retirement portfolio; exclude separately needed emergency cash and uninvested home equity.'},
 {...num('spending','Annual retirement budget',40000,'$'),hint:'Today’s USD funded by this portfolio, including any taxes you budget. Other income is not calculated.'},
 {...num('return','Nominal annual return, after fees',7,'%',-99.99),max:1000,hint:'Constant effective annual assumption before inflation. Fees or investment tax drag are not deducted automatically.'},
 {...num('inflation','Annual inflation assumption',2.5,'%',-99.99),max:1000},
 {...num('withdrawal','Assumed annual withdrawal rate',4,'%'),max:100,hint:'Sizes the portfolio target; this is not a guaranteed safe withdrawal rate.'},
 {...num('monthly','Monthly investment before coasting',1000,'$'),hint:'Today’s USD, at month end. Stops on the modeled path once the threshold is reached; use zero for no new deposits.'},
],description:'Find today’s Coast FIRE threshold and the first modeled month you could stop adding to this retirement portfolio.',formula:'FIRE target = annual portfolio-funded budget / withdrawal rate; Coast threshold = target / real growth^years. Monthly contributions continue only until the first threshold crossing.',calculate:coastFireProjection}], 'Estimate your Coast FIRE number, when continued investing reaches it, and a contribution-free path to your target retirement age.');
