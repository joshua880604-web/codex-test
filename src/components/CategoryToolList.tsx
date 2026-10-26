
import SiteLink from "@/components/SiteLink";
import type { CalculatorCategory } from '@/lib/calculator-categories';
import { directoryDescriptions } from '@/lib/directory';
type Tool = { id: string; title: string; local_route: string; intro?: string };
export default function CategoryToolList({group,tools,detailed=false}:{group:Pick<CalculatorCategory,'sections'>;tools:Tool[];detailed?:boolean}) {
  const list = (items:Tool[]) => <ul className={detailed ? 'estate-list' : undefined}>{items.map(tool=><li key={tool.id}><SiteLink href={tool.local_route}>{tool.title}{!detailed&&directoryDescriptions[tool.id]&&<small>{directoryDescriptions[tool.id]}</small>}</SiteLink>{detailed&&tool.intro&&<span> — {tool.intro}</span>}</li>)}</ul>;
  if (!group.sections) return list(tools);
  const sections = group.sections.map(section=>({...section,tools:section.tools.flatMap(id=>{const tool=tools.find(tool=>tool.id===id);return tool?[tool]:[];})})).filter(section=>section.tools.length);
  const assigned = new Set(sections.flatMap(section=>section.tools.map(tool=>tool.id)));
  const remaining = tools.filter(tool=>!assigned.has(tool.id));
  return <>{sections.map(section=><div className="category-subgroup" key={section.title}>{detailed?<h2>{section.title}</h2>:<h4>{section.title}</h4>}{list(section.tools)}</div>)}{remaining.length>0&&list(remaining)}</>;
}
