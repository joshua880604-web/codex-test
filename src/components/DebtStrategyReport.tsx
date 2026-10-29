import SiteLink from './SiteLink';
import {calculatorPresetHref} from '@/lib/preset-links';
import {routeFor} from '@/lib/catalog';
import type {Result,Values} from '@/lib/types';
export default function DebtStrategyReport({id,values,result,onDownload}:{id:string;values:Values;result:Result;onDownload:(table:NonNullable<Result['additionalTables']>[number])=>void}){
  const other=id==='debt-snowball'?'debt-avalanche':'debt-snowball',mode=other==='debt-avalanche'?'avalanche':'snowball';
  return <section className="workspace-report" aria-label="Debt milestones and strategy comparison">
    <h2>Your payoff plan</h2>
    {result.additionalTables?.map(table=><section key={table.title}>
      <h3>{table.title}</h3><p className="result-note">{table.note}</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label={table.title+' table'}><table><thead><tr>{table.columns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{table.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v):v}</td>)}</tr>)}</tbody></table></div>
      <div className="result-actions"><button type="button" onClick={()=>onDownload(table)}>Download payoff comparison CSV</button></div>
    </section>)}
    <p><SiteLink href={calculatorPresetHref(routeFor(other),mode,values)}>Open this same debt list in the {mode} calculator</SiteLink>. This link includes your entered nicknames and amounts. Share it only if you want to include those details.</p>
    <p><SiteLink href="/guides/debt-snowball-vs-avalanche/">Read the same-budget strategy comparison</SiteLink>.</p>
  </section>;
}
