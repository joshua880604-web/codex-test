import type {Field,Mode,Result,Values} from './types';
import {calculationLink,modeCaption} from './sharing';
export async function shareResultPNG(id:string,title:string,path:string,mode:Mode,values:Values,result:Result,fields:Field[],includeInputs:boolean,layout:'summary'|'detailed'='detailed'){
 const [{resultImage},{resultExportData},{imageDetails}]=await Promise.all([import('./result-image'),import('./result-export'),import('./result-image-data')]);
 const data=await resultExportData(id,mode,values,result);
 if(layout==='summary'){const {summaryPNGData}=await import('./summary-png');const summary=summaryPNGData(id,values,fields,data,includeInputs);return resultImage(title,modeCaption(mode,values)+' · Key results',summary.metrics,summary.notes,calculationLink(location.origin,path,mode,values),summary.copy,summary.details);}
 return resultImage(title,modeCaption(mode,values),data.metrics,data.notes,calculationLink(location.origin,path,mode,values),data.copy,imageDetails(id,mode,values,result,fields,includeInputs));
}
