import { useEffect, useRef, type ReactNode } from 'react';
import type { Field, Values } from '@/lib/types';
import { marriageSections, marriageFieldSection } from '@/lib/marriage-layout';
export default function MarriageFields({fields, values, renderField}: {fields: Field[]; values: Values; renderField:(field: Field, person?: string)=>ReactNode}) {
  const root=useRef<HTMLDivElement>(null);
  const autoOpened=useRef(false);
  useEffect(() => {
    if (autoOpened.current || !window.location.search) return;
    const query=new URLSearchParams(window.location.search);
    const supplied=fields.filter(f=>query.has(f.key));
    if (!supplied.length || !supplied.every(f=>values[f.key]===query.get(f.key))) return;
    autoOpened.current=true;
    for (const section of marriageSections.slice(1)) {
      const changed=fields.some(f=>marriageFieldSection(f)===section.id && values[f.key]!==undefined && values[f.key]!==String(f.value));
      if(changed) { const details=root.current?.querySelector<HTMLDetailsElement>(`[data-section="${section.id}"]`); if(details) details.open=true; }
    }
  },[fields,values]);
  function rows(section: string) {
    const own=fields.filter(f=>!f.key.startsWith('p2_') && !['year','filing1','filing2'].includes(f.key) && marriageFieldSection(f)===section);
    const pairs=section==='basic' ? [{key:'filing1',label:'Filing status before marriage'},...own] : own;
    return <>
      <div className="marriage-columns" aria-hidden="true"><span>Information</span><strong>You</strong><strong>Partner</strong></div>
      {pairs.map(f=>{
        const first=fields.find(x=>x.key===f.key)!;
        const partner=fields.find(x=>x.key===(f.key==='filing1'?'filing2':'p2_'+f.key))!;
        const rawLabel=f.key==='filing1'?f.label:first.label.replace(/^You · (Your )?/, '');
        const label=rawLabel.charAt(0).toUpperCase()+rawLabel.slice(1);
        return <div className="marriage-pair" key={f.key}>
          <div className="marriage-row-title" aria-hidden="true">{label}</div>
          {renderField({...first,label:'You · '+label}, 'You')}
          {renderField({...partner,label:'Partner · '+label}, 'Partner')}
        </div>;
      })}
    </>;
  }
  return <div ref={root} className="marriage-fields">
    <p className="marriage-help">Compare two unmarried federal returns with one married-joint return. All money amounts are annual USD. This estimates federal income tax, not state or local tax.</p>
    {renderField(fields.find(f=>f.key==='year')!)}
    <fieldset className="marriage-basic"><legend>Your household</legend>{rows('basic')}<p className="marriage-help">{marriageSections[0].description}</p></fieldset>
    <p className="marriage-help">Only wages and a standard deduction? You can calculate now. Open the sections below when other income, deductions or credits apply. Defaults are zero or No.</p>
    {marriageSections.slice(1).map(section=><details className="advanced marriage-section" key={section.id} data-section={section.id}>
      <summary>{section.title}</summary><p className="marriage-help">{section.description}</p>{rows(section.id)}
    </details>)}
  </div>;
}
