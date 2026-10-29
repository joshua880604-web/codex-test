import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function BaristaFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[
  {title:'1. Your timeline',keys:['age','start_age','income_end','retire_age']},
  {title:'2. Savings before part-time work',keys:['balance','monthly']},
  {title:'3. Spending and part-time income',keys:['spending','income','full_spending']},
  {title:'4. Editable assumptions',keys:['return','inflation','withdrawal']},
 ];
 return <>{groups.map(group=><fieldset className="planning-fields" key={group.title}><legend>{group.title}</legend>{group.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</>;
}
