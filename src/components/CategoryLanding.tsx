
import {editorialGuides} from '@/lib/editorial-guides';
import SiteLink from "@/components/SiteLink";
import {calculators,routeFor} from '@/lib/calculators';
import {calculatorCategories} from '@/lib/calculator-categories';
import {categoryPages} from '@/lib/category-pages';
import CategoryToolList from './CategoryToolList';
export default function CategoryLanding({id}:{id:string}) {
 const page=categoryPages.find(page=>page.id===id)!,group=calculatorCategories.find(group=>group.id===id)!;
 const tools=group.tools.filter(id=>id!=='real-estate').map(id=>{const tool=calculators.find(tool=>tool.id===id)!;return {...tool,local_route:routeFor(id)};});
 const relatedGuides=editorialGuides.filter(guide=>guide.calculatorIds.some(id=>group.tools.includes(id)));
 return <div className="category-landing">
   <p>{page.intro}</p>
   <nav className="guide-nav" aria-label="Category page sections"><SiteLink href="#choose-a-tool">Choose a tool</SiteLink><SiteLink href="#category-tools">All tools ({tools.length})</SiteLink><SiteLink href="#tool-differences">Compare tools</SiteLink><SiteLink href="#category-questions">Questions</SiteLink><SiteLink href="#category-concepts">Related concepts</SiteLink></nav>
   <section id="choose-a-tool"><h2>Choose the right calculator</h2>{page.guides.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   <section id="category-tools"><h2>All {group.title.toLowerCase()} tools</h2><div className="estate-categories"><CategoryToolList group={group} tools={tools} detailed/></div></section>
   <section id="tool-differences"><h2>Understand the differences</h2>{page.differences.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   <section id="category-questions"><h2>Common questions</h2>{page.questions.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</section>
   {relatedGuides.length>0&&<section><h2>Related guides</h2><ul>{relatedGuides.map(guide=><li key={guide.path}><SiteLink href={guide.path}>{guide.heading}</SiteLink>: {guide.cardIntro}</li>)}</ul></section>}
   <section id="category-concepts"><h2>Related concepts</h2><ul>{page.concepts.map(([slug,label])=><li key={slug}><SiteLink href={'/glossary/'+slug+'/'}>{label}</SiteLink></li>)}</ul><p>Review each calculator's assumptions, limitations and sources before making a decision. <SiteLink href="/methodology.html">Calculation methodology</SiteLink>.</p></section>
 </div>;
}
