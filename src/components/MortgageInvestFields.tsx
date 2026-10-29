import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function MortgageInvestFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[{title:'1. Your current mortgage',keys:['principal','rate','term']},{title:'2. The same cash and comparison date',keys:['lump','extra','horizon','return']}];
 return <div className="mortgage-invest-fields">{groups.map(group=><fieldset className="planning-fields" key={group.title}><legend>{group.title}</legend>{group.keys.map(key=>fields.find(field=>field.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</div>;
}
