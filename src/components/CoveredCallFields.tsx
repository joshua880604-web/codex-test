import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function CoveredCallFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[{title:'1. Fully covered stock and call',keys:['stock','contracts','strike','premium']},{title:'2. Trading costs',keys:['stock_fee','option_fee','exit_fee']},{title:'3. Your expiry scenario',keys:['expiry','days']}];
 return <div className="covered-call-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f)).map(f=>renderField(f))}</fieldset>)}</div>;
}
