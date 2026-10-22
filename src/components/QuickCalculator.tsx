"use client";
import {lazy,Suspense,useEffect,useRef,useState} from 'react';
const ScientificKeys=lazy(()=>import('./QuickScientificKeys'));
const keys=['AC','(',')','⌫','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','%','+'];
export default function QuickCalculator(){
 const [expression,setExpression]=useState(''),[answer,setAnswer]=useState<number|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [scientificMode,setScientificMode]=useState(false),[angle,setAngle]=useState<'Degrees'|'Radians'>('Degrees');
 const input=useRef<HTMLInputElement>(null),request=useRef(0);
 useEffect(()=>()=>{request.current++;},[]);
 function change(text:string){request.current++;setExpression(text);setAnswer(null);setError('');setBusy(false);}
 function press(key:string){
  if(key==='AC'){change('');return;}
  const el=input.current;let text=expression,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
  if(answer!==null){text=['+','−','×','÷','%','^','square','reciprocal','factorial','negate'].includes(key)||key.endsWith('(')?String(answer):'';start=end=text.length;}
  if(['square','reciprocal','factorial','negate'].includes(key)){
   const selected=start!==end,part=selected?text.slice(start,end):text||'0';const transformed=key==='square'?'('+part+')^2':key==='reciprocal'?'1/('+part+')':key==='factorial'?'('+part+')!':'-('+part+')';
   const next=selected?text.slice(0,start)+transformed+text.slice(end):transformed;if(next.length>2000)return;change(next);requestAnimationFrame(()=>input.current?.setSelectionRange(selected?start+transformed.length:next.length,selected?start+transformed.length:next.length));return;
  }
  const from=key==='⌫'&&start===end?Math.max(0,start-1):start;
  const insert=key==='⌫'?'':key.endsWith('(')&&(start!==end||answer!==null)?key+(start!==end?text.slice(start,end):text)+')':key;
  if(answer!==null&&key.endsWith('(')){start=0;end=text.length;}
  const insertionStart=answer!==null&&key.endsWith('(')?0:from;
  const next=text.slice(0,insertionStart)+insert+text.slice(end);if(next.length>2000)return;
  change(next);requestAnimationFrame(()=>input.current?.setSelectionRange(insertionStart+insert.length,insertionStart+insert.length));
 }
 async function evaluate(){const token=++request.current;setBusy(true);setError('');setAnswer(null);try{const {scientific}=await import('@/lib/scientific');const value=scientific(expression,angle);if(token===request.current)setAnswer(value);}catch(e){if(token===request.current)setError(e instanceof Error?e.message:'Check the expression.');}finally{if(token===request.current)setBusy(false);}}
 return <section className="quick-calculator" aria-labelledby="quick-heading"><h2 id="quick-heading">Quick calculator</h2>
  <div className="quick-modes" role="group" aria-label="Quick calculator mode"><button type="button" aria-pressed={!scientificMode} onClick={()=>setScientificMode(false)}>Basic</button><button type="button" aria-pressed={scientificMode} onClick={()=>setScientificMode(true)}>Scientific</button></div>
  <div className="quick-calculator-body">
   <label htmlFor="quick-expression">Expression</label>
   <input ref={input} id="quick-expression" type="text" inputMode="decimal" autoComplete="off" spellCheck={false} maxLength={2000} placeholder="e.g. (125 + 75) ÷ 4" value={expression} onChange={e=>change(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();evaluate();}if(e.key==='Escape'){e.preventDefault();change('');}}} aria-describedby="quick-help"/>
   <output className="quick-answer" htmlFor="quick-expression" aria-live="polite">{error|| (busy?'Calculating…':answer!==null?new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(answer):'—')}</output>
   {!scientificMode&&/(?:sin|cos|tan)\s*\(/i.test(expression)&&<small className="quick-angle-note">Scientific angle setting: {angle}</small>}
   {scientificMode&&<><div className="quick-angle"><label htmlFor="quick-angle-unit">Angle unit</label><select id="quick-angle-unit" value={angle} onChange={e=>{change(expression);setAngle(e.target.value as 'Degrees'|'Radians');}}><option>Degrees</option><option>Radians</option></select></div><Suspense fallback={<p role="status">Loading scientific keys…</p>}><ScientificKeys press={press}/></Suspense></>}
   <div className="quick-keys" role="group" aria-label="Basic calculator keypad">{keys.map(key=><button type="button" key={key} aria-label={key==='AC'?'Clear quick calculation':key==='⌫'?'Delete last character':key} onMouseDown={e=>e.preventDefault()} onClick={()=>press(key)}>{key}</button>)}</div>
   <button type="button" className="quick-equals" disabled={busy} onClick={evaluate}>Calculate =</button>
   <div className="quick-footer"><details className="quick-help-details"><summary>Help</summary><p id="quick-help">Enter to calculate · Esc to clear. % divides by 100: 100 + 10% = 100.1.</p></details>
   <a href="/scientific-calculator.html">Open scientific calculator →</a></div>
  </div>
 </section>;
}
