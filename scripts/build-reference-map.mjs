import fs from 'node:fs/promises';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators/index.ts';
const doc='docs/financial-clone';const research=[];
const provenance=JSON.parse(await fs.readFile(`${doc}/research/internal-reference-provenance.json`,'utf8'));
const researchSources=new Map(provenance.catalog.map(item=>[item.id,item.source_url]));
for(const name of ['property-auto','invest-retire','tax-other']){const data=JSON.parse(await fs.readFile(`${doc}/research/${name}.json`,'utf8'));research.push(...(data.tools??data.calculators));}
const extensions={'compound-interest':['growth'],savings:['goal-contribution','goal-time'],heloc:['maximum-credit'],'take-home-paycheck':['paycheck'],repayment:['extra-payments']};
const entries=calculators.filter(c=>c.category!=='Everyday Tools').map(c=>{
 const original=research.find(r=>r.id===c.id);if(!original)throw new Error('Missing original entry '+c.id);
 return {id:c.id,title:c.title,source_url:researchSources.get(c.id),local_route:routeFor(c.id),category:c.category,directory:!!c.directory,
  source_research_date:original.fetched_at??'2026-10-19',source_observed_function_groups:original.modes,source_observed_inputs:original.fields,source_observed_outputs:original.outputs,
  implementation_policy:c.directory?'directory':'Reference-informed independent calculations; expert fallback explicitly authorized where source behavior is not observable',reference_form_result_parity:'unverified',source_default_values_and_select_options:'unverified',
  modes:c.modes.map(m=>{let result;try{result=runCalculation(c.id,m.id,defaults(m));}catch(error){if(!(c.id==='currency'&&m.id==='live'))throw error;}
   return {id:m.id,title:m.title,role:extensions[c.id]?.includes(m.id)?'preserved additional tool':'corresponding calculation or expert fallback',description:m.description,formula:m.formula,inputs:m.fields.map(f=>({key:f.key,label:f.label,type:f.type??'number',unit:f.unit??null,options:f.options??null})),output_labels:result?.metrics.map(x=>x.label)??[],schedule_columns:result?.columns??[],yearly_columns:result?.annualColumns??[],assumptions:result?.notes??[],local_default_execution:result?'passed':'requires live exchange-rate data; manual and dated snapshot modes remain available'};
  }),
  source_limits:original.limits??'Original interactive results not observed',
 };
});
if(entries.length!==71||entries.filter(e=>!e.directory).length!==70)throw new Error('Original scope mismatch');
await fs.writeFile(`${doc}/reference-function-map.json`,JSON.stringify({generated_at:new Date().toISOString(),scope:'71 original financial entries, 70 calculators and one real estate directory; everyday tools excluded',source_entry_count:71,working_calculator_count:70,local_financial_modes:entries.reduce((n,e)=>n+e.modes.length,0),exact_source_form_comparisons:0,policy:'Do not count expert fallback or local smoke tests as verified source equivalence.',entries},null,2)+'\n');
// Refresh implementations without discarding prior research status.
const inventory=JSON.parse(await fs.readFile(`${doc}/inventory.json`,'utf8'));
for(const entry of inventory){const c=calculators.find(c=>c.id===entry.id);if(c)entry.implemented_modes=c.modes.map(m=>({id:m.id,title:m.title,fields:m.fields.map(f=>({key:f.key,label:f.label,type:f.type??'number',unit:f.unit??null})),formula:m.formula}));}
await fs.writeFile(`${doc}/inventory.json`,JSON.stringify(inventory,null,2)+'\n');
console.log({entries:entries.length,calculators:70,financial_modes:entries.reduce((n,e)=>n+e.modes.length,0),all_modes:calculators.reduce((n,c)=>n+c.modes.length,0)});
for(const entry of entries){
 const path=`${doc}/specs/${entry.id}.md`, marker='\n## Current functional correspondence — 2026-10-20\n';
 const old=await fs.readFile(path,'utf8').catch(()=>`# ${entry.title}\n`);
 let section=marker+`\nSource: ${entry.source_url}\n\nCurrent policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.\n`;
 for(const mode of entry.modes)section+=`\n### ${mode.title} (${mode.id})\n\nLocal inputs: ${mode.inputs.map(f=>f.key).join(', ')}.\n\nLocal formula: ${mode.formula}\n\nLocal default outputs: ${mode.output_labels.join('; ')||mode.local_default_execution}.\n`;
 await fs.writeFile(path,old.split(marker)[0]+section);
}
