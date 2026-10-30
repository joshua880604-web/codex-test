import {calculatorScope} from './calculator-scope';
import type {Mode,Result,Values} from './types';
// Loaded only for an image/print export. Legacy and enhanced sharing keep the
// same financial explanations, including the 401(k) story and IRR ambiguity.
export async function resultExportData(id:string,mode:Mode,values:Values,result:Result){
 const [{imageMetrics},{resultCardCopy}]=await Promise.all([import('./result-image-data'),import('./result-card-copy')]);
 const metrics=imageMetrics(id,mode.id,result);
 let notes=[...(id==='irr'&&result.metrics.length>1?['Multiple IRRs detected; there is no single unambiguous rate.']:[]),...result.notes??[]];
 if(id==='rental-property'){const roots=result.metrics.filter(m=>/^Annual IRR \d+$/.test(m.label));if(roots.length>1)notes.unshift('Multiple IRRs detected; this rental cash-flow path has more than one annual internal rate of return. Review every solution; none is automatically the correct investment return.');else if(roots.length===0)notes.unshift('No annual IRR found for this modeled rental cash-flow path. Profit and cash flow do not imply that an IRR exists.');}
 let copy=resultCardCopy(id,mode.id,values,result);
 if(id==='401k'&&mode.id==='projection'){
  const {retirementStory}=await import('./retirement-story');const story=retirementStory(values,result);
  if(story){const growth=story.parts.at(-1)!;metrics.push({label:growth.label,value:growth.value,format:'money'});copy={...copy,interpretation:story.cardInterpretation};notes=[...notes,'Illustration only. Before tax, with constant returns, full vesting and no fees. See the tool for contribution limits and timing assumptions.'];}
 }
 return {metrics,notes,copy,scope:calculatorScope(id,mode.id,values)};
}
