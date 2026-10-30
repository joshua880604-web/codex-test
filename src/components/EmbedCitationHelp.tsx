import SiteLink from './SiteLink';
import {embedTool} from '@/lib/embed-code';
import {hasShareTools} from '@/lib/share-tools';
export default function EmbedCitationHelp({id,title}:{id:string;title:string}){
 const embedded=Boolean(embedTool(id)),enhanced=hasShareTools(id);
 if(!embedded&&!enhanced)return null;
 return <section id="embed-and-cite" className="embed-citation-help" aria-labelledby="embed-citation-heading"><h2 id="embed-citation-heading">{embedded?"Embed & cite this calculator":"Share & cite this calculator"}</h2>
 {embedded?<details><summary>Can I embed this {title} on my blog?</summary><p>Yes. The hosted embed is free for personal and commercial blog use and contains no ads. {hasShareTools(id)?'Open Share / Export, then choose Embed. On mobile, use Menu → Share / Embed / Cite.':'In the result area, open Save or share result, then Embed this calculator.'} Keep the CalculatorFree.io attribution and credit link visible. See the <SiteLink href="/embed-resources#usage">embed setup and usage guidance</SiteLink>.</p></details>:<details><summary>How do I share a recalculable scenario?</summary><p>Calculate your result, open Share your results and choose Include my inputs in the share link. Recipients can reopen your inputs and recalculate. Anyone with the link can read those inputs; model updates may change results. Leave the checkbox off to share only the calculator page.</p></details>}
 <details><summary>How do I cite this calculator in my article?</summary><p>{hasShareTools(id)?'Open Share / Export and choose Cite for plain text, HTML or BibTeX. The citation uses the tool’s canonical page and your access date, without personal inputs or results.':'Link to this calculator page using its title and credit CalculatorFree.io. Add the date you accessed it; no publication date or expert endorsement is implied.'} Review the calculator’s assumptions and sources when explaining an estimate.</p></details>
 </section>;
}
