'use client';
import {useRef,useState} from 'react';
import {citationText} from '@/lib/share-formats';
function plainSnippet(region:HTMLElement){
 return Array.from(region.children).map(node=>{
  const clone=node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('a').forEach(link=>link.replaceWith(`${link.textContent} (${link.getAttribute('href')})`));
  return clone.tagName==='UL'?Array.from(clone.children).map(li=>'- '+li.textContent).join('\n'):clone.textContent;
 }).join('\n\n');
}
// Read the static editorial region only. No calculator state, URL payload or storage.
export default function BlogSnippetCopy({id,title,path}:{id:string;title:string;path:string}){
 const [status,setStatus]=useState(''),[manual,setManual]=useState('');const fallback=useRef<HTMLTextAreaElement>(null);
 async function copy(kind:'plain'|'html'|'citation'|'citation-html'){
  const region=document.getElementById('blog-snippet-content');if(!region)return;
  const date=new Date(),accessed=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const text=kind==='plain'?plainSnippet(region):kind==='html'?region.innerHTML:citationText(id,title,path,accessed,kind==='citation'?'plain':'html');
  setManual('');try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);setStatus(kind.startsWith('citation')?'Citation copied with today’s access date.':'Editorial text copied. It does not include your calculation inputs or results.');}
  catch{setManual(text);setStatus('Automatic copying is unavailable. Select and copy the text below.');}
 }
 return <div className="blog-snippet-controls"><div className="blog-snippet-actions"><button type="button" onClick={()=>copy('plain')}>Copy text</button><button type="button" onClick={()=>copy('html')}>Copy HTML</button><button type="button" onClick={()=>copy('citation')}>Copy citation</button><button type="button" onClick={()=>copy('citation-html')}>Copy HTML citation</button></div><p role="status" aria-live="polite">{status}</p>{manual&&<label>Copy this content<textarea ref={fallback} readOnly value={manual} rows={8} onFocus={e=>e.currentTarget.select()}/><button type="button" onClick={()=>{fallback.current?.focus();fallback.current?.select();}}>Select text</button></label>}</div>;
}
