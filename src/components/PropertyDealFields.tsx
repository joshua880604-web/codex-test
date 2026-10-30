import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function PropertyDealFields({id,fields,renderField}:{id:string;fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=id==='seller-financing'?[
  {title:'1. Purchase and seller-financed note',keys:['price','down','rate']},
  {title:'2. Amortization and maturity',keys:['years','due']}
 ]:[
  {title:'1. Purchase and renovation',keys:['price','closing','rehab','contingency']},
  {title:'2. Holding and sale',keys:['months','holding','sale','selling','sale_fixed']},
  {title:'3. Acquisition financing',keys:['financing','loan','rate','points']}
 ];
 return <div className="property-deal-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</div>;
}
