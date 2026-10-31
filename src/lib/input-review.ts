import type {Field,Values} from './types';
import {fhaReviewSections} from './fha-ui';
import {progressiveInputGroups} from './progressive-inputs';
import {marriageSections,marriageFieldSection} from './marriage-layout';
export type InputReviewGroup={key:string;title:string;fields:Field[]};
export function inputReviewEqual(fields:Field[],a:Values,b:Values){return fields.every(f=>{const av=a[f.key]??'',bv=b[f.key]??'';return f.type==='select'||f.type==='textarea'||f.type==='date'||!av.trim()||!bv.trim()?av===bv:Number.isFinite(Number(av))&&Number(av)===Number(bv);});}
export function inputReviewLabel(fields:Field[],values:Values,shared:Values|null=null){return shared&&inputReviewEqual(fields,values,shared)?'Shared settings':inputReviewEqual(fields,values,Object.fromEntries(fields.map(f=>[f.key,String(f.value)])))?'Using default settings':'Custom settings';}
export function inputReviewPreview(fields:Field[],values:Values){const base=Object.fromEntries(fields.map(f=>[f.key,String(f.value)]));const changed=fields.filter(f=>!inputReviewEqual([f],values,base));return [...changed,...fields.filter(f=>!changed.includes(f))].slice(0,3);}
export function inputReviewValue(f:Field,values:Values){const raw=values[f.key]??'';if(!raw.trim())return f.optional||f.type==='textarea'?'Not entered':'Not set';if(f.type==='textarea')return `${raw.trim().split(/\n/).length} row(s) entered`;if(f.type==='select'||f.type==='date')return raw;const n=Number(raw),s=Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n):raw;return f.unit==='$'?'$'+s:f.unit==='%'?s+'%':s+(f.unit?' '+f.unit:'');}
const genericTitles:Record<string,string>={'interest':'Contribution timing, tax & inflation','savings':'Deposit changes, timing, tax & inflation','investment':'Contribution timing, tax & inflation','compound-interest':'Contribution timing, tax & inflation','house-affordability':'Housing costs & affordability assumptions','debt-to-income-ratio':'Other debts & monthly payments','cash-back-or-low-interest':'Taxes, fees & incentive assumptions','estate-tax':'Estate deductions, gifts & state tax','budget':'Detailed income & expense categories'};
export function inputReviewGroups(id:string,mode:string,fields:Field[],advanced:Field[]=[]):InputReviewGroup[]{
 const group=(key:string,title:string,keys:string[]):InputReviewGroup=>({key,title,fields:keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f))});
 if(id==='coast-fire')return [];
 if(id==='fha-loan')return fhaReviewSections.map(s=>group(s.key,s.title,s.keys)).filter(g=>g.fields.length);
 if(id==='mortgage')return [
 ...(mode==='biweekly'?[]:[group('mortgage-housing','Taxes, insurance & fees',['tax','tax_unit','insurance','insurance_unit','hoa','hoa_unit','other','other_unit','tax_growth','insurance_growth','hoa_growth','other_growth']),group('mortgage-pmi','PMI & home value',['property_value','pmi_method','pmi_credit','pmi','pmi_unit','pmi_policy','pmi_years','appraised_value'])]),group('mortgage-extras','Extra payments & dates',['months','start','extra_monthly','extra_start','extra_yearly','extra_yearly_start','extra_once','extra_once_month','dated'])].filter(g=>g.fields.length);
 if(id==='marriage-tax')return marriageSections.slice(1).map(s=>({key:'marriage-'+s.id,title:s.title,fields:fields.filter(f=>marriageFieldSection(f)===s.id)})).filter(g=>g.fields.length);
 const progressive=progressiveInputGroups(id,mode);
 if(progressive)return progressive.filter(g=>g.collapsed).map(g=>group('progressive-'+g.keys[0],g.title,g.keys)).filter(g=>g.fields.length&&g.fields.every(f=>f.optional===true||(f.key==='dated'&&f.type==='textarea')));
 return advanced.length?[{key:'advanced',title:genericTitles[id]??'Additional calculation settings',fields:advanced}]:[];
}
