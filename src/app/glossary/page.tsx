import {pageMetadata} from '@/lib/seo';
import {glossaryPath,glossaryTerms,glossaryTermPath,glossarySchema} from '@/lib/glossary';
import {directoryPath,serializeSchema} from '@/lib/site';

export const metadata=pageMetadata(glossaryPath,'Financial Glossary: Clear Definitions & Examples','Understand compound interest, CAGR, 401(k) plans and other finance terms with concise definitions, worked examples, sources and related calculators.');
export default function Glossary(){
 const terms=[...glossaryTerms].sort((a,b)=>a.name.localeCompare(b.name,'en'));
 const categories=['Saving & investing','Retirement','Loans & debt','Business & pricing'];
 return <div className="page-wrap glossary-page"><main id="main">
  <nav className="breadcrumb" aria-label="Breadcrumb"><a href={directoryPath}>Calculators</a> / <span aria-current="page">Glossary</span></nav>
  <h1>Financial glossary</h1>
  <p className="glossary-intro">Clear definitions for the numbers you work with. Each term includes a practical example, a common misunderstanding and a calculator to explore it.</p>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(glossarySchema())}}/>
  <nav className="glossary-topics" aria-label="Glossary topics">{categories.map(category=><a key={category} href={'#'+category.toLowerCase().replace(/[^a-z]+/g,'-')}>{category}</a>)}</nav>
  {categories.map(category=><section className="glossary-group" key={category} aria-labelledby={category.toLowerCase().replace(/[^a-z]+/g,'-')}>
   <h2 id={category.toLowerCase().replace(/[^a-z]+/g,'-')}>{category}</h2><div className="glossary-grid">{terms.filter(term=>term.category===category).map(term=><article key={term.slug}>
   <h3><a href={glossaryTermPath(term.slug)}>{term.name}</a></h3><p>{term.definition}</p>
   <a className="glossary-read" href={glossaryTermPath(term.slug)}>Read {term.name} definition <span aria-hidden="true">→</span></a>
  </article>)}</div></section>)}
  <p className="glossary-editorial">Definitions explain concepts; the linked calculators show how assumptions affect results. Sources and the date of the definition and arithmetic check appear on each term page. <a href="/methodology.html">Read our methodology and review status.</a></p>
 </main></div>;
}
