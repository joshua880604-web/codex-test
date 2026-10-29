import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function BrrrrFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[
  {title:'1. Buy and acquisition financing',keys:['price','closing','loan','loan_rate','points']},
  {title:'2. Rehab and holding period',keys:['rehab','contingency','months','holding']},
  {title:'3. Refinance assumptions',keys:['arv','ltv','refi_costs','refi_rate','years']},
  {title:'4. Stabilized rental cash flow',keys:['rent','vacancy','other_income','operating','reserve']},
 ];
 return <div className="brrrr-fields">{groups.map(group=><fieldset className="planning-fields" key={group.title}><legend>{group.title}</legend>{group.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</div>;
}
