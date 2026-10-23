import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {glossaryTerms,glossaryTerm,glossaryPath,glossaryTermPath,glossaryExampleLink,glossarySchema} from '@/lib/glossary';
import {calculators,routeFor} from '@/lib/calculators';
import {pageMetadata} from '@/lib/seo';
import {directoryPath,serializeSchema} from '@/lib/site';

export const dynamicParams=false;
export function generateStaticParams(){return glossaryTerms.map(term=>({term:term.slug}));}
export async function generateMetadata({params}:{params:Promise<{term:string}>}):Promise<Metadata>{
 const entry=glossaryTerm((await params).term);if(!entry)notFound();
 return pageMetadata(glossaryTermPath(entry.slug),entry.title,entry.description);
}
export default async function TermPage({params}:{params:Promise<{term:string}>}){
 const entry=glossaryTerm((await params).term);if(!entry)notFound();
 return <div className="page-wrap glossary-page"><main id="main"><article className="glossary-article">
  <nav className="breadcrumb" aria-label="Breadcrumb"><a href={directoryPath}>Calculators</a> / <a href={glossaryPath}>Glossary</a> / <span aria-current="page">{entry.name}</span></nav>
  <p className="glossary-category">{entry.category}</p><h1>{entry.title}</h1>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(glossarySchema(entry))}}/>
  <p className="glossary-definition">{entry.definition}</p>
  {entry.scope&&<p className="glossary-scope"><strong>Scope:</strong> {entry.scope}</p>}
  <p className="glossary-aliases">Other names and related labels: {entry.aliases.join('; ')}.</p>
  <nav className="guide-nav" aria-label="Term sections"><a href="#example">Example</a><a href="#misunderstanding">Common misunderstanding</a>{entry.tools.length>0&&<a href="#calculators">Try a calculator</a>}<a href="#sources">Sources</a></nav>
  <section aria-labelledby="meaning"><h2 id="meaning">How it works</h2><p>{entry.explanation}</p><p className="formula">{entry.formula}</p><p>{entry.formulaNote}</p></section>
  <section className="glossary-example" aria-labelledby="example"><h2 id="example">{entry.example.title}</h2><p>{entry.example.intro}</p><ol>{entry.example.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="glossary-example-answer"><strong>{entry.example.answer}</strong></p><p className="glossary-assumptions">{entry.example.assumptions}</p>
   {entry.example.calculator&&<a className="glossary-cta" href={glossaryExampleLink(entry.example.calculator)}>Try these example inputs <span aria-hidden="true">→</span></a>}
   {entry.example.calculationNote&&<p className="glossary-assumptions">{entry.example.calculationNote}</p>}
  </section>
  <section aria-labelledby="misunderstanding"><h2 id="misunderstanding">{entry.pitfall.title}</h2><p>{entry.pitfall.text}</p></section>
  {entry.tools.length>0&&<section className="glossary-calculators" aria-labelledby="calculators"><h2 id="calculators">Explore with a calculator</h2><ul>{entry.tools.map(tool=><li key={tool.id}><a href={routeFor(tool.id)}>{calculators.find(calc=>calc.id===tool.id)!.title}</a><p>{tool.text}</p></li>)}</ul></section>}
  {entry.related.length>0&&<nav className="glossary-related" aria-label="Related terms"><h2>Related terms</h2><ul>{entry.related.map(slug=><li key={slug}><a href={glossaryTermPath(slug)}>{glossaryTerm(slug)!.name}</a></li>)}</ul></nav>}
  <section className="glossary-sources" aria-labelledby="sources"><h2 id="sources">Sources and checks</h2><ul>{entry.sources.map(source=><li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul>
   <p className="content-date">Definition and example arithmetic checked <time dateTime={entry.checkedOn}>{new Date(entry.checkedOn+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time>. Sources explain the concepts; numerical examples use the assumptions stated above.</p>
   <p><a href="/methodology.html">Calculation methodology and review status</a> · <a href={glossaryPath}>All glossary terms</a></p>
  </section>
 </article></main></div>;
}
