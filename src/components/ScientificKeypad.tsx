import type { Values } from '@/lib/types';
const keys=[['sin','sin('],['cos','cos('],['tan','tan('],['asin','asin('],['acos','acos('],['atan','atan('],['ln','ln('],['log','log('],['√','sqrt('],['∛','cbrt('],['x²','square'],['xʸ','^'],['(','('],[')',')'],['π','pi'],['e','e'],['n!','factorial'],['%','%'],['7','7'],['8','8'],['9','9'],['÷','/'],['⌫','backspace'],['AC','clear'],['4','4'],['5','5'],['6','6'],['×','*'],['1/x','reciprocal'],['±','negate'],['1','1'],['2','2'],['3','3'],['−','-'],['0','0'],['.','.'],['EXP','E'],['+','+'],['=','equals']];
export default function ScientificKeypad({values,update}:{values:Values;update:(key:string,value:string)=>void}){
 function press(action:string){const input=document.getElementById('scientific-evaluate-expression') as HTMLTextAreaElement|null;if(!input)return;const text=values.expression??'',start=input.selectionStart??text.length,end=input.selectionEnd??start;
  if(action==='equals'){input.closest('form')?.requestSubmit();return;}
  let next=text,caret=start;
  if(action==='clear'){next='';caret=0;}
  else if(action==='backspace'){next=text.slice(0,start===end?Math.max(0,start-1):start)+text.slice(end);caret=start===end?Math.max(0,start-1):start;}
  else if(['square','factorial','reciprocal','negate'].includes(action)){const selected=start!==end,textPart=selected?text.slice(start,end):text||'0';const transformed=action==='square'?'('+textPart+')^2':action==='factorial'?'('+textPart+')!':action==='reciprocal'?'1/('+textPart+')':'-('+textPart+')';next=selected?text.slice(0,start)+transformed+text.slice(end):transformed;caret=selected?start+transformed.length:next.length;}
  else {const insert=action.endsWith('(')&&start!==end?action+text.slice(start,end)+')':action;next=text.slice(0,start)+insert+text.slice(end);caret=start+insert.length;}
  update('expression',next);requestAnimationFrame(()=>{input.focus();input.setSelectionRange(caret,caret);});
 }
 return <div className="scientific-keypad" role="group" aria-label="Scientific calculator keypad">{keys.map(([label,action])=><button type="button" className={action==='equals'?'scientific-equals':undefined} key={label} aria-label={action==='backspace'?'Backspace':action==='clear'?'Clear expression':action==='equals'?'Evaluate expression':label} title={['square','factorial','reciprocal','negate'].includes(action)?'Apply to selected text or the entire expression':undefined} onMouseDown={e=>e.preventDefault()} onClick={()=>press(action)}>{label}</button>)}</div>;
}
