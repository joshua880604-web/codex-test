import {tool} from './helpers';
import {debtSchedule,type Debt} from '../debt-repayment';
import {area,num,select,money,metric,number as read,type Values,type Result} from '../types';
export type DebtStrategy='snowball'|'avalanche';
export function strategyDebts(raw:string):Debt[]{
  const lines=raw.split(/\r?\n/).filter(line=>line.trim());
  if(!lines.length||lines.length>20)throw new Error('Enter between 1 and 20 debts.');
  const names=new Set<string>();
  return lines.map(line=>{
    const parts=line.split(',').map(p=>p.trim());
    if(parts.length!==4||parts.some(p=>!p))throw new Error('Each debt needs a name, balance, minimum monthly payment and APR.');
    const [name,...amounts]=parts,numbers=amounts.map(Number);
    if(name.length>80||names.has(name.toLowerCase()))throw new Error('Use a unique debt nickname of at most 80 characters.');
    names.add(name.toLowerCase());
    if(numbers.some(n=>!Number.isFinite(n)||n<0||n>1e12)||numbers[2]>1000||(numbers[0]>0&&numbers[0]<.01))throw new Error('Use nonnegative finite amounts and APR from 0% to 1,000%.');
    return {name,balance:numbers[0],minimum:numbers[1],rate:numbers[2]/1200};
  });
}
const amount=(result:Result,label:string)=>result.metrics.find(m=>m.label===label)!.value;
export function strategyProjection(strategy:DebtStrategy,v:Values):Result{
  const debts=strategyDebts(v.debts).filter(d=>d.balance>0),budget=read(v,'budget'),once=read(v,'once'),onceMonth=read(v,'once_month');
  if(budget<0||once<0||!Number.isInteger(onceMonth)||onceMonth<1||onceMonth>1200)throw new Error('Use nonnegative payments and a whole-number one-time payment month from 1 to 1,200.');
  if(!['Yes','No'].includes(v.rollover))throw new Error('Choose whether to keep the monthly budget fixed.');
  const minimums=debts.reduce((s,d)=>s+d.minimum,0),rollover=v.rollover==='Yes';
  if(budget<minimums)throw new Error('Total monthly budget must cover all entered minimum payments.');
  const run=(method:DebtStrategy)=>{
    const r=debtSchedule(debts,budget,rollover,0,0,once,onceMonth,method,1200);
    if(r.rows!.length>1200)throw new Error('The plan does not repay within the supported 1,200-month horizon.');
    return r;
  };
  const result=run(strategy),rows=result.rows!,interest=debts.map(()=>0),closed=debts.map(()=>0),previous=debts.map(d=>d.balance);
  for(const row of rows)for(let i=0;i<debts.length;i++){
    if(previous[i]>1e-7)interest[i]+=previous[i]*debts[i].rate;
    const balance=Number(row[4+i]);if(!closed[i]&&previous[i]>1e-7&&balance<=1e-7)closed[i]=Number(row[0]);previous[i]=balance;
  }
  const milestones=debts.map((d,i)=>({d,month:closed[i],interest:interest[i],index:i})).sort((a,b)=>a.month-b.month||a.index-b.index);
  const firstCandidates=debts.map(d=>({...d,balance:Math.max(0,d.balance*(1+d.rate)-d.minimum)})).filter(d=>d.balance>1e-7).sort((a,b)=>strategy==='snowball'?a.balance-b.balance||b.rate-a.rate:b.rate-a.rate);
  const firstPaid=debts.reduce((s,d)=>s+Math.min(d.minimum,d.balance*(1+d.rate)),0);
  const target=budget+(onceMonth===1?once:0)-firstPaid>1e-7?firstCandidates[0]?.name:undefined;
  const other:DebtStrategy=strategy==='snowball'?'avalanche':'snowball';
  let comparison:(number|string)[],comparisonNote='';
  try{const alt=run(other);comparison=[other==='snowball'?'Snowball':'Avalanche',amount(alt,'Months until debt-free'),amount(alt,'Total interest'),amount(alt,'Total paid')];}
  catch(error){comparison=[other==='snowball'?'Snowball':'Avalanche','Unavailable','Unavailable','Unavailable'];comparisonNote=' Alternative plan unavailable: '+(error instanceof Error?error.message:'Unsupported inputs.');}
  return {...result,metrics:[...result.metrics,
    {...metric('First debt cleared in month',milestones[0]?.month??0),displayValue:milestones.length?String(milestones[0].month):'No outstanding debts'},
    {...metric('First target for extra payment',0),displayValue:target??(debts.length?'No extra target in month 1':'No outstanding debts')},
    money('Starting total debt',debts.reduce((sum,debt)=>sum+debt.balance,0)),money('Entered minimum payments per month',minimums),money('Extra monthly budget above minimums',budget-minimums),
  ],additionalTables:[
    {title:'Debt payoff milestones',columns:['Debt','Starting balance (USD)','APR (%)','Month cleared','Modeled interest (USD)'],rows:milestones.map(({d,month,interest})=>[d.name,d.balance,d.rate*1200,month,interest]),note:'Sorted by actual modeled clearance month, not simply the initial priority order. A debt may clear through minimum payments before the extra-payment target. Zero starting balances are excluded.'},
    {title:'Snowball and avalanche with the same starting budget',columns:['Strategy','Months to debt-free','Interest (USD)','Total paid (USD)'],rows:[[strategy==='snowball'?'Snowball':'Avalanche',amount(result,'Months until debt-free'),amount(result,'Total interest'),amount(result,'Total paid')],comparison],note:'Both plans use identical entered debts, monthly budget, one-time payment and rollover policy. This comparison does not model motivation or guarantee actual lender costs.'+(rollover?' Both keep the total monthly budget fixed until the final capped payment.':' With rollover off, future budgets can differ because the methods clear accounts in different months; this is not a pure payment-order comparison.')+comparisonNote},
  ],notes:[
    strategy==='snowball'?'Snowball applies minimums first, then ranks the remaining balances from smallest to largest after this month’s interest and minimum payments. Equal balances use the higher APR first; remaining ties keep the entered order.':'Avalanche applies minimums first, then directs extra money to remaining balances in descending APR order. Equal APRs keep the entered order.',
    'Interest accrues monthly at entered APR / 12 on each opening balance. APRs and entered dollar minimums remain fixed, except the final payment is capped at the amount owed. Actual lenders may use daily balances, changing minimums, promotional rates, fees or different allocation rules. All amounts are USD.',
    rollover?'The total monthly budget stays fixed after an account clears. Its freed payment remains available to other debts; the final overall payment can be smaller.':'After an account clears, its entered minimum is removed from future budgets. The original extra above minimums remains. This reduced-budget plan differs from rolling every freed payment forward.',
    'The one-time payment is additional to the monthly budget in the selected month. Money entered for after the payoff month is not used. Amounts retain full internal precision and are displayed rounded; the CSV retains calculated values.',
    'This is a payoff plan for up to 20 debts and 1,200 monthly periods, not a debt settlement, eligibility or credit-score model. It assumes no new borrowing, fees or changing terms. If you cannot meet minimums, choosing a payment order does not fix the budget shortfall. Reconcile the plan against current statements.',
    ...(debts.length?[]:['All entered balances are zero. There is no outstanding debt to project.']),
  ]};
}
const fields=[
  area('debts','Debts','Card A, 5000, 150, 22\nCard B, 3000, 100, 18','Use one unique nickname per debt. Enter balance, minimum monthly payment and APR; no account numbers are needed.'),
  {...num('budget','Total monthly debt payment budget',400,'$'),hint:'Includes every minimum payment plus your extra repayment. Do not add the minimums again.'},
  {...select('rollover','Keep monthly budget fixed after payoffs?',['Yes','No'],'Yes'),hint:'Yes rolls freed minimum payments into the next target. No reduces future budgets by each paid-off account’s minimum.'},
  {...num('once','Additional one-time payment',0,'$'),hint:'Optional amount above the monthly budget in the selected month. Use zero for none.'},
  {...num('once_month','One-time payment month',1,'month',1),step:1,max:1200,hint:'Month 1 is the first modeled payment month; not a calendar date.'},
];
function create(strategy:DebtStrategy){return tool('debt-'+strategy,[{id:strategy,title:strategy==='snowball'?'Smallest-Balance-First Plan':'Highest-APR-First Plan',fields,description:strategy==='snowball'?'Pay every minimum, then direct extra money to the smallest remaining balance and track each clearance.':'Pay every minimum, then direct extra money to the highest APR and track interest and clearance milestones.',formula:'Monthly interest = opening debt balance × APR / 12. Pay each minimum, then apply remaining budget in the selected priority order; cap payments at the amount owed.',calculate:v=>strategyProjection(strategy,v)}],strategy==='snowball'?'Build a debt snowball plan with individual balances, a total monthly budget and payoff milestones. Compare the same inputs with the avalanche method.':'Build a debt avalanche plan that targets the highest APR after minimums. Review your payoff timeline, modeled interest and a same-budget snowball comparison.');}
export const debtSnowball=create('snowball');export const debtAvalanche=create('avalanche');
