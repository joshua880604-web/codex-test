import { type Calculator, type Field, type Metric, type Result, type Values } from '../lib/types';
import { guardAttribution } from './attribution';

type Widget = { id: string; title: string; mainURL: string; modes: {id:string;title:string;fields:Field[]}[]; initial: Result };
const config = JSON.parse(document.getElementById('embed-data')!.textContent!) as Widget;
const form = document.querySelector<HTMLFormElement>('#embed-form')!, fieldset = document.getElementById('embed-fields')!;
const output = document.getElementById('embed-result')!, status = document.getElementById('embed-status')!;
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const modePicker = document.querySelector<HTMLSelectElement>('#embed-mode');
let active = config.modes[0], token = 0;
let model: Promise<{calc:Calculator;calculate:typeof import('../lib/calculate-mode').calculateMode}> | undefined;
function loadModel() {
  return model ??= Promise.all([
    config.id === 'roi' ? import('../lib/calculators/investment').then(m=>m.investmentCalculators.find(c=>c.id==='roi')!) : import('../lib/calculators/coast-fire').then(m=>m.coastFire),
    import('../lib/calculate-mode'),
  ]).then(([calc,m])=>({calc,calculate:m.calculateMode})).catch(()=>{model=undefined;throw new Error('The calculator could not load. Check your connection and try again, or open the full calculator.');});
}
function metricText(metric: Metric) {
  if (metric.displayValue !== undefined) return metric.displayValue;
  if (metric.format==='money') return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(metric.value);
  return new Intl.NumberFormat('en-US',{maximumFractionDigits:metric.format==='percent'?5:6}).format(metric.value)+(metric.format==='percent'?'%':'');
}
function renderResult(result: Result) {
  output.replaceChildren();
  const heading=document.createElement('h2');heading.textContent='Result · CalculatorFree.io';output.append(heading);
  const list=document.createElement('dl');list.className='metrics';
  for(const metric of result.metrics){const row=document.createElement('div'),term=document.createElement('dt'),value=document.createElement('dd');term.textContent=metric.label;value.textContent=metricText(metric);row.append(term,value);list.append(row);}output.append(list);
  if(result.notes?.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Assumptions and limitations';details.append(summary);for(const note of result.notes){const p=document.createElement('p');p.textContent=note;details.append(p);}output.append(details);}
  output.hidden=false;
}
function renderFields(){
  fieldset.replaceChildren();
  for(const field of active.fields){
    const wrap=document.createElement('div'),label=document.createElement('label');wrap.className='field';label.htmlFor='embed-'+field.key;label.textContent=field.label+(field.unit?' ('+field.unit+')':'');
    const input=field.type==='select'?document.createElement('select'):document.createElement('input');input.id=label.htmlFor;input.name=field.key;
    if(input instanceof HTMLSelectElement){for(const value of field.options??[]){const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);}}
    else {input.type=field.type==='date'?'date':'number';if(input.type==='number'){input.step=String(field.step??'any');if(field.min!==undefined)input.min=String(field.min);if(field.max!==undefined)input.max=String(field.max);}input.required=!field.optional;}
    input.value=String(field.value);wrap.append(label,input);
    if(field.hint){const hint=document.createElement('small');hint.id=input.id+'-hint';hint.textContent=field.hint;input.setAttribute('aria-describedby',hint.id);wrap.append(hint);}fieldset.append(wrap);
  }
}
function changed(){token++;submit.disabled=false;form.setAttribute('aria-busy','false');output.hidden=true;status.textContent='Inputs changed. Select Calculate to update the result.';}
form.addEventListener('input',changed);form.addEventListener('change',changed);
modePicker?.addEventListener('change',()=>{active=config.modes.find(mode=>mode.id===modePicker.value)!;renderFields();changed();});
form.addEventListener('submit',async event=>{
  event.preventDefault();const request=++token,modeId=active.id,values=Object.fromEntries(new FormData(form)) as Values;
  submit.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Calculating…';
  try{const {calc,calculate}=await loadModel();if(request!==token)return;const result=calculate(calc,modeId,values);renderResult(result);status.textContent='Calculation updated.';}
  catch(error){if(request!==token)return;output.hidden=true;status.textContent=error instanceof Error?error.message:'The calculator could not load. Check your connection and try again.';}
  finally{if(request===token){submit.disabled=false;form.setAttribute('aria-busy','false');}}
});
form.addEventListener('reset',event=>{event.preventDefault();token++;active=config.modes[0];if(modePicker)modePicker.value=active.id;renderFields();renderResult(config.initial);status.textContent='Inputs reset to example values.';submit.disabled=false;form.setAttribute('aria-busy','false');});
// Browser-native validation and the same shared model validation both remain active.
renderFields();renderResult(config.initial);submit.disabled=false;
guardAttribution(document.getElementById('embed-credit')!,config.mainURL);
