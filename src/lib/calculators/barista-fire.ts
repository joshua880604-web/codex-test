import {tool} from './helpers';
import {num,money,metric,number as read,type Values,type Result} from '../types';

const supported=(n:number)=>{if(!Number.isFinite(n)||Math.abs(n)>1e15)throw new Error('These inputs exceed the supported projection range. Reduce the amounts, rates or horizon.');return n;};
export function baristaPlan(v:Values):Result{
 const age=read(v,'age'),start=read(v,'start_age'),incomeEnd=read(v,'income_end'),retire=read(v,'retire_age');
 if([age,start,incomeEnd,retire].some(n=>!Number.isInteger(n)||n<18||n>100)||age>start||start>incomeEnd||incomeEnd>retire||start===retire)throw new Error('Use whole ages from 18 to 100: current age ≤ part-time start ≤ income stop ≤ full retirement. Full retirement must be later than part-time start.');
 const initial=read(v,'balance'),monthly=read(v,'monthly'),spending=read(v,'spending'),income=read(v,'income'),fullSpending=read(v,'full_spending'),rate=read(v,'return')/100,inflation=read(v,'inflation')/100,withdrawal=read(v,'withdrawal')/100;
 if([initial,monthly,income].some(n=>n<0||n>1e12)||spending<=0||spending>1e12||fullSpending<=0||fullSpending>1e12)throw new Error('Use nonnegative assets, contributions and income, and positive spending amounts, no greater than one trillion USD.');
 if(rate<=-1||rate>1||inflation<=-1||inflation>1||withdrawal<=0||withdrawal>0.1)throw new Error('Return and inflation must be greater than -100% and no more than 100%. Use a positive withdrawal assumption no greater than 10%.');
 const log=Math.log1p(rate)-Math.log1p(inflation),growth=Math.exp(log/12),real=Math.expm1(log),savingMonths=(start-age)*12,bridgeMonths=(retire-start)*12,incomeMonths=(incomeEnd-start)*12,target=supported(fullSpending/withdrawal);
 const gap=(m:number,earned:number)=>Math.max(0,spending-(m<incomeMonths?earned:0))/12;
 // Backward cash-flow valuation: fund every end-month gap and leave the full target.
 function needed(earned:number){let b=target;for(let m=bridgeMonths-1;m>=0;m--)b=supported((b+gap(m,earned))/growth);return b;}
 const required=needed(income);
 let b=initial,added=0,drawn=0,unfunded=0,earnedUsed=0,yearGrowth=0,yearAdded=0,yearDrawn=0,yearUnfunded=0,yearIncome=0;
 const rows:(number|string)[][]=[];
 let opening=initial,startBalance=initial;
 for(let m=0;m<savingMonths+bridgeMonths;m++){
  const accumulating=m<savingMonths,bridge=m-savingMonths,gain=supported(b*(growth-1));
  b=supported(b+gain);yearGrowth+=gain;
  if(accumulating){b=supported(b+monthly);added+=monthly;yearAdded+=monthly;}
  else {
   const used=bridge<incomeMonths?Math.min(spending,income)/12:0,requested=gap(bridge,income),paid=Math.min(b,requested),missing=requested-paid;
   b=Math.max(0,b-paid);drawn+=paid;unfunded+=missing;earnedUsed+=used;yearIncome+=used;yearDrawn+=paid;yearUnfunded+=missing;
  }
  if(m+1===savingMonths)startBalance=b;
  if((m+1)%12===0){rows.push([age+(m+1)/12,accumulating?'Accumulation':bridge<incomeMonths?'Part-time income + portfolio':'Portfolio bridge (income stopped)',opening,yearAdded,yearIncome,yearGrowth,yearDrawn,yearUnfunded,b]);opening=b;yearGrowth=yearAdded=yearIncome=yearDrawn=yearUnfunded=0;}
 }
 const shortfall=Math.max(0,required-startBalance),funded=unfunded<0.005&&b>=target-0.005;
 return {metrics:[money('Required portfolio at part-time start',required),money('Projected portfolio at part-time start',startBalance),money('Shortfall at part-time start',shortfall),{...metric('Modeled plan status',funded?1:0),displayValue:funded?'Meets entered bridge and terminal target':'Falls short under entered assumptions'},money('Full retirement portfolio target',target),money('Projected portfolio at full retirement',b),money('Full retirement target shortfall',Math.max(0,target-b)),money('Unfunded bridge spending',unfunded),money('Initial annual portfolio-funded spending',spending-Math.min(spending,incomeMonths>0?income:0)),money('New investments before part-time start',added),money('Total bridge portfolio withdrawals',drawn),money('Part-time income used for spending',earnedUsed),metric('Real annual return assumption',real*100,'percent')],
 columns:['Age','Phase ending','Opening portfolio (today’s USD)','New investments (today’s USD)','Earned income used (today’s USD)','Real growth (today’s USD)','Portfolio withdrawal (today’s USD)','Unfunded spending (today’s USD)','Closing portfolio (today’s USD)'],rows,
 additionalTables:[{title:'How part-time income changes your required portfolio',columns:['Annual after-tax part-time income (today’s USD)','Required portfolio at part-time start (today’s USD)'],rows:[...new Set([0,income,Math.min(1e12,income+6000)])].sort((a,b)=>a-b).map(n=>[n,needed(n)]),note:'Same spending, ages, real return and terminal target. Income stops at your entered income-stop age. Income above the spending budget is not invested. These are scenarios, not job or earnings forecasts.'}],
 notes:[
 'All dollar amounts are in today’s USD. Real annual return = (1 + nominal return after fees) / (1 + inflation) − 1; monthly growth is its exact twelfth root. Spending, earnings and contributions stay constant in purchasing power, so their nominal amounts would rise with inflation.',
 'Accumulation: opening assets grow each month, then the entered investment is added at month end. Contributions stop at the part-time start age, even if your projected portfolio is below the required amount. The tool does not search for an alternative transition age.',
 'Bridge: part-time income covers spending until the income-stop birthday. The portfolio pays any remaining budget at month end. After income stops, it funds the entire bridge budget until the full-retirement birthday. Excess earnings are not reinvested. Healthcare, insurance and taxes must be included in your spending allowance; income must be after tax.',
 'The required starting portfolio discounts every monthly bridge gap and the terminal full-retirement target. It is not simply (spending − part-time income) / withdrawal rate: that shortcut assumes the income continues indefinitely.',
 'At full retirement, the model checks the portfolio against annual full-retirement spending / withdrawal assumption. It stops there; it does not simulate later retirement withdrawals, longevity or a safe withdrawal rate. A funded constant-return path is not a probability or guarantee.',
 'Withdrawals are capped at available assets; unpaid living costs appear as unfunded spending, never as borrowing or a negative portfolio. Market volatility, sequence risk, changing income, Social Security, pensions, tax brackets, account access before age 59½ and investment eligibility are not modeled. For estimates only, not financial advice.',
 ]};
}
export const baristaFireCalculator=tool('barista-fire',[{id:'plan',title:'Part-Time Work to Full Retirement',description:'Model a dated transition from saving to part-time earnings and portfolio withdrawals, then check a full-retirement target.',formula:'Full target = annual full-retirement budget / withdrawal assumption. Working backward from that target: required assets this month = (required assets next month + end-month spending gap) / monthly real growth. Compare with projected assets at the part-time start.',fields:[
 {...num('age','Current age',35,'years',18),max:100,step:1},
 {...num('start_age','Part-time start age',45,'years',18),max:99,step:1,hint:'Investments stop at this birthday. Can equal your current age.'},
 {...num('income_end','Part-time income stops at age',60,'years',18),max:100,step:1,hint:'No earnings are counted from this birthday onward.'},
 {...num('retire_age','Full retirement target age',65,'years',19),max:100,step:1,hint:'Projection ends here and checks your full portfolio target.'},
 {...num('balance','Current invested assets',150000,'$'),hint:'Today’s USD. Exclude emergency cash and home equity unavailable for spending.'},
 {...num('monthly','Monthly investment before part-time work',1500,'$/month'),hint:'Month-end investments in today’s purchasing power; zero after the part-time start.'},
 {...num('spending','Annual spending during the bridge',40000,'$/year',0.01),hint:'Include housing, healthcare, insurance and an allowance for taxes, in today’s USD.'},
 {...num('income','Annual after-tax part-time income',24000,'$/year'),hint:'Only counted between start and income-stop ages. Surplus above spending is not invested.'},
 {...num('full_spending','Annual spending in full retirement',40000,'$/year',0.01),hint:'Budget funded entirely by the portfolio, including an entered tax allowance. No automatic benefits.'},
 {...num('return','Nominal annual return, after fees',7,'%',-99.99),max:100},
 {...num('inflation','Annual inflation assumption',2.5,'%',-99.99),max:100},
 {...num('withdrawal','Full retirement withdrawal assumption',4,'%',0.01),max:10,hint:'Sizes the terminal target only. No withdrawal rate is guaranteed safe.'},
 ],calculate:baristaPlan}],'Use this free Barista FIRE calculator to estimate the portfolio needed for part-time work, bridge spending gaps and a later full retirement, with inflation-adjusted results.');
