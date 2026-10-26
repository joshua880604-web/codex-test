
import SiteLink from "@/components/SiteLink";
import {glossaryForCalculator,glossaryTermPath} from '@/lib/glossary';
export default function GlossaryLinks({id}:{id:string}){
 const terms=glossaryForCalculator(id);if(!terms.length)return null;
 return <aside className="guide-terms" aria-labelledby="key-terms"><h3 id="key-terms">Key terms in this calculator</h3><dl>{terms.map(term=><div key={term.slug}><dt><SiteLink href={glossaryTermPath(term.slug)}>{term.name}</SiteLink></dt><dd>{term.definition}</dd></div>)}</dl></aside>;
}
