import type {ReactNode} from 'react';
import type {Field} from '@/lib/types';

export default function HouseHackFields({fields,renderField}:{fields:Field[];renderField:(field:Field)=>ReactNode}){
 const groups=[
  {title:'1. Cash needed at purchase',keys:['price','loan','closing','repairs','initial_reserve']},
  {title:'2. Your mortgage payment',keys:['rate','years','mortgage_insurance']},
  {title:'3. Rent from other spaces',keys:['arrangement','rentals','vacancy','other_income']},
  {title:'4. Whole-property monthly costs',keys:['tax','insurance','hoa','utilities','maintenance','capital','management','other_costs']},
  {title:'5. Compare your housing budget',keys:['current_rent']},
 ];
 return <div className="house-hack-fields">{groups.map(group=><fieldset className={'planning-fields'+(group.keys[0]==='current_rent'?' house-hack-comparison':'')} key={group.title}><legend>{group.title}</legend>{group.keys.map(key=>fields.find(f=>f.key===key)).filter((f):f is Field=>Boolean(f)).map(field=>renderField(field))}</fieldset>)}</div>;
}

type Row={name:string;rent:number|string};
export function HouseRentalFields({value,onChange}:{value:string;onChange:(value:string)=>void}){
 let rows:Row[];try{const parsed=JSON.parse(value);if(!Array.isArray(parsed)||parsed.length>10||parsed.some(r=>!r||typeof r!=='object'))throw new Error();rows=parsed.map(r=>({name:typeof r.name==='string'?r.name:'',rent:typeof r.rent==='number'||typeof r.rent==='string'?r.rent:''}));}catch{return <div className="house-rental-editor"><p>The rent list could not be read. Reset it to enter tenant spaces.</p><button type="button" onClick={()=>onChange(JSON.stringify([{name:'Tenant space 1',rent:0}]))}>Reset tenant rent list</button></div>;}
 const update=(index:number,patch:Partial<Row>)=>onChange(JSON.stringify(rows.map((row,i)=>i===index?{...row,...patch}:row)));
 return <section className="house-rental-editor" aria-label="Tenant rent list">
  <p className="result-note">Your own room or unit is excluded. Enter only tenant spaces, using nicknames rather than tenant names. Refundable deposits are not rent.</p>
  {rows.length===0&&<p className="result-note">No tenant spaces entered. Rental income is zero.</p>}
  {rows.map((row,index)=><fieldset className="house-rental-card" key={index}><legend>Tenant space {index+1}</legend>
   <label htmlFor={'house-space-name-'+index}>Space nickname</label><input id={'house-space-name-'+index} value={row.name} maxLength={40} required onChange={e=>update(index,{name:e.target.value})}/>
   <label htmlFor={'house-space-rent-'+index}>Scheduled monthly rent ($)</label><input id={'house-space-rent-'+index} type="number" inputMode="decimal" min={0} max={1e9} step="any" required value={row.rent} onChange={e=>update(index,{rent:e.target.value===''?'':Number(e.target.value)})}/>
   <button className="house-rental-remove" type="button" aria-label={'Remove tenant space '+(index+1)} onClick={()=>onChange(JSON.stringify(rows.filter((_,i)=>i!==index)))}>Remove space</button>
  </fieldset>)}
  <div className="house-rental-actions"><button type="button" disabled={rows.length>=10} onClick={()=>onChange(JSON.stringify([...rows,{name:'Tenant space '+(rows.length+1),rent:0}]))}>+ Add rented space</button><span>{rows.length} of 10 spaces</span></div>
 </section>;
}
