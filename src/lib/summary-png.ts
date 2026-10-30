import type {Field,Metric,Values} from './types';
import {imageInputs,type ImageDetails} from './result-image-data';
import {isEverydayShareTool} from './share-tools';
export function summaryPNGData(id:string,values:Values,fields:Field[],data:{metrics:Metric[];notes:string[];scope?:string;copy:{interpretation:string|null;tagline:string}},includeAllInputs:boolean){
 const adapted:Record<string,string[]>={
  'roth-conversion-ladder':['Bridge cash required for this modeled path','Additional bridge cash needed','Estimated conversion tax','Ending bridge cash','Modeled funding status','First conversion five-tax-year date'],
  'rental-property':['Initial cash investment','First-year cash flow','First-year cash-on-cash','Net sale proceeds','Total investment profit'],
  'house-hacking':['Monthly net housing cash cost','Monthly budget difference versus renting','Initial cash required','Effective monthly tenant rent'],
  noi:['Annual net operating income','Effective annual operating income','Annual operating expenses','Annual vacancy and collection loss']
 };
 const wanted=adapted[id]??(id==='coast-fire'?['Coast FIRE number today','Full FIRE portfolio target','Time until Coast FIRE','Current gap to Coast threshold']:[]);
 const selected=wanted.length?wanted.map(label=>data.metrics.find(m=>m.label===label)!).filter(Boolean):data.metrics.slice(0,4);
 const metrics=id==='coast-fire'||id==='roth-conversion-ladder'?selected:[...selected,...data.metrics.filter(m=>m.displayValue&&!selected.includes(m))];
 if(id==='roth-conversion-ladder')metrics.push(...data.metrics.filter(m=>m.value>0&&['Unfunded conversion tax','Unfunded living costs','Planned conversions not completed due to account balance'].includes(m.label)));
 if(id==='rental-property')metrics.push(...data.metrics.filter(m=>/^Annual IRR \d+$/.test(m.label)&&!metrics.includes(m))); 
 const keys=new Set(['rate','rate_a','rate_b','new_rate','return','inflation','withdrawal','tax','retire_tax','yield','frequency','compound','pay','years','months','year','days','from','to','price_growth','dividend_growth']);
 if(id==='cap-rate')for(const key of ['value','noi','target','period'])keys.add(key);
 if(id==='credit-card-minimum-payment')for(const key of ['principal','minimum','floor','extra','interest_extra'])keys.add(key);
 if(id==='roth-conversion-ladder')for(const key of ['age','start_year','pretax','bridge','roth_basis','conversion','spending','pretax_return','roth_return','conversion_growth','spending_growth'])keys.add(key);
 if(id==='drip')for(const key of ['initial','price','monthly'])keys.add(key);
 if(id==='cash-on-cash-return')for(const f of fields)keys.add(f.key);
 if(id==='house-hacking')for(const key of ['price','loan','vacancy','current_rent'])keys.add(key);
 if(id==='rental-property')for(const key of ['price','financed','down','hold','rent','vacancy','management','rent_growth','other_income_growth','tax_growth','insurance_growth','hoa_growth','maintenance_growth','other_growth','appreciation','sale_known','sale_price','selling'])keys.add(key);
 if(id==='noi')for(const f of fields)keys.add(f.key);
 let inputs=imageInputs(fields.filter(f=>{
  if(includeAllInputs)return true;
  if(id==='rental-property'&&((f.key==='sale_price'&&values.sale_known!=='Yes')||(f.key==='appreciation'&&values.sale_known==='Yes')||(['rate','years','down'].includes(f.key)&&values.financed==='No')))return false;
  return keys.has(f.key)||(id!=='coast-fire'&&(f.type==='select'||f.type==='date'));
 }),values);
 if(id==='house-hacking'&&!includeAllInputs){const count=data.metrics.find(m=>m.label==='Rented spaces entered (owner excluded)');if(count)inputs.push({label:'Tenant spaces (names omitted)',value:String(count.value)});}
 if(id==='coast-fire'&&!includeAllInputs)inputs=[{label:'Shared planning horizon',value:(Number(values.retire)-Number(values.age))+' years; '+(values.household==='Couple'?'combined household':'individual')},...inputs];
 const risk=isEverydayShareTool(id)?'Selected result highlights, not the full report. Check units, rounding and all limitations at the source.':'Selected result highlights, not the full report or financial advice. Assumed returns are not forecasts; actual costs, taxes and outcomes can differ. Review the complete model and all limitations at the source.';
 const notes=id==='coast-fire'?[...data.metrics.filter(m=>['Modeled Coast status','Age at Coast FIRE'].includes(m.label)).map(m=>m.label+': '+m.displayValue+'.'),'Today’s USD; constant returns with exact inflation adjustment. Contributions stop at the first monthly threshold crossing. Pre-retirement living costs need other funding. No market volatility, taxes, benefits or account-access model. The withdrawal input sizes a target, not a safe-rate guarantee. Highlights only; review full assumptions at the source.']:[...(data.scope?[data.scope]:[]),...(id==='roth-conversion-ladder'?['Each conversion has a separate five-tax-year clock. Tax bills use outside cash; earnings and unseasoned principal do not fill a spending gap. Review the full cohort schedule before using a date.']:[]),...(id==='cash-on-cash-return'?['Cash yield divides annual cash flow by cash invested. A zero or negative cash basis does not define a positive percentage return; principal paydown is not cash income.']:[]),...(id==='house-hacking'?['Only entered tenant spaces generate rent; the owner’s own space is excluded. Upfront cash and monthly budget differences are separate, not total ROI.']:[]),...(id==='rental-property'?['Annual cash flow is before owner income tax. Sale proceeds and holding-period IRR include a separate terminal sale; none is an annual cash yield or guaranteed outcome.']:[]),...(id==='noi'?['NOI excludes financing, capital replacements and owner income tax. Monthly/annual period selection reinterprets inputs; it does not convert existing entries.']:[]),...(id==='cap-rate'?['Target-rate values assume unchanged annual NOI. A high cap rate alone does not establish a good investment.']:[]),...(id==='credit-card-minimum-payment'?['The payment rule, APR and extra amount stay constant; the total payment can decline with the balance. Actual statement amounts may differ.']:[]),...(id==='drip'?['Dividend growth and price appreciation are separate; cash dividends remain part of no-DRIP wealth. Reinvesting can finish with less wealth. No live quotes, sale tax or fees.']:[]),...data.notes.filter(n=>n.startsWith('Multiple IRRs detected')||(id==='rental-property'&&n.startsWith('No annual IRR found'))),risk];
 const allInputsShown=fields.every(f=>inputs.some(i=>i.label===f.label));
 const details:ImageDetails={inputs,includeInputs:inputs.length>0,formula:'',trend:null,layout:'summary',inputHeading:includeAllInputs||allInputsShown?'Entered inputs':'Selected assumptions',disclosure:includeAllInputs||allInputsShown?'all':'key'};
 return {metrics,notes,details,copy:{interpretation:data.copy.interpretation,tagline:id==='coast-fire'?'Calculation snapshot · Today’s USD':'Calculation snapshot · Selected highlights'}};
}
