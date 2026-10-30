"use client";
import {useEffect,useRef} from 'react';
import {stockLotDrafts,stockLotsDefault,type StockLotDraft} from '@/lib/stock-lots';
export default function StockLotsFields({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const root=useRef<HTMLFieldSetElement>(null),add=useRef<HTMLButtonElement>(null),focusNew=useRef(false);
 let lots:StockLotDraft[]|null;try{lots=stockLotDrafts(value);}catch{lots=null;}
 const count=lots?.length??0;
 useEffect(()=>{if(focusNew.current){focusNew.current=false;root.current?.querySelector<HTMLInputElement>('.stock-lot:last-of-type input')?.focus();}},[count]);
 const commit=(rows:StockLotDraft[])=>onChange(JSON.stringify(rows));
 if(!lots)return <fieldset className="stock-lots-editor"><legend>Stock purchases</legend><p role="alert">Saved purchases could not be read. Reset purchases to enter them as separate cards.</p><button type="button" onClick={()=>onChange(stockLotsDefault)}>Reset purchases</button></fieldset>;
 const rows=lots,labels={shares:'Shares bought',price:'Price per share ($)',fee:'Total purchase fee ($)'};
 return <fieldset className="stock-lots-editor" ref={root}><legend>Stock purchases</legend><p className="stock-lots-help" id="stock-lots-help">One stock, purchases only. Include fractional shares and the total buy fee for each purchase. No account details are needed.</p>
 {rows.map((row,index)=><fieldset className="stock-lot" key={index}><legend>Purchase {index+1}</legend><div className="stock-lot-inputs">{(['shares','price','fee'] as const).map(key=><div key={key}><label htmlFor={`stock-lot-${index}-${key}`}>{labels[key]}</label><input id={`stock-lot-${index}-${key}`} aria-describedby="stock-lots-help" type="number" inputMode="decimal" step="any" min={key==='shares'?1e-8:0} max={1e9} required value={row[key]} onChange={e=>commit(rows.map((r,i)=>i===index?{...r,[key]:e.target.value}:r))}/></div>)}</div><button type="button" className="stock-lot-remove" disabled={rows.length===1} aria-label={`Remove purchase ${index+1}`} onClick={()=>{commit(rows.filter((_,i)=>i!==index));add.current?.focus();}}>Remove purchase</button></fieldset>)}
 <div className="stock-lots-actions"><button type="button" ref={add} disabled={rows.length>=30} onClick={()=>{focusNew.current=true;commit([...rows,{shares:'',price:'',fee:'0'}]);}}>+ Add purchase</button><span role="status">{rows.length} of 30 purchases</span></div></fieldset>;
}
