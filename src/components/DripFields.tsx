import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';
export default function DripFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[{title:'1. Starting investment and deposits',keys:['initial','price','monthly','years']},{title:'2. Dividend payments',keys:['yield','frequency','dividend_growth']},{title:'3. Price growth and tax assumption',keys:['price_growth','tax']}];
 return <div className="drip-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f)).map(f=>renderField(f))}</fieldset>)}</div>;
}
