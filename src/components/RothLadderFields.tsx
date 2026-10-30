import type {ReactNode} from 'react';import type {Field} from '@/lib/types';
export default function RothLadderFields({fields,renderField}:{fields:Field[];renderField:(f:Field)=>ReactNode}){
 const groups=[{title:'1. Early-bridge timeline',keys:['start_year','age','years']},{title:'2. Available starting assets',keys:['pretax','bridge','roth_basis']},{title:'3. Conversion and tax assumptions',keys:['conversion','conversion_growth','tax']},{title:'4. Spending and investment assumptions',keys:['spending','spending_growth','pretax_return','roth_return']}];
 return <div className="drip-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f)).map(f=>renderField(f))}</fieldset>)}</div>;
}
