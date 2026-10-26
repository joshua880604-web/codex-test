import {calculators,routeFor} from '@/lib/calculators';
import {calculatorCategories} from '@/lib/calculator-categories';
import {categoryPages} from '@/lib/category-pages';
import CategoryToolList from './CategoryToolList';
export default function CategoryLanding({id}:{id:string}) {
 const page=categoryPages.find(page=>page.id===id)!,group=calculatorCategories.find(group=>group.id===id)!;
 const tools=group.tools.filter(id=>id!=='real-estate').map(id=>{const tool=calculators.find(tool=>tool.id===id)!;return {...tool,local_route:routeFor(id)};});
 return <div className="category-landing">
   <p>{page.intro}</p>
   <nav className="guide-nav" aria-label="Category page sections"><a href="#choose-a-tool">Choose a tool</a><a href="#category-tools">All tools ({tools.length})</a><a href="#tool-differences">Compare tools</a><a href="#category-questions">Questions</a><a href="#category-concepts">Related concepts</a></nav>
   <section id="choose-a-tool"><h2>Choose the right calculator</h2>{page.guides.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   <section id="category-tools"><h2>All {group.title.toLowerCase()} tools</h2><div className="estate-categories"><CategoryToolList group={group} tools={tools} detailed/></div></section>
   <section id="tool-differences"><h2>Understand the differences</h2>{page.differences.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   <section id="category-questions"><h2>Common questions</h2>{page.questions.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   <section id="category-concepts"><h2>Related financial concepts</h2><ul>{page.concepts.map(([slug,label])=><li key={slug}><a href={'/glossary/'+slug+'/'}>{label}</a></li>)}</ul><p>Review each calculator's assumptions, limitations and sources before making a decision. <a href="/methodology.html">Calculation methodology</a>.</p></section>
 </div>;
}
