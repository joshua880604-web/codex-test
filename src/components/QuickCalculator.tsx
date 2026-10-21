"use client";
import {useEffect,useRef,useState} from 'react';
const keys=['AC','(',')','⌫','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','%','+'];
export default function QuickCalculator(){
 const [expression,setExpression]=useState(''),[answer,setAnswer]=useState<number|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const input=useRef<HTMLInputElement>(null),panel=useRef<HTMLDetailsElement>(null),request=useRef(0);
 useEffect(()=>{const media=matchMedia('(min-width: 701px)');const resize=()=>{if(panel.current)panel.current.open=media.matches;};resize();media.addEventListener('change',resize);return()=>{request.current++;media.removeEventListener('change',resize);};},[]);
 function change(text:string){request.current++;setExpression(text);setAnswer(null);setError('');setBusy(false);}
 function press(key:string){
  if(key==='AC'){change('');return;}
  const el=input.current;let text=expression,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;
  if(answer!==null){text=['+','−','×','÷','%'].includes(key)?String(answer):'';start=end=text.length;}
  const from=key==='⌫'&&start===end?Math.max(0,start-1):start;
  const insert=key==='⌫'?'':key;
  const next=text.slice(0,from)+insert+text.slice(end);if(next.length>2000)return;
  change(next);requestAnimationFrame(()=>input.current?.setSelectionRange(from+insert.length,from+insert.length));
 }
 async function evaluate(){const token=++request.current;setBusy(true);setError('');setAnswer(null);try{const {scientific}=await import('@/lib/scientific');const value=scientific(expression);if(token===request.current)setAnswer(value);}catch(e){if(token===request.current)setError(e instanceof Error?e.message:'Check the expression.');}finally{if(token===request.current)setBusy(false);}}
 return <details ref={panel} className="quick-calculator"><summary>Quick calculator</summary>
  <div className="quick-calculator-body">
   <label htmlFor="quick-expression">Expression</label>
   <input ref={input} id="quick-expression" type="text" inputMode="decimal" autoComplete="off" spellCheck={false} maxLength={2000} placeholder="e.g. (125 + 75) ÷ 4" value={expression} onChange={e=>change(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();evaluate();}if(e.key==='Escape'){e.preventDefault();change('');}}} aria-describedby="quick-help"/>
   <output className="quick-answer" htmlFor="quick-expression" aria-live="polite">{error|| (busy?'Calculating…':answer!==null?new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(answer):'—')}</output>
   <div className="quick-keys" role="group" aria-label="Basic calculator keypad">{keys.map(key=><button type="button" key={key} aria-label={key==='AC'?'Clear quick calculation':key==='⌫'?'Delete last character':key} onMouseDown={e=>e.preventDefault()} onClick={()=>press(key)}>{key}</button>)}</div>
   <button type="button" className="quick-equals" disabled={busy} onClick={evaluate}>Calculate =</button>
   <p id="quick-help">Enter to calculate · Esc to clear. % divides by 100: 100 + 10% = 100.1.</p>
   <a href="/scientific-calculator.html">Open scientific calculator →</a>
  </div>
 </details>;
}
