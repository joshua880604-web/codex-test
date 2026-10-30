import type {Mode,Result,Values} from './types';
// Loaded only for an image/print export. Legacy and enhanced sharing keep the
// same financial explanations, including the 401(k) story and IRR ambiguity.
export async function resultExportData(id:string,mode:Mode,values:Values,result:Result){
 const [{imageMetrics},{resultCardCopy}]=await Promise.all([import('./result-image-data'),import('./result-card-copy')]);
 const metrics=imageMetrics(id,mode.id,result);
 let notes=[...(id==='irr'&&result.metrics.length>1?['Multiple IRRs detected; there is no single unambiguous rate.']:[]),...result.notes??[]];
 let copy=resultCardCopy(id,mode.id,values,result);
 if(id==='401k'&&mode.id==='projection'){
  const {retirementStory}=await import('./retirement-story');const story=retirementStory(values,result);
  if(story){const growth=story.parts.at(-1)!;metrics.push({label:growth.label,value:growth.value,format:'money'});copy={...copy,interpretation:story.cardInterpretation};notes=[...notes,'Illustration only. Before tax, with constant returns, full vesting and no fees. See the tool for contribution limits and timing assumptions.'];}
 }
 return {metrics,notes,copy};
}
