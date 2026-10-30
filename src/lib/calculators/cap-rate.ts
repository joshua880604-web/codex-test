import {tool} from './helpers';
import {noiCalculator,noiProjection} from './noi';
import {num,money,metric,number as read,type Values,type Result} from '../types';
const checked=(n:number)=>{if(!Number.isFinite(n)||Math.abs(n)>1e15)throw Error('The result exceeds the supported range. Reduce the amounts or review the target rate.');return n;};
export function capRatePlan(v:Values,worksheet=false):Result{
 const value=read(v,'value'),target=read(v,'target');
 if(value<=0||value>1e12)throw Error('Enter a positive property price or market value up to one trillion USD.');
 if(target<.01||target>100)throw Error('Use a target cap rate from 0.01% to 100%.');
 let operations:Result|undefined,noi:number;
 if(worksheet){
  for(const f of noiCalculator.modes[0].fields.filter(f=>f.type!=='select')){const x=read(v,f.key);if(x<0||x>1e12)throw Error('Income and expenses must be nonnegative and no more than one trillion per reporting period.');}
  operations=noiProjection(v);noi=operations.metrics[0].value;
 }else{noi=read(v,'noi');if(Math.abs(noi)>1e12)throw Error('Annual NOI must be within one trillion USD; operating losses may be negative.');}
 checked(noi);const rate=checked(noi/value*100),needed=checked(value*target/100),implied=noi>0?checked(noi/(target/100)):0;
 const rates=[...new Set([4,5,6,7,8,target])].sort((a,b)=>a-b);
 return {metrics:[metric('Capitalization rate',rate,'percent'),money('Annual net operating income',noi),money('Property price or market value',value),noi>0?money('Indicated value at target cap rate',implied):{...money('Indicated value at target cap rate',0),displayValue:'Not meaningful: NOI is zero or negative'},money('Annual NOI needed at target cap rate',needed),money('NOI surplus / shortfall versus target',checked(noi-needed)),money('Monthly NOI equivalent',noi/12),metric('Target cap rate',target,'percent'),...(operations?[operations.metrics[2],operations.metrics[3],operations.metrics[4]]:[])],
 columns:['Target cap rate (%)','Indicated value at unchanged NOI (USD)','Annual NOI needed at entered property value (USD)'],rows:rates.map(r=>[r,noi>0?checked(noi/(r/100)):'Not meaningful: nonpositive NOI',checked(value*r/100)]),
 ...(operations?{additionalTables:[{title:'Annual operating-income reconciliation',columns:operations.columns!,rows:operations.rows!,note:'The entered reporting period is annualized once. Financing, depreciation, capital replacements and owner income tax are excluded from this before-capex NOI.'}]}:{}),
 notes:[
 'Cap rate = annual NOI / entered property price or market value × 100. Choose a consistent valuation date and income basis: trailing results or forward stabilized assumptions. A purchase-price yield and a current-market-value cap rate answer different questions. No market data or appraisal is fetched.',
 'NOI here includes ordinary property operating costs such as property taxes and insurance, but excludes mortgage payments, owner income tax, depreciation, acquisition costs, capital improvements and replacement reserves. Definitions used by lenders or appraisers may differ; match the numerator and rate convention before comparing properties.',
 'The indicated value divides positive annual NOI by your selected target rate. It is an income-capitalization scenario, not a recommended offer, appraised value or forecast. At zero or negative NOI no positive indicated value is shown. A signed cap rate is still calculated for an operating loss.',
 'A higher cap rate can reflect higher risk, weaker growth expectations or different income assumptions. No universal good rate, location ranking, rent growth, occupancy forecast, sale cost or total return is inferred. Loan terms do not change this unlevered metric; use cash-on-cash return for cash flow after financing.',
 ...(operations?operations.notes!:['Use annual NOI, not gross rent, monthly NOI, cash flow after debt service or a deduction for the owner’s income tax. Annual NOI is supplied by you and is not independently verified.']),
 'Sensitivity rows hold NOI and entered property value fixed while varying only the target rate. Rates are illustrative assumptions, not observed market comparables. All money is USD; monthly NOI is annual NOI divided by 12, not a seasonal forecast.'
 ]};
}
const valueField={...num('value','Property price or current market value',300000,'$',.01),max:1e12,hint:'Use the price or market value matching your income assumptions; this is not your down payment.'};
const targetField={...num('target','Target cap rate for value comparison',6,'%',.01),max:100,hint:'Your scenario assumption, not a market quote or recommended rate.'};
export const capRateCalculator=tool('cap-rate',[
 {id:'noi',title:'Known Annual NOI',description:'Calculate cap rate from annual net operating income and property value, then test the value implied by your target rate.',formula:'Cap rate (%) = annual NOI / property value × 100. Indicated value = positive annual NOI / (target cap rate / 100).',fields:[valueField,{...num('noi','Annual net operating income',18000,'$/year',-1e12),max:1e12,hint:'After operating expenses, before debt service, capital costs and owner income tax. Negative NOI is supported.'},targetField],calculate:v=>capRatePlan(v)},
 {id:'rental',title:'Rental Income & Expenses',description:'Build NOI from rent, vacancy and itemized operating costs, then calculate an unlevered property cap rate.',formula:'Annual NOI = annualized [rent × (1 − vacancy) + other income − operating expenses]. Cap rate = annual NOI / property value × 100.',fields:[valueField,targetField,...noiCalculator.modes[0].fields.map(f=>({...f}))],calculate:v=>capRatePlan(v,true)}
],'Use this free cap rate calculator with annual NOI or a rental-property worksheet. Compare income-based property values, target rates and operating assumptions before financing.');
