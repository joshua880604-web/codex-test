import {siteName} from './site';
import {hasCalculatorWorkspace,workspaceMetrics} from './workspace-layout';
import {defaults,type Calculator,type Mode,type Result,type Values,type Metric} from './types';
export const MAX_SHARE_LENGTH=20000;
export function calculationLink(origin:string,path:string,mode:Mode,values:Values,includeInputs=false){
 const url=new URL(path,origin);url.search='';url.hash='';
 if(includeInputs){
  const params=new URLSearchParams({share_version:'1',mode:mode.id});
  for(const field of mode.fields)if(field.key!=='verified_rate')params.set(field.key,values[field.key]??'');
  url.hash='calc='+params.toString();
 }
 if(url.href.length>MAX_SHARE_LENGTH)throw new Error('These inputs are too long for a reliable share link. Share the tool page instead.');
 return url.href;
}
export function sharedInputs(calc:Calculator,search:string,hash:string){
 const fragment=hash.startsWith('#calc=');
 const raw=fragment?hash.slice(6):search.replace(/^\?/,'');
 if(!raw)return null;
 if(raw.length>MAX_SHARE_LENGTH)throw new Error('This calculation link is too long. Enter the inputs directly.');
 const params=new URLSearchParams(raw);
 if(fragment&&params.get('share_version')!=='1')throw new Error('This calculation link uses an unsupported sharing version.');
 const requested=params.get('mode'),modeId=calc.id==='compound-interest'&&!requested&&(params.has('from')||params.has('to'))?'conversion':calc.id==='currency'&&requested==='live'?'snapshot':calc.id==='vat'&&requested&&['net','gross','tax','rate'].includes(requested)?'any-two':requested;
 const mode=modeId?calc.modes.find(m=>m.id===modeId):calc.modes[0];
 if(!mode)throw new Error('The calculation mode in this link is unavailable. Choose a mode and enter the inputs again.');
 const fields=mode.fields.filter(f=>f.key!=='verified_rate');
 if(!requested&&!fields.some(f=>params.has(f.key)))return null;
 const values=defaults(mode);
 // Older FHA links explicitly entered premiums before an automatic mode existed.
 if(calc.id==='fha-loan'&&!params.has('mip_method')&&['upfront','annual_mip','mip_years'].some(key=>params.has(key)))values.mip_method='Manual';
 if((calc.id==='vat'||(calc.id==='commission'&&mode.id==='any-two'))&&fields.some(f=>params.has(f.key)))for(const f of fields)values[f.key]='';
 for(const f of fields)if(params.has(f.key))values[f.key]=params.get(f.key)!;
 return {mode,values};
}
export function summaryMetrics(id:string,result:Result,mode=''):Metric[]{
 const workspace=mode&&hasCalculatorWorkspace(id)?workspaceMetrics(id,mode,result):null;
 const metrics=id==='marriage-tax'?[...result.metrics.slice(-1),...result.metrics.slice(0,-1)]:workspace?[workspace.primary,...workspace.highlights,...workspace.details]:result.metrics;
 return metrics.slice(0,5).map((metric,index)=>id==='marriage-tax'&&index===0?{...metric,label:metric.value<-.005?'Estimated annual tax savings after marriage':metric.value>.005?'Estimated annual additional tax after marriage':'Estimated annual tax difference after marriage',value:Math.abs(metric.value)}:metric);
}
export function formatMetric(metric:Metric){
 if(metric.displayValue)return metric.displayValue+(metric.format==='percent'&&!metric.displayValue.endsWith('%')?'%':'');
 if(metric.format==='money')return new Intl.NumberFormat('en-US',{style:'currency',currency:metric.currency??'USD'}).format(metric.value);
 return new Intl.NumberFormat('en-US',{minimumFractionDigits:metric.digits??(metric.format==='percent'?4:Number.isInteger(metric.value)?0:4),maximumFractionDigits:metric.digits??(metric.format==='percent'?4:Number.isInteger(metric.value)?0:4)}).format(metric.value)+(metric.format==='percent'?'%':'');
}
export function modeCaption(mode:Mode,values:Values={}){
 const details:string[]=[];
 const year=mode.fields.find(field=>field.key==='year');
 if(year&&values.year)details.push(year.label+': '+values.year);
 if(mode.fields.some(field=>field.key==='from')&&mode.fields.some(field=>field.key==='to')&&values.from&&values.to)details.push(values.from+' → '+values.to);
 return [mode.title,...details].join(' · ');
}
export function summaryText(title:string,mode:Mode,id:string,result:Result,link:string,values:Values={}){
 return [title+" | "+siteName,modeCaption(mode,values),...(id==='irr'&&result.metrics.length>1?['Multiple IRRs detected; there is no single unambiguous rate.']:[]),...summaryMetrics(id,result,mode.id).map(m=>`${m.label}: ${formatMetric(m)}`),...(result.metrics.length>5?['Selected results; full details are available in the calculator.']:[]),...(result.notes??[]),'Calculated under the stated assumptions. Results may change if the model or data is updated.',link].join('\n');
}
