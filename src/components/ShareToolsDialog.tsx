'use client';
import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal,flushSync} from 'react-dom';
import dynamic from 'next/dynamic';
import type {Field,Mode,Result,Values} from '@/lib/types';
import {calculationLink,formatMetric,summaryText} from '@/lib/sharing';
import {canonicalCitationURL,citationText,resultTables,socialShareURL,tableText,type CitationFormat} from '@/lib/share-formats';
const EmbedPanel=dynamic(()=>import('./EmbedPanel'));
const tabs=['Share','Embed','Cite','Export'] as const;
type Tab=typeof tabs[number];
type Props={id:string;title:string;path:string;mode:Mode;values:Values;result:Result|null;fields:Field[];onClose:()=>void};
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export default function ShareToolsDialog({id,title,path,mode,values,result,fields,onClose}:Props){
 const [tab,setTab]=useState<Tab>('Share'),[include,setInclude]=useState(false),[status,setStatus]=useState(''),[manual,setManual]=useState(''),[format,setFormat]=useState<CitationFormat>('plain'),[tableKey,setTableKey]=useState('main'),[inputs,setInputs]=useState(false),[busy,setBusy]=useState(false),[printing,setPrinting]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),copyField=useRef<HTMLTextAreaElement>(null),tabRefs=useRef<(HTMLButtonElement|null)[]>([]);
 const [origin]=useState(()=>location.origin),[accessed]=useState(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
 useEffect(()=>{const prior=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{document.body.classList.remove('calculator-share-printing');prior?.focus();};},[]);
 useEffect(()=>{if(manual){copyField.current?.focus();copyField.current?.select();}},[manual]);
 useEffect(()=>{const after=()=>{document.body.classList.remove('calculator-share-printing');setPrinting(false);};window.addEventListener('afterprint',after);return()=>window.removeEventListener('afterprint',after);},[]);
 let link='',linkError='';try{link=calculationLink(origin,path,mode,values,include&&Boolean(result));}catch(e){linkError=(e as Error).message;}
 const citation=citationText(id,title,path,accessed,format),tables=result?resultTables(result):[],table=tables.find(t=>t.key===tableKey)??tables[0];
 function select(next:Tab){setTab(next);setStatus('');setManual('');}
 function navigate(event:KeyboardEvent<HTMLButtonElement>,index:number){let next=index;if(event.key==='ArrowRight')next=(index+1)%4;else if(event.key==='ArrowLeft')next=(index+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();select(tabs[next]);tabRefs.current[next]?.focus();}
 async function copy(text:string,message:string){setManual('');try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);setStatus(message);}catch{setManual(text);setStatus('Automatic copying is unavailable. Select and copy the content below.');}}
 async function nativeShare(){try{if(!link)throw Error(linkError);if(navigator.share)await navigator.share({title,url:link});else await copy(link,'Share link copied.');}catch(e){setStatus((e as Error).name==='AbortError'?'Sharing canceled.':(e as Error).message);}}
 async function png(){if(!result)return;setBusy(true);setStatus('');try{const {shareResultPNG}=await import('@/lib/share-png');const blob=await shareResultPNG(id,title,path,mode,values,result,fields,inputs);download(blob,id+'-result.png');setStatus(inputs?'Result PNG downloaded with input details.':'Result PNG downloaded. Input details were not included.');}catch(e){setStatus((e as Error).message);}finally{setBusy(false);}}
 function print(pdf:boolean){if(!result)return;flushSync(()=>setPrinting(true));document.body.classList.add('calculator-share-printing');setStatus(pdf?'Choose Save as PDF in your browser’s print dialog. The report includes every table row.':'The print report includes every table row.');try{window.print();}catch{document.body.classList.remove('calculator-share-printing');setPrinting(false);setStatus('Printing is unavailable. Download CSV or PNG instead.');}}
 return createPortal(<>
  <dialog className="calculator-share-dialog" ref={dialog} aria-labelledby="calculator-share-heading" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}>
   <header className="share-dialog-header"><div><h2 id="calculator-share-heading">Share calculator</h2><p>{title}</p></div><button type="button" className="share-dialog-close" aria-label="Close share dialog" onClick={onClose}>×</button></header>
   <div className="share-dialog-tabs" role="tablist" aria-label="Share calculator options">{tabs.map((name,index)=><button type="button" key={name} ref={e=>{tabRefs.current[index]=e;}} id={'share-tab-'+name.toLowerCase()} role="tab" aria-selected={tab===name} aria-controls="calculator-share-panel" tabIndex={tab===name?0:-1} onClick={()=>select(name)} onKeyDown={e=>navigate(e,index)}>{name}</button>)}</div>
   <section className="share-dialog-panel" role="tabpanel" id="calculator-share-panel" aria-labelledby={'share-tab-'+tab.toLowerCase()} tabIndex={0}>
    {tab==='Share'&&<>
     <label className="share-dialog-check"><input type="checkbox" checked={include} disabled={!result} onChange={e=>{setInclude(e.target.checked);setStatus('');setManual('');}}/> Include current calculation results</label>
     <p className="share-dialog-help">{include&&result?'This link includes your inputs so the receiving browser can recalculate. Anyone with the link can read them; model updates may change results.':'Shares the calculator page without your inputs. To share a calculation, first calculate, then choose the checkbox above.'}</p>
     <div className="share-dialog-social">{(['facebook','x','linkedin'] as const).map(site=><a key={site} href={link?socialShareURL(site,link,title):undefined} aria-disabled={!link} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">{site==='facebook'?'f':site==='x'?'𝕏':'in'}</span>{site==='facebook'?'Facebook':site==='x'?'X':'LinkedIn'}</a>)}</div>
     <label className="share-dialog-label" htmlFor="calculator-share-link">Share link</label><textarea id="calculator-share-link" readOnly value={link} rows={3} spellCheck={false}/>
     <div className="result-actions"><button type="button" disabled={!link} onClick={()=>copy(link,include?'Calculation link copied with input values.':'Calculator link copied without input values.')}>Copy link</button><button type="button" disabled={!link} onClick={nativeShare}>Share link</button></div>
     {linkError&&<p role="alert">{linkError}</p>}{origin!=='https://www.calculatorfree.io'&&<p className="share-dialog-help">Preview address: this share link uses the current site. A localhost link works only on this computer.</p>}
    </>}
    {tab==='Embed'&&<EmbedPanel id={id}/>}
    {tab==='Cite'&&<>
     <p>Cite this calculator page using its canonical address. Citations do not include your input values or calculation amounts.</p>
     <label className="share-dialog-label" htmlFor="calculator-citation-format">Citation format</label><select id="calculator-citation-format" value={format} onChange={e=>{setFormat(e.target.value as CitationFormat);setStatus('');setManual('');}}><option value="plain">Plain text</option><option value="html">HTML</option><option value="bibtex">BibTeX</option></select>
     <label className="share-dialog-label" htmlFor="calculator-citation-text">Citation text</label><textarea id="calculator-citation-text" readOnly value={citation} rows={7} spellCheck={false}/><button type="button" onClick={()=>copy(citation,'Citation copied.')}>Copy citation</button>
     <p className="share-dialog-help">Accessed {accessed}. Review the calculator’s assumptions and sources when citing a financial estimate. You may qualify the HTML link to match your publication’s policy.</p>
    </>}
    {tab==='Export'&&(result?<>
     <p>Save the current result. PNG and print reports include calculation notes; CSV and copied tables include all rows of the selected table.</p>
     <label className="share-dialog-check"><input type="checkbox" checked={inputs} onChange={e=>setInputs(e.target.checked)}/> Include input details in PNG and print/PDF</label>
     <div className="share-export-actions"><button type="button" onClick={png} disabled={busy}>{busy?'Creating PNG…':'Download result PNG'}</button><button type="button" onClick={()=>print(true)}>Save as PDF</button><button type="button" onClick={()=>print(false)}>Print report</button><button type="button" onClick={()=>copy(summaryText(title,mode,id,result,calculationLink(origin,path,mode,values),values),'Result summary copied. It contains calculation amounts.')}>Copy result summary</button></div>
     <p className="share-dialog-help">PDF uses your browser’s print dialog: choose Save as PDF. PNG is a result card, not a screenshot of the full webpage. Both are created locally.</p>
     {table?<><label className="share-dialog-label" htmlFor="calculator-export-table">Table to export</label><select id="calculator-export-table" value={table.key} onChange={e=>{setTableKey(e.target.value);setStatus('');}}>{tables.map(t=><option key={t.key} value={t.key}>{t.title} ({t.rows.length} rows)</option>)}</select><div className="result-actions"><button type="button" onClick={()=>{download(new Blob(['\uFEFF'+tableText(table,'csv')],{type:'text/csv;charset=utf-8'}),id+'-'+table.key+'.csv');setStatus('Full selected table downloaded as CSV.');}}>Download CSV</button><button type="button" onClick={()=>copy(tableText(table,'tsv'),'Full selected table copied. Paste into a spreadsheet.')}>Copy table</button></div></>:<p>No table is available for this calculation. You can save the result summary, PNG or print report.</p>}
    </>:<p>Calculate a result first to enable PNG, PDF, CSV, table copying and printing. Close this dialog to enter your values.</p>)}
    {status&&<p className="share-dialog-status" role="status">{status}</p>}
    {manual&&<label className="share-dialog-label">Copy this content<textarea ref={copyField} readOnly value={manual} rows={6}/></label>}
   </section>
  </dialog>
  {printing&&result&&<section className="calculator-share-print-root" aria-label="Calculation print report"><h1>{title}</h1><p>{mode.title} · Accessed {accessed}</p><p>{canonicalCitationURL(path)}</p><h2>Calculated results</h2><dl>{result.metrics.map(m=><div key={m.label}><dt>{m.label}</dt><dd>{formatMetric(m)}</dd></div>)}</dl>{inputs&&<><h2>Inputs used</h2><dl>{fields.filter(f=>f.key!=='verified_rate').map(f=><div key={f.key}><dt>{f.label}{f.unit?' ('+f.unit+')':''}</dt><dd>{values[f.key]}</dd></div>)}</dl></>}<h2>Calculation method</h2><p>{mode.formula}</p><h2>Assumptions and limitations</h2>{result.notes?.map((note,i)=><p key={i}>{note}</p>)}{tables.map(t=><section key={t.key}><h2>{t.title}</h2>{t.note&&<p>{t.note}</p>}{t.columns.length>8?<div className="share-print-wide-rows">{t.rows.map((row,i)=><article key={i}><h3>Row {i+1}</h3><dl>{t.columns.map((c,j)=><div key={j}><dt>{c}</dt><dd>{typeof row[j]==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:6}).format(row[j]):row[j]}</dd></div>)}</dl></article>)}</div>:<table><thead><tr>{t.columns.map((c,i)=><th key={i}>{c}</th>)}</tr></thead><tbody>{t.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:6}).format(v):v}</td>)}</tr>)}</tbody></table>}</section>)}<p>Educational estimate, not financial advice or a quote. Review the full calculator for current assumptions and sources.</p></section>}
 </>,document.body);
}
