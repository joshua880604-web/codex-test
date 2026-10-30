import type {Field,Metric,Values} from './types';
import {imageInputs,type ImageDetails} from './result-image-data';
import {isEverydayShareTool} from './share-tools';
export function summaryPNGData(id:string,values:Values,fields:Field[],data:{metrics:Metric[];notes:string[];scope?:string;copy:{interpretation:string|null;tagline:string}},includeAllInputs:boolean){
 const wanted=id==='coast-fire'?['Coast FIRE number today','Full FIRE portfolio target','Time until Coast FIRE','Current gap to Coast threshold']:[];
 const selected=wanted.length?wanted.map(label=>data.metrics.find(m=>m.label===label)!).filter(Boolean):data.metrics.slice(0,4);
 const metrics=id==='coast-fire'?selected:[...selected,...data.metrics.filter(m=>m.displayValue&&!selected.includes(m))];
 const keys=new Set(['rate','rate_a','rate_b','new_rate','return','inflation','withdrawal','tax','retire_tax','yield','frequency','compound','pay','years','months','year','days','from','to','price_growth','dividend_growth']);
 if(id==='roth-conversion-ladder')for(const key of ['age','start_year','pretax_return','roth_return','conversion_growth','spending_growth'])keys.add(key);
 let inputs=imageInputs(fields.filter(f=>includeAllInputs||keys.has(f.key)||(id!=='coast-fire'&&(f.type==='select'||f.type==='date'))),values);
 if(id==='coast-fire'&&!includeAllInputs)inputs=[{label:'Shared planning horizon',value:(Number(values.retire)-Number(values.age))+' years; '+(values.household==='Couple'?'combined household':'individual')},...inputs];
 const risk=isEverydayShareTool(id)?'Selected result highlights, not the full report. Check units, rounding and all limitations at the source.':'Selected result highlights, not the full report or financial advice. Assumed returns are not forecasts; actual costs, taxes and outcomes can differ. Review the complete model and all limitations at the source.';
 const notes=id==='coast-fire'?[...data.metrics.filter(m=>['Modeled Coast status','Age at Coast FIRE'].includes(m.label)).map(m=>m.label+': '+m.displayValue+'.'),'Today’s USD; constant returns with exact inflation adjustment. Contributions stop at the first monthly threshold crossing. Pre-retirement living costs need other funding. No market volatility, taxes, benefits or account-access model. The withdrawal input sizes a target, not a safe-rate guarantee. Highlights only; review full assumptions at the source.']:[...(data.scope?[data.scope]:[]),...(id==='drip'?['Dividend growth and price appreciation are separate; cash dividends remain part of no-DRIP wealth. Reinvesting can finish with less wealth. No live quotes, sale tax or fees.']:[]),...data.notes.filter(n=>n.startsWith('Multiple IRRs detected')),risk];
 const details:ImageDetails={inputs,includeInputs:inputs.length>0,formula:'',trend:null,layout:'summary',inputHeading:includeAllInputs?'Entered inputs':'Selected assumptions',disclosure:includeAllInputs?'all':'key'};
 return {metrics,notes,details,copy:{interpretation:data.copy.interpretation,tagline:id==='coast-fire'?'Calculation snapshot · Today’s USD':'Calculation snapshot · Selected highlights'}};
}
