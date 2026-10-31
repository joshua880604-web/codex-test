// Verified static snippet regions; keep this tiny registry out of editorial copy.
export const blogSnippetToolIds=['coast-fire','brrrr','roas','fire','debt-snowball','debt-avalanche','cash-on-cash-return','mortgage-vs-invest','roi','lean-fire','fat-fire','barista-fire','cap-rate','house-hacking','drip','noi','rental-property','discount-points','rent-vs-buy','roth-conversion-ladder','covered-call','compound-interest','investment','margin','markup'] as const;
export function hasBlogSnippetKit(id:string){return (blogSnippetToolIds as readonly string[]).includes(id);}
export function openBlogSnippetKit(){
 const section=document.getElementById('blog-snippet-kit'),details=section?.querySelector('details'),summary=details?.querySelector('summary');
 if(!section||!details||!summary)return false;
 details.open=true;
 requestAnimationFrame(()=>{summary.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'instant'});});
 return true;
}
