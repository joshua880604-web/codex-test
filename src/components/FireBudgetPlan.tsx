import type {ReactNode} from 'react';
import type {Field,Result} from '@/lib/types';
import SiteLink from './SiteLink';
import {routeFor} from '@/lib/catalog';
export default function FireBudgetFields({id,fields,renderField}:{id:string;fields:Field[];renderField:(field:Field)=>ReactNode}){
  const lean=id==='lean-fire';
  const group=(title:string,keys:string[])=><fieldset className="planning-fields"><legend>{title}</legend>{keys.map(key=>{const field=fields.find(f=>f.key===key);return field?renderField(field):null;})}</fieldset>;
  return <>
    {group('Your savings timeline',['age','max_age','balance','monthly'])}
    <p className="result-note">{lean?'Start with necessary spending for the retirement lifestyle you could actually maintain. Include insurance and healthcare rather than assuming they disappear when work stops.':'Separate baseline living costs from additions for your preferred retirement lifestyle. Enter each expense once; annual extras should exclude amounts already in core costs.'}</p>
    {group(lean?'Essential monthly budget':'Core monthly budget',lean?['housing','food','utilities','transport','health','essentials']:['core'])}
    {!lean&&group('Additional annual lifestyle budget',['travel','housing_extra','family','lifestyle','health_extra'])}
    {group('Annual provisions and buffer',['annual_extra','tax_allowance','buffer'])}
    {group('Growth and target assumptions',['return','inflation','withdrawal'])}
    <p className="result-note">Use today’s USD throughout; inflation is removed from returns automatically. Annual provisions are recurring allowances, not dated one-time costs. Social Security, pensions and taxes are not calculated automatically.</p>
    <p className="result-note">For the distinct question of stopping retirement contributions while your portfolio grows toward a later target, use the <SiteLink href={routeFor('coast-fire')}>Coast FIRE Calculator</SiteLink>.</p>
  </>;
}
export function FireBudgetReport({result,onDownload}:{result:Result;onDownload:(table:NonNullable<Result['additionalTables']>[number])=>void}){
  return <section className="workspace-report" aria-label="Retirement budget and target comparisons"><h2>Your budget and FIRE target</h2>
    {result.additionalTables?.map(table=><section key={table.title}>
      <h3>{table.title}</h3><p className="result-note">{table.note}</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label={table.title+' table'}><table><thead><tr>{table.columns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{table.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v):v}</td>)}</tr>)}</tbody></table></div>
      <div className="result-actions"><button type="button" onClick={()=>onDownload(table)}>Download budget CSV</button></div>
    </section>)}
  </section>;
}
