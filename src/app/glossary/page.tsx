import {pageMetadata} from '@/lib/seo';
import {glossaryPath,glossaryTerms,glossaryCategories,glossarySchema} from '@/lib/glossary';
import {directoryPath,serializeSchema} from '@/lib/site';
import GlossaryDirectory from '@/components/GlossaryDirectory';

export const metadata=pageMetadata(glossaryPath,'Financial Glossary: Clear Definitions & Examples','Understand compound interest, CAGR, 401(k) plans and other finance terms with concise definitions, worked examples, sources and related calculators.');
export default function Glossary(){
 const terms=[...glossaryTerms].sort((a,b)=>a.name.localeCompare(b.name,'en'));
 return <div className="page-wrap glossary-page"><main id="main">
  <nav className="breadcrumb" aria-label="Breadcrumb"><a href={directoryPath}>Calculators</a> / <span aria-current="page">Glossary</span></nav>
  <h1>Financial glossary</h1>
  <p className="glossary-intro">Clear definitions for the numbers you work with: saving, investing, borrowing, retirement, tax and business. Each term includes a worked example, assumptions, a common misunderstanding and sources. Related calculators are linked where their scope fits.</p>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(glossarySchema())}}/>
  <GlossaryDirectory terms={terms.map(({slug,name,definition,category,aliases})=>({slug,name,definition,category,aliases}))} categories={glossaryCategories}/>
  <p className="glossary-editorial">Definitions explain concepts; the linked calculators show how assumptions affect results. Sources and the date of the definition and arithmetic check appear on each term page. <a href="/methodology.html">Read our methodology and review status.</a></p>
 </main></div>;
}
