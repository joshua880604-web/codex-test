import {tool} from './helpers';
import {fireCalculator,fireProjection} from './fire';
import {num,money,number as read,type Field,type Values,type Result} from '../types';

export const leanExpenses=[
  ['housing','Housing',1200],['food','Food and household essentials',400],
  ['utilities','Utilities and communications',200],['transport','Transport',200],
  ['health','Healthcare and insurance',300],['essentials','Other essential spending',200],
] as const;
export const fatExtras=[
  ['travel','Annual travel and experiences',18000],['housing_extra','Annual housing upgrades',12000],
  ['family','Annual family support',12000],['lifestyle','Annual leisure and lifestyle extras',12000],
  ['health_extra','Annual additional healthcare provision',6000],
] as const;
export type FireBudgetKind='lean-fire'|'fat-fire';
export function fireBudget(kind:FireBudgetKind,v:Values){
  const entries=kind==='lean-fire'?leanExpenses.map(([key,label])=>({label,annual:read(v,key)*12})): [{label:'Core living costs',annual:read(v,'core')*12},...fatExtras.map(([key,label])=>({label,annual:read(v,key)}))];
  entries.push({label:kind==='lean-fire'?'Irregular annual spending provision':'Other recurring annual provision',annual:read(v,'annual_extra')},{label:'Entered annual tax allowance',annual:read(v,'tax_allowance')});
  if(entries.some(e=>e.annual<0))throw new Error('Budget amounts cannot be negative.');
  const base=entries.reduce((total,e)=>total+e.annual,0),buffer=read(v,'buffer');
  if(buffer<0||buffer>100)throw new Error('Use a spending buffer from 0% to 100%.');
  const annual=base*(1+buffer/100);
  if(!Number.isFinite(annual)||annual<=0)throw new Error('Enter a positive annual portfolio-funded budget within the supported range.');
  return {entries,base,buffer,annual};
}
export function budgetFireProjection(kind:FireBudgetKind,v:Values):Result{
  const budget=fireBudget(kind,v),result=fireProjection({...v,spending:String(budget.annual)});
  const withdrawal=read(v,'withdrawal')/100,delta=kind==='lean-fire'?100:1000;
  const comparisons=[-delta,0,delta].flatMap(change=>{
    const annual=(budget.base+change*12)*(1+budget.buffer/100);
    return annual>0&&Number.isFinite(annual/withdrawal)?[[change,annual,annual/withdrawal]]:[];
  });
  return {...result,metrics:[...result.metrics,money('Annual portfolio-funded budget',budget.annual),money('Monthly equivalent retirement budget',budget.annual/12),money('Annual spending buffer',budget.annual-budget.base)],
    additionalTables:[
      {title:'Your annual retirement budget',columns:['Budget item','Annual amount (USD)'],rows:[...budget.entries.map(e=>[e.label,e.annual]),['Spending buffer',budget.annual-budget.base],['Total portfolio-funded budget',budget.annual]],note:'All amounts use today’s USD. Annual provisions are recurring budget allowances, not dated one-time expenses. The buffer applies to the whole entered budget, including the tax allowance. Do not count an item in two categories.'},
      {title:'How a budget change affects your FIRE number',columns:['Monthly change before buffer (USD)','Annual budget with buffer (USD)','FIRE target (USD)'],rows:comparisons,note:`Compares a recurring monthly budget change of ${delta.toLocaleString('en-US')} USD below and above your input before applying the same buffer. Withdrawal assumption stays fixed. This changes target size only; it does not calculate alternative target ages or model changes in your saving capacity. Nonpositive budgets and unsupported results are omitted.`},
    ],notes:[
      kind==='lean-fire'?'Lean FIRE describes a lower-spending approach, not a universal dollar cutoff. The budget is only as complete as the housing, healthcare, taxes and irregular spending you include. A smaller target does not establish that the lifestyle or withdrawal policy is feasible.':'Fat FIRE describes a higher-spending retirement lifestyle, not a universal wealth threshold. Core costs and extra categories must not overlap. Travel, family support, healthcare and tax allowances are user estimates; the calculator does not price a lifestyle or calculate tax liabilities.',
      'The budget is funded entirely by this portfolio. Social Security, pensions, account access, benefit start dates and tax rules are not modeled. A later-starting benefit cannot simply be deducted from every year’s spending. Annual provisions smooth recurring costs; separately assess dated large purchases or one-time costs.',
      ...result.notes!,
    ]};
}
const shared=fireCalculator.modes[0].fields.filter(f=>f.key!=='spending');
const annualFields:Field[]=[
  {...num('annual_extra','Other recurring annual provision',1200,'$/year'),hint:'Recurring yearly allowance in today’s USD. Exclude costs already in other categories and separately plan dated one-time expenses.'},
  {...num('tax_allowance','Annual tax allowance funded by portfolio',0,'$/year'),hint:'Your own dollar estimate, not a tax-rate input or automatic tax calculation.'},
  {...num('buffer','Additional spending buffer',0,'%'),max:100,hint:'Adds this percentage to every entered budget category, including the tax allowance. It does not establish withdrawal safety.'},
];
function create(kind:FireBudgetKind){
  const lean=kind==='lean-fire',budgetFields:Field[]=lean?leanExpenses.map(([key,label,value])=>num(key,label,value,'$/month')):[
    {...num('core','Core household living costs',5000,'$/month'),hint:'Include baseline housing, food, transport, insurance and healthcare. Enter only additions to that baseline in the annual extra categories.'},
    ...fatExtras.map(([key,label,value])=>num(key,label,value,'$/year')),
  ];
  return tool(kind,[{id:'plan',title:lean?'Lean FIRE Budget and Target':'Fat FIRE Budget and Target',fields:[...shared.slice(0,3),...budgetFields,...annualFields.map(f=>f.key==='annual_extra'&&!lean?{...f,value:0}:f),...shared.slice(3)],
    description:lean?'Build a necessary-spending budget, include recurring annual provisions, and find a full financial-independence target.':'Build a core-plus-lifestyle retirement budget and find the full portfolio target and modeled time to reach it.',
    formula:'Annual budget = (monthly costs × 12 + annual provisions and tax allowance) × (1 + buffer). FIRE target = annual budget / withdrawal rate. Project monthly investing using exact inflation-adjusted growth until the first target crossing.',
    calculate:v=>budgetFireProjection(kind,v),
  }],lean?'Calculate your Lean FIRE number from essential monthly spending and annual provisions. See your target, funding gap and modeled age under editable assumptions.':'Calculate your Fat FIRE number from core living costs, lifestyle extras and an entered tax allowance. Compare budget choices and the modeled time to your full retirement target.');
}
export const leanFireCalculator=create('lean-fire');
export const fatFireCalculator=create('fat-fire');
