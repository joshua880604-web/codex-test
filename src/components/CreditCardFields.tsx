"use client";
import {useRef, useEffect} from 'react';

type Card = {name:string;balance:string;minimum:string;apr:string};
const keys=['name','balance','minimum','apr'] as const;
const labels={name:'Card name',balance:'Balance ($)',minimum:'Minimum monthly payment ($)',apr:'APR (%)'};
export default function CreditCardFields({value,onChange,kind='card'}:{value:string;onChange:(value:string)=>void;kind?:'card'|'debt'}) {
  const debt=kind==='debt',singular=debt?'debt':'card',title=debt?'Debts':'Credit cards',hintId=debt?'debt-editor-help':'credit-card-editor-help';
  const fieldLabels={...labels,name:debt?'Debt name':labels.name};
  const root=useRef<HTMLFieldSetElement>(null),focusAdded=useRef(false),add=useRef<HTMLButtonElement>(null);
  const lines=value.split('\n').filter(line=>line.trim());
  const compatible=lines.every(line=>line.split(',').length===4)&&lines.length<=20;
  const rows:Card[]=lines.length?lines.map(line=>{const [name='',balance='',minimum='',apr='']=line.split(',').map((s,i)=>i===0?s:s.trim());return {name,balance,minimum,apr};}):[{name:'',balance:'',minimum:'',apr:''}];
  useEffect(()=>{if(focusAdded.current){focusAdded.current=false;root.current?.querySelector<HTMLInputElement>('.credit-card-entry:last-of-type input')?.focus();}},[rows.length]);
  function commit(cards:Card[]){onChange(cards.map(card=>keys.map(key=>card[key]).join(',')).join('\n'));}
  function change(index:number,key:typeof keys[number],text:string){commit(rows.map((row,i)=>i===index?{...row,[key]:key==='name'?text.replace(/[,\r\n]/g,' '):text}:row));}
  if(!compatible)return <div className="field-row field-wide"><label htmlFor="original-card-list">{title}</label><p>These saved details need editing before they can be shown as separate entries. Keep one card per line: name, balance, minimum payment, APR.</p><textarea id="original-card-list" value={value} rows={5} onChange={e=>onChange(e.target.value)}/></div>;
  return <fieldset className="credit-card-editor" ref={root}>
    <legend>{title}</legend>
    <p className="credit-card-editor-help" id={hintId}>Enter each {singular} separately. Minimum payments are included in your total monthly budget below. Use a nickname; account numbers are not needed.</p>
    {rows.map((card,index)=><fieldset className="credit-card-entry" key={index}>
      <legend>{debt?'Debt':'Card'} {index+1}</legend>
      <div className="credit-card-inputs">{keys.map(key=><div key={key} className="credit-card-input">
        <label htmlFor={`${singular}-${index}-${key}`}>{fieldLabels[key]}</label>
        <input id={`${singular}-${index}-${key}`} aria-describedby={hintId} type={key==='name'?'text':'number'} inputMode={key==='name'?undefined:'decimal'} min={key==='name'?undefined:0} step={key==='name'?undefined:'any'} maxLength={key==='name'?80:undefined} autoComplete="off" required value={card[key]} onChange={e=>change(index,key,e.target.value)}/>
      </div>)}</div>
      <button type="button" className="credit-card-remove" disabled={rows.length===1} aria-label={`Remove ${singular} ${index+1}`} onClick={()=>{commit(rows.filter((_,i)=>i!==index));add.current?.focus();}}>Remove {singular}</button>
    </fieldset>)}
    <div className="credit-card-editor-actions"><button type="button" ref={add} className="credit-card-add" disabled={rows.length>=20} onClick={()=>{focusAdded.current=true;commit([...rows,{name:`${debt?'Debt':'Card'} ${rows.length+1}`,balance:'',minimum:'',apr:''}]);}}>+ Add {singular}</button><span role="status">{rows.length} of 20 {debt?'debts':'cards'}</span></div>
  </fieldset>;
}
