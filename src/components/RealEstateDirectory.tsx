import {calculators,routeFor} from '@/lib/calculators';
import {calculatorCategories} from '@/lib/calculator-categories';
import CategoryToolList from './CategoryToolList';
export default function RealEstateDirectory() {
  const group=calculatorCategories.find(group=>group.id==='mortgage-housing')!;
  const tools=group.tools.filter(id=>id!=='real-estate').map(id=>{const tool=calculators.find(tool=>tool.id===id)!;return {...tool,local_route:routeFor(id)};});
  return <><p>Choose a tool for buying a home, reducing interest, refinancing, or comparing rent and property investment.</p><div className="estate-categories"><CategoryToolList group={group} tools={tools} detailed/></div></>;
}
