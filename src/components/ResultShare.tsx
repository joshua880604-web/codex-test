"use client";
import {useEffect,useRef,useState} from 'react';
import type {Mode,Result,Values} from '@/lib/types';
import {calculationLink,summaryMetrics,summaryText,modeCaption} from '@/lib/sharing';
export default function ResultShare({id,title,path,mode,values,result}:{id:string;title:string;path:string;mode:Mode;values:Values;result:Result}){
 const [include,setInclude]=useState(false),[status,setStatus]=useState(''),[manual,setManual]=useState(''),[exporting,setExporting]=useState(false),[local,setLocal]=useState(false);
 const textRef=useRef<HTMLTextAreaElement>(null),metrics=summaryMetrics(id,result),caption=modeCaption(mode,values);
 useEffect(()=>{setLocal(['localhost','127.0.0.1','[::1]'].includes(location.hostname));},[]);
 useEffect(()=>{if(manual){textRef.current?.focus();textRef.current?.select();}},[manual]);
 const link=()=>calculationLink(location.origin,path,mode,values,include);
 async function copy(text:string,success:string){
  setManual('');try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);setStatus(success);}catch{setManual(text);setStatus('Automatic copying is unavailable. Select and copy the text below.');}
 }
 async function copyLink(){try{await copy(link(),include?'Recalculable link copied. It includes your input values.':'Tool link copied. No input values included.');}catch(e){setStatus((e as Error).message);}}
 async function share(){try{const url=link();if(navigator.share){await navigator.share({title,url});setStatus('Share dialog completed.');}else await copy(url,'Link copied.');}catch(e){setStatus((e as Error).name==='AbortError'?'Sharing canceled.':(e as Error).message);}}
 async function copySummary(){try{await copy(summaryText(title,mode,id,result,link(),values),'Result summary copied. It contains calculation amounts.');}catch(e){setStatus((e as Error).message);}}
 async function exportImage(){
  setExporting(true);try{const [{resultImage},{resultCardCopy}]=await Promise.all([import('@/lib/result-image'),import('@/lib/result-card-copy')]);const blob=await resultImage(title,caption,metrics,[...(id==='irr'&&result.metrics.length>1?['Multiple IRRs detected; there is no single unambiguous rate.']:[]),...result.notes??[]],calculationLink(location.origin,path,mode,values),resultCardCopy(id,mode.id,values,result));
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=id+'-result.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('PNG downloaded. It contains result amounts and the tool address, without an input list.');
  }catch(e){setStatus((e as Error).message);}finally{setExporting(false);}
 }
 return <section className="share-panel" aria-label="Share result">
  <h3>Save or share this result</h3>
  <div className="result-actions"><button onClick={copySummary}>Copy result summary</button><button onClick={exportImage} disabled={exporting}>{exporting?'Creating PNG…':'Download result PNG'}</button></div>
  <p className="share-help">Summaries and images include result amounts. Review before sharing.</p>
  <details className="share-options" onToggle={e=>{if(!e.currentTarget.open){setInclude(false);setManual('');setStatus('');}}}>
   <summary>Share a link or include inputs</summary>
   <label className="share-choice"><input type="checkbox" checked={include} onChange={e=>{setInclude(e.target.checked);setStatus('');setManual('');}}/> Include current inputs in the link</label>
   <p className="share-help">{include?'Anyone with the link can read the inputs. They are stored in the address fragment, not encrypted. The receiving browser recalculates them; model updates may change results.':'Links share only this tool by default. No input values are included.'}</p>
   <div className="result-actions"><button onClick={copyLink}>Copy link</button><button onClick={share}>Share link</button></div>
   {local&&<p className="share-help">Local preview: localhost links only work on this computer. Use a hosted site address before sending links to other people.</p>}
  </details>
  {status&&<p role="status">{status}</p>}
  {manual&&<label>Copy this content<textarea ref={textRef} readOnly value={manual} rows={5}/></label>}
 </section>;
}
