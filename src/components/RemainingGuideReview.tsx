import SiteLink from './SiteLink';
import StudyChart from './StudyChart';
import {remainingGuideChecks} from '@/lib/remaining-guide-checks';
import './model-study.css';
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
export function RemainingGuideSummary({id}:{id:string}){const c=remainingGuideChecks.find(c=>c.id===id)!;return <p><strong>New model check:</strong> {c.question} <SiteLink href="#controlled-model-check">See five cases, the chart and reproducible inputs →</SiteLink></p>;}
export default function RemainingGuideReview({id}:{id:string}){const c=remainingGuideChecks.find(c=>c.id===id)!;return <section id="controlled-model-check" className="model-study guide-scenario-review" aria-labelledby={'model-review-'+id}>
<h2 id={'model-review-'+id}>Model check: {c.title}</h2><p className="study-scope-label"><strong>Scope:</strong> five hypothetical deterministic cases, not observed people, market experiments or predictions. Calculations checked October 30, 2026.</p>
<h3>Question and method</h3><p>{c.question}</p>{c.method.map(p=><p key={p}>{p}</p>)}
<StudyChart figure={c.figure}/><h3>What the numbers show</h3>{c.findings.map(p=><p key={p}>{p}</p>)}
<h3>Full data and reproduction links</h3><p>All five selected cases are shown. Chart and table values use USD; display rounding does not imply forecast accuracy. <a href={c.csv} download>Download the full-precision CSV with every input</a>. The independent check uses separate 60-digit Decimal arithmetic with an absolute tolerance of $0.000001 before display rounding; it is an internal arithmetic check, not an external audit.</p>
<div className="guide-table" role="region" aria-label={id+' controlled scenario data'} tabIndex={0}><table><caption>Hypothetical model cases, October 30, 2026</caption><thead><tr><th scope="col">{c.axisLabel}</th>{c.seriesLabels.map(label=><th scope="col" key={label}>{label} (USD)</th>)}<th scope="col">Reproduce</th></tr></thead><tbody>{c.rows.map((r,i)=><tr key={r.x}><th scope="row">{r.x.toLocaleString('en-US')}</th>{r.outputs.map((value,j)=><td key={j}>{money(value)}</td>)}<td><SiteLink href={c.hrefs[i]}>Open exact inputs</SiteLink></td></tr>)}</tbody></table></div>
<h3>What this check cannot establish</h3><ul>{c.limits.map(p=><li key={p}>{p}</li>)}</ul><p>Use the original worked examples, questions and sources below for context, and review the <SiteLink href="/methodology">calculation methodology</SiteLink> before applying a scenario to a decision.</p></section>;}
