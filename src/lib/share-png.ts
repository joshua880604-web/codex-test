import type {Field,Mode,Result,Values} from './types';
import {calculationLink,modeCaption} from './sharing';
export async function shareResultPNG(id:string,title:string,path:string,mode:Mode,values:Values,result:Result,fields:Field[],includeInputs:boolean){
 const [{resultImage},{resultExportData},{imageDetails}]=await Promise.all([import('./result-image'),import('./result-export'),import('./result-image-data')]);
 const data=await resultExportData(id,mode,values,result);
 return resultImage(title,modeCaption(mode,values),data.metrics,data.notes,calculationLink(location.origin,path,mode,values),data.copy,imageDetails(id,mode,values,result,fields,includeInputs));
}
