import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function CashReturnFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[
  {title:'1. Cash invested at purchase',keys:['price','loan','closing','repairs','initial_reserve']},
  {title:'2. Loan payments',keys:['rate','years','other_debt']},
  {title:'3. Rental income',keys:['rent','vacancy','other_income']},
  {title:'4. Costs and capital allowance',keys:['operating','reserve']},
 ];
 return <div className="cash-return-fields">{groups.map(group=><fieldset className="planning-fields" key={group.title}><legend>{group.title}</legend>{group.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</div>;
}
