import {tool} from './helpers';
import {payment} from '../finance';
import {num,money,metric,number as read,type Values,type Result} from '../types';

const dollars=(v:Values,key:string)=>{const x=read(v,key);if(x<0||x>1e9)throw new Error('Use nonnegative dollar amounts no greater than one billion USD.');return x;};
const months=(v:Values,key:string)=>{const years=read(v,key),n=Math.round(years*12);if(n<1||n>600||Math.abs(years*12-n)>1e-8)throw new Error('Loan term and comparison horizon must be 1–600 whole months, entered in years.');return n;};
const finite=(x:number)=>{if(!Number.isFinite(x)||Math.abs(x)>1e15)throw new Error('Projection exceeds the supported range. Reduce amounts, return or comparison horizon.');return x;};
export function mortgageInvestPlan(v:Values):Result{
 const principal=dollars(v,'principal'),lump=dollars(v,'lump'),extra=dollars(v,'extra'),term=months(v,'term'),horizon=months(v,'horizon'),rate=read(v,'rate')/100,investment=read(v,'return')/100;
 if(rate<0||rate>.25)throw new Error('Use a nominal mortgage rate from 0% to 25%.');
 if(investment<=-1||investment>.5)throw new Error('Use an effective investment return greater than -100% and no more than 50%.');
 const scheduled=principal>0?payment(principal,rate/12,term):0,budget=scheduled+extra,upfront=Math.min(lump,principal),equalGrowth=Math.expm1(12*Math.log1p(rate/12));
 function simulate(annual:number,withRows=false){
  const growth=Math.exp(Math.log1p(annual)/12);
  const paydown={loan:Math.max(0,principal-lump),portfolio:Math.max(0,lump-principal),interest:0,paid:upfront,invested:Math.max(0,lump-principal),payoff:principal<=lump?0:null as number|null};
  const invest={loan:principal,portfolio:lump,interest:0,paid:0,invested:lump,payoff:principal===0?0:null as number|null};
  const rows:(number|string)[][]=[];
  for(let month=1;month<=horizon;month++){
   for(const [state,loanBudget] of [[paydown,budget],[invest,scheduled]] as const){
    state.portfolio=finite(state.portfolio*growth);
    const interest=state.loan*rate/12,owed=state.loan+interest;
    let paid=Math.min(owed,loanBudget),remaining=Math.max(0,owed-paid);
    // Only remove sub-microcent binary residue, not a real unpaid installment.
    if(remaining>0&&remaining<1e-8){paid+=remaining;remaining=0;}
    const deposit=Math.max(0,budget-paid);
    state.loan=remaining;state.portfolio=finite(state.portfolio+deposit);state.interest+=interest;state.paid+=paid;state.invested+=deposit;
    if(state.payoff===null&&remaining===0)state.payoff=month;
   }
   if(withRows){const p=paydown.portfolio-paydown.loan,i=invest.portfolio-invest.loan;rows.push([month,paydown.portfolio,paydown.loan,p,invest.portfolio,invest.loan,i,i-p,paydown.interest,invest.interest]);}
  }
  const paydownPosition=paydown.portfolio-paydown.loan,investPosition=invest.portfolio-invest.loan,advantage=investPosition-paydownPosition;
  return {paydown,invest,paydownPosition,investPosition,advantage,rows};
 }
 const result=simulate(investment,true),outcome=Math.abs(result.advantage)<.005?'Equal within one cent under these assumptions':result.advantage>0?'Invest-first is higher under these assumptions':'Paydown-first is higher under these assumptions';
 const payoff=(label:string,m:number|null)=>({...metric(label,m??0),displayValue:m===null?'Not paid off by comparison horizon':m===0?'Now':`${Math.floor(m/12)} years, ${m%12} months`});
 const returns=[...new Set([0,Math.max(-.9999,investment-.02),investment,Math.min(.5,investment+.02),equalGrowth])].sort((a,b)=>a-b);
 const sensitivity=returns.flatMap(r=>{try{const s=simulate(r);return [[r*100,s.paydown.portfolio,s.paydown.loan,s.paydownPosition,s.invest.portfolio,s.invest.loan,s.investPosition,s.advantage]];}catch(error){if(error instanceof Error&&error.message.startsWith('Projection exceeds'))return [];throw error;}});
 return {metrics:[money('Invest-first advantage at horizon',result.advantage),money('Paydown-first investments minus mortgage',result.paydownPosition),money('Invest-first investments minus mortgage',result.investPosition),{...metric('Modeled comparison',Math.abs(result.advantage)<.005?0:result.advantage>0?1:-1),displayValue:outcome},money('Scheduled monthly principal and interest',scheduled),money('Same total monthly cash budget',budget),money('Paydown-first investment account',result.paydown.portfolio),money('Invest-first investment account',result.invest.portfolio),money('Paydown-first mortgage remaining',result.paydown.loan),money('Invest-first mortgage remaining',result.invest.loan),money('Paydown-first interest paid within horizon',result.paydown.interest),money('Invest-first interest paid within horizon',result.invest.interest),money('Interest avoided within horizon',result.invest.interest-result.paydown.interest),payoff('Paydown-first loan payoff within horizon',result.paydown.payoff),payoff('Invest-first loan payoff within horizon',result.invest.payoff),money('Upfront principal paid in paydown-first path',upfront),money('Paydown-first total investment deposits',result.paydown.invested),money('Invest-first total investment deposits',result.invest.invested),metric('Equal-growth annual investment reference',equalGrowth*100,'percent'),metric('Comparison length in months',horizon)],
 columns:['Month','Paydown-path investments','Paydown-path mortgage','Paydown-path position','Invest-path investments','Invest-path mortgage','Invest-path position','Invest-first advantage','Paydown cumulative interest','Invest cumulative interest'],rows:result.rows,
 additionalTables:[{title:'Same horizon, different investment return assumptions',columns:['Effective annual investment return (%)','Paydown-first investment account (USD)','Paydown-first mortgage remaining (USD)','Paydown-first position (USD)','Invest-first investment account (USD)','Invest-first mortgage remaining (USD)','Invest-first position (USD)','Invest-first advantage (USD)'],rows:sensitivity,note:'Scenarios exceeding the supported numeric range are omitted. Zero return, your return, two percentage points below/above it (within supported bounds), and the mortgage monthly-growth equivalent. Same initial cash, loan, monthly budget and horizon in every scenario. Positive advantage favors invest-first within this model, not a recommendation.'}],
 notes:[
 'Both paths use the same initial lump sum and the same end-month cash budget: scheduled mortgage principal and interest plus the entered extra amount. All results are nominal USD; the budget and assumed rates remain fixed. Existing unrelated assets and emergency reserves are excluded.',
 'The scheduled P&I is computed once from your starting balance, nominal annual mortgage rate / 12 and entered remaining term. Paydown-first applies available initial cash to principal immediately, keeps that scheduled payment unchanged, then adds the monthly extra. This is not a recast. Cash above the initial loan balance is invested immediately.',
 'Invest-first invests the initial cash immediately, makes the scheduled mortgage payment and invests the monthly extra. In either path, any cash budget left after an actual loan payment is invested at month end, including the unused portion of the final payment and all freed payments after payoff.',
 'Investment growth occurs before month-end deposits. The entered investment return is an effective annual assumption after fees and your chosen allowance for investment tax drag; monthly growth is its exact twelfth root. It is not a market forecast or a computed tax bill. Mortgage interest uses a nominal monthly convention, so equal displayed annual percentages need not imply equal monthly growth.',
 'Positions compare investment account minus remaining mortgage. The same home value and other common assets cancel and are not included; a negative displayed position does not mean your entire household net worth is negative. The investment account is shown separately from illiquid equity released by paying down debt.',
 'The equal-growth reference is (1 + nominal mortgage rate / 12)^12 − 1. Under these constant-rate, no-tax-deduction and no-fee assumptions, matching that monthly growth makes the two positions equal. It is not a universal required market return or a risk-adjusted break-even rate.',
 'No mortgage-interest deduction, investment account withdrawal tax, capital-gains realization, prepayment penalty, escrow, PMI cancellation, refinancing, market volatility, sequence risk, future budget changes or inflation adjustment is modeled. Property tax, insurance and other unchanged home costs are outside both paths. Verify loan terms and preserve needed liquidity before using cash.',
 'Interest avoided and payoff dates refer only to the selected comparison horizon. If a loan is not paid off by that date, no later payoff date or lifetime saving is inferred. Higher modeled wealth under a chosen constant return is not advice to invest or prepay; actual investment losses and access restrictions can change the decision.',
 ]};
}
export const mortgageInvestCalculator=tool('mortgage-vs-invest',[{id:'compare',title:'Pay Down First vs. Invest First',description:'Compare equal initial cash and equal monthly budgets, including investing the payments freed after mortgage payoff.',formula:'Monthly budget = original scheduled P&I + extra. Each month: grow investments, charge mortgage interest, make the capped loan payment and invest the rest of the same budget. Compare investment account − remaining mortgage at the same horizon.',fields:[
 {...num('principal','Current mortgage principal balance',300000,'$'),max:1e9,hint:'Remaining principal only. Exclude escrow and unrelated debts.'},
 {...num('rate','Nominal annual mortgage interest rate',5.5,'%'),max:25},
 {...num('term','Remaining amortization term',25,'years',1/12),max:50,hint:'Used to compute the unchanged scheduled P&I. Enter a whole number of months as years, e.g. 10.5 for 126 months.'},
 {...num('lump','Initial cash available for either path',10000,'$'),max:1e9,hint:'Pay principal now or invest now. Exclude cash you need for emergencies. Any amount above the loan is invested.'},
 {...num('extra','Extra monthly cash beyond scheduled P&I',500,'$/month'),max:1e9,hint:'Extra principal in paydown-first, invested in invest-first. Both paths invest the full freed budget after payoff.'},
 {...num('horizon','Comparison horizon',10,'years',1/12),max:50,hint:'May be shorter or longer than the remaining loan term. Both paths stop on this same date.'},
 {...num('return','Effective annual investment return assumption',6,'%',-99.99),max:50,hint:'After fees and your assumed tax drag. A constant hypothetical return, not a forecast or guaranteed yield.'},
 ],calculate:mortgageInvestPlan}],'Use this pay off mortgage vs. invest calculator to compare the same initial cash, monthly budget and horizon. Include freed mortgage payments and test different investment return assumptions.');
