import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function CapRateFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[{title:'1. Property value & reporting period',keys:['value','target','period']},{title:'2. Rental income & vacancy',keys:['rent','other_income','vacancy']},{title:'3. Operating expenses — selected reporting period',keys:['taxes','insurance','repairs','management','utilities','hoa','other_expenses']}];
 return <div className="cash-return-fields focused-tool-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f)).map(f=>renderField(f))}</fieldset>)}</div>;
}
