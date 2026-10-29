import type {Field,Mode,Result,Values} from './types';
import {calculationLink,modeCaption} from './sharing';
export async function shareResultPNG(id:string,title:string,path:string,mode:Mode,values:Values,result:Result,fields:Field[],includeInputs:boolean){
 const [{resultImage},{resultCardCopy},{imageMetrics,imageDetails}]=await Promise.all([import('./result-image'),import('./result-card-copy'),import('./result-image-data')]);
 return resultImage(title,modeCaption(mode,values),imageMetrics(id,mode.id,result),result.notes??[],calculationLink(location.origin,path,mode,values),resultCardCopy(id,mode.id,values,result),imageDetails(id,mode,values,result,fields,includeInputs));
}
