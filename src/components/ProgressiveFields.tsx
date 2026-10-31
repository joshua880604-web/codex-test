import type {ReactNode} from 'react';
import type {Field,Values} from '@/lib/types';
import SiteLink from './SiteLink';
import {routeFor} from '@/lib/catalog';
import {progressiveInputGroups} from '@/lib/progressive-inputs';
const shortLabels:Record<string,string>={return:'Return',inflation:'Inflation',withdrawal:'Withdrawal',salary_growth:'Income growth',conversion_growth:'Conversion growth',spending_growth:'Budget growth',pretax_return:'Pre-tax return',roth_return:'Roth return',dividend_growth:'Dividend growth',price_growth:'Price growth',tax:'Tax',projection:'Years',closing:'Closing costs',repairs:'Repairs',initial_reserve:'Initial reserve',points:'Loan points',refi_costs:'Refinance fees',other_income:'Other income',other_debt:'Other debt payments',fee:'Annual fees',stock_fee:'Stock fees',option_fee:'Option fee / contract',exit_fee:'Exit costs',buy_fee_unit:'Buy fee method',buy_fee:'Buy fee',sell_fee_unit:'Sell fee method',sell_fee:'Sell fee',dividends:'Cash dividends'};
function summary(fields:Field[],values:Values){return fields.map(f=>{
 const raw=values[f.key]??'';if(f.key==='dated')return raw.trim()?`${raw.trim().split(/\n/).length} dated payment row(s) entered`:'No dated extra payments';const n=Number(raw),value=raw.trim()===''?'not set':f.type==='select'?raw:Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n):raw;
 let unit=f.unit;
 if(f.key==='buy_fee'||f.key==='sell_fee')unit=values[f.key.replace('_fee','_fee_unit')]==='Percent'?'%':'$';
 return `${shortLabels[f.key]??f.label}: ${value==='not set'?value:unit==='$'?'$'+value:unit==='%'?value+'%':value+(unit?' '+unit:'')}`;
}).join(' · ');}
export default function ProgressiveFields({id,mode,fields,values,renderField}:{id:string;mode:string;fields:Field[];values:Values;renderField:(field:Field)=>ReactNode}){
 const groups=progressiveInputGroups(id,mode)??[];
 const assigned=new Set(groups.flatMap(g=>g.keys));
 const remaining=fields.filter(f=>!assigned.has(f.key));
 const note=id==='lean-fire'?'Include necessary housing, healthcare and insurance in the retirement lifestyle you could maintain.':id==='fat-fire'?'Enter each expense once. Annual lifestyle extras should exclude amounts already included in core monthly costs.':null;
 return <div className="progressive-fields">{note&&<p className="result-note">{note}</p>}{groups.map(g=>{
 const selected=g.keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f));if(!selected.length)return null;
 const rows=selected.map(f=>renderField(f));
 // Never put a required field inside a collapsible input group. Do not weaken validation.
 const canCollapse=g.collapsed&&selected.every(f=>f.optional===true||(f.key==='dated'&&f.type==='textarea'));
 const showSummary=g.collapsed||['rental-property','rent-vs-buy','fha-loan','va-mortgage','income-tax','take-home-paycheck'].includes(id);
 const preview=summary(selected.slice(0,3),values)+(selected.length>3?` · +${selected.length-3} settings below`:'');
 const monthlyCosts=id==='house-hacking'&&g.title==='Whole-property monthly costs';
 const complete=selected.every(f=>String(values[f.key]??'').trim()!==''&&Number.isFinite(Number(values[f.key]))&&Number(values[f.key])>=0);
 const costNote=monthlyCosts&&<p className="result-note house-monthly-cost-summary">{complete?`Entered monthly costs before loan principal and interest: ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(selected.reduce((total,f)=>total+(f.key==='mortgage_insurance'&&Number(values.loan)===0?0:Number(values[f.key])),0))}. Includes capital reserve; mortgage insurance is excluded for a zero loan.`:'Complete the monthly cost amounts to see their total.'}</p>;
 return canCollapse?<details className="input-disclosure" data-input-group={g.title} key={g.title}><summary><span>{g.title}</span><small>{summary(selected,values)}</small><span className="input-disclosure-action">Edit settings</span></summary><div className="input-disclosure-fields">{rows}</div></details>:g.title?<fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{showSummary&&<p className="input-group-summary">{preview}</p>}{costNote}{rows}</fieldset>:<div key="core-inputs">{rows}</div>;
 })}{remaining.length>0&&<fieldset className="planning-fields"><legend>Additional inputs</legend>{remaining.map(f=>renderField(f))}</fieldset>}{['lean-fire','fat-fire'].includes(id)&&<p className="result-note">Use today’s USD throughout; inflation is removed from returns automatically. Annual provisions are recurring allowances, not dated one-time costs. Social Security, pensions and taxes are not calculated automatically.</p>}{['lean-fire','fat-fire'].includes(id)&&<p className="result-note">For the distinct question of stopping retirement contributions while your portfolio grows toward a later target, use the <SiteLink href={routeFor('coast-fire')}>Coast FIRE Calculator</SiteLink>.</p>}</div>;
}
