import dynamic from 'next/dynamic';
import {useState} from 'react';
import {coastScenarios} from '@/lib/coast-scenarios';
import type {Mode} from '@/lib/types';
const CoastComparison=dynamic(()=>import('./CoastComparison'));
import type {ReactNode} from 'react';
import type {Field, Result, Values} from '@/lib/types';
import {coastHousehold} from '@/lib/coast-household';
const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

export default function CoastFields({fields,values,renderField,compact=false}:{fields:Field[];values:Values;renderField:(field:Field)=>ReactNode;compact?:boolean}) {
  const couple=values.household==='Couple';
  const group=(title:string,keys:string[]) => <fieldset className="planning-fields"><legend>{title}</legend>{keys.map(key=>{
    const f=fields.find(f=>f.key===key);if(!f)return null;
    const labels:Record<string,string>=couple?{age:'Planning age today',retire:'Planning age at shared retirement',balance:'Your invested retirement assets',monthly:'Your monthly investment',spending:'Combined annual retirement budget'}:{};
    return renderField({...f,label:labels[key]??f.label});
  })}</fieldset>;
  return <>
    {group('Your plan',['household','age','retire'])}
    {couple&&!compact&&<p className="result-note">One shared timeline: the difference between the planning ages is the number of years until both portfolios are modeled to fund retirement. This does not model different retirement dates. Enter jointly owned assets and shared savings only once.</p>}
    {group(couple?'Household investments':'Retirement investments',['balance','partner_balance','monthly','partner_monthly'])}
    {group(couple?'Shared retirement budget':'Retirement budget',['spending'])}
    <section className="coast-assumptions" aria-label="Return, inflation and withdrawal assumptions">
      <h3>Return, inflation &amp; withdrawal assumptions</h3><p className="input-group-summary">{[['return','Return'],['inflation','Inflation'],['withdrawal','Withdrawal']].map(([key,label])=>`${label} ${String(values[key]??'').trim() ? values[key]+'%' : 'not set'}`).join(' · ')}</p>
      {group('Portfolio target assumption',['withdrawal'])}
      {group('Growth and purchasing power',['return','inflation'])}
    </section>
    {!compact&&<p className="result-note">All amounts are in today’s USD. The calculator adjusts returns for inflation automatically. Pensions and Social Security amounts and start dates are not calculated; benefits starting later cannot simply be deducted from every year’s budget.</p>}
  </>;
}

export function CoastResults({values,result,onDownload}:{values:Values;result:Result;onDownload:(table:NonNullable<Result['additionalTables']>[number])=>void}) {
  const household=coastHousehold(values), target=result.metrics.find(m=>m.label==='Coast FIRE number today')!.value;
  const progress=household.balance/target*100, capped=Math.min(100,Math.max(0,progress));
  const gap=Math.max(0,target-household.balance);
  return <section className="workspace-report" aria-label="Coast FIRE progress and comparisons">
    <h2>Your path to coasting</h2>
    <p>{household.couple?'Combined household portfolio':'Current retirement portfolio'}: <strong>{usd(household.balance)}</strong> toward today’s <strong>{usd(target)}</strong> Coast threshold.</p>
    <progress aria-label="Current portfolio as a share of today’s modeled Coast threshold" value={capped} max={100} style={{width:'100%'}}/>
    <p>{progress>=100?'Today’s modeled threshold is met.':`${capped.toFixed(1)}% funded; ${usd(gap)} remaining to today’s threshold.`} This is funding progress under your assumptions, not a probability of success or permission to retire.</p>
    <p>Monthly investment before coasting: <strong>{usd(household.monthly)}</strong> in today’s purchasing power. Contributions stop on the modeled path when the threshold is first met; living costs before retirement need separate funding.</p>
    <h2>Compare your assumptions</h2>
    <p>Change one assumption at a time. These tables compare today’s required assets, rather than forecast alternative Coast ages.</p>
    {result.additionalTables?.map(table=><section key={table.title}>
      <h3>{table.title}</h3><p className="result-note">{table.note}</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label={table.title+' table'}><table><thead><tr>{table.columns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{table.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v):v}</td>)}</tr>)}</tbody></table></div>
      <div className="result-actions"><button type="button" onClick={()=>onDownload(table)}>Download comparison CSV</button></div>
    </section>)}
  </section>;
}

export function CoastScenarioLibrary({onLoad}:{onLoad:(values:Values,title:string)=>void}){return <details className="workspace-report coast-scenario-library"><summary>Try an example scenario</summary><p>Hypothetical starting points, not recommended plans. All examples assume 7% nominal return, 2.5% inflation and a 4% target-sizing rate. Review every input, then Calculate.</p><div className="coast-scenario-cards">{coastScenarios.map(s=><section key={s.id}><h3>{s.title}</h3><p>{s.description}</p><button type="button" onClick={()=>onLoad({...s.values},s.title)}>Load example: {s.title}</button></section>)}</div></details>;}
export function CoastComparisonTools({values,mode}:{values:Values;mode:Mode}){const [open,setOpen]=useState(false),[loaded,setLoaded]=useState(false);return <section id="coast-ab-comparison" className="workspace-report coast-comparison-tools"><h2>Compare two Coast FIRE plans</h2><p>Keep Plan A and Plan B separate and see how your budget, retirement date or assumptions change the result.</p><button type="button" aria-expanded={open} aria-controls="coast-comparison-panel" onClick={()=>{setLoaded(true);setOpen(v=>!v);}}>{open?'Hide A/B comparison':'Compare Plan A and Plan B'}</button><div id="coast-comparison-panel" hidden={!open}>{loaded&&<CoastComparison current={values} mode={mode}/>}</div></section>;}
