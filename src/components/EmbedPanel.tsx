'use client';
import { useRef, useState } from 'react';
import { embedCode, embedHeights, embedTool, embedURL, type EmbedTheme } from '@/lib/embed-code';
export default function EmbedPanel({id}: {id: string}) {
  const tool = embedTool(id)!;
  const [theme, setTheme] = useState<EmbedTheme>('light'), [height, setHeight] = useState(tool.height);
  const [preview, setPreview] = useState(false), [status, setStatus] = useState('');
  const code = embedCode(id, theme, height), field = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus('Embed code copied.'); }
    catch { field.current?.focus(); field.current?.select(); setStatus('Select and copy the code below.'); }
  }
  const previewPath = new URL(embedURL(id, theme)).pathname + '?theme=' + theme;
  return <div className="embed-options">
    <p>Add this interactive calculator to your website. No account is needed. The embed is ad-free, uses example values and keeps its CalculatorFree.io attribution visible.</p>
    <label>Appearance <select value={theme} onChange={e=>{setTheme(e.target.value as EmbedTheme);setStatus('');}}><option value="light">Light</option><option value="dark">Dark Pro</option></select></label>
    <label>Frame height <select value={height} onChange={e=>{setHeight(Number(e.target.value));setStatus('');}}>{embedHeights.map(h=><option key={h} value={h}>{h} px</option>)}</select></label>
    <p>Width adapts to the available space. Longer results scroll inside the frame. Your current inputs are not included.</p>
    <label>Embed code<textarea ref={field} readOnly value={code} rows={6} spellCheck={false}/></label>
    <div className="result-actions"><button type="button" onClick={copy}>Copy embed code</button><button type="button" aria-expanded={preview} onClick={()=>setPreview(!preview)}>{preview?'Hide preview':'Show preview'}</button></div>
    {status&&<p role="status">{status}</p>}
    {preview&&<iframe src={previewPath} title={`${tool.title} embed preview`} width="100%" height={height} loading="lazy" referrerPolicy="no-referrer" style={{border:0,borderRadius:12}}/>}
    <p>Keep the visible attribution when embedding. Open the full calculator for detailed explanations and sources.</p>
  </div>;
}
