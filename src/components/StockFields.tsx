import type {ReactNode} from 'react';import type {Field} from '@/lib/types';
export default function StockFields({id,fields,renderField}:{id:string;fields:Field[];renderField:(field:Field)=>ReactNode}){
 if(id==='stock-average')return <div className="stock-fields">{fields.map(f=>renderField(f))}</div>;
 const groups=[{title:'1. Shares and trade prices',keys:['shares','buy','sell']},{title:'2. Trading fees',keys:['buy_fee_unit','buy_fee','sell_fee_unit','sell_fee']},{title:'3. Optional cash dividends',keys:['dividends']}];
 return <div className="stock-fields">{groups.map(g=><fieldset className="planning-fields" key={g.title}><legend>{g.title}</legend>{g.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(f=>renderField(f))}</fieldset>)}</div>;
}
