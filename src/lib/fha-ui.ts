import {fhaMipTerms} from './fha-mip';
import type {Values,Result} from './types';
export const fhaReviewSections=[
 {key:'fha-timing',title:'Loan dates, extra months & appraisal',keys:['months','start','appraised_value']},
 {key:'fha-other-costs',title:'HOA & other housing costs',keys:['hoa','hoa_unit','other','other_unit']},
 {key:'fha-growth',title:'Annual housing cost increases',keys:['tax_growth','insurance_growth','hoa_growth','other_growth']},
 {key:'fha-extra',title:'Extra principal payments',keys:['extra_monthly','extra_start','extra_yearly','extra_yearly_start','extra_once','extra_once_month','dated']}
];
export function fhaDisplayedTerms(v:Values){
 try{const price=Number(v.price),down=v.down_unit==='Dollars'?Number(v.down):price*Number(v.down)/100,base=price-down,months=Number(v.years)*12+Number(v.months);const appraisal=String(v.appraised_value??'').trim()?Math.min(price,Number(v.appraised_value)):price;
 if(!['price','down','years','months'].every(k=>String(v[k]??'').trim())||![price,down,base,months,appraisal].every(Number.isFinite)||price<=0||base<0||down<0||months<1||!Number.isInteger(months))return null;
 const terms=v.mip_method==='Manual'?{upfrontPercent:Number(v.upfront),annualPercent:Number(v.annual_mip),durationMonths:Number(v.mip_years)*12}:fhaMipTerms(base,appraisal,months);
 if(v.mip_method==='Manual'&&!['upfront','annual_mip','mip_years'].every(k=>String(v[k]??'').trim()))return null;
 if(![terms.upfrontPercent,terms.annualPercent,terms.durationMonths].every(n=>Number.isFinite(n)&&n>=0)||!Number.isInteger(terms.durationMonths))return null;
 return {base,upfrontPercent:base===0?0:terms.upfrontPercent,annualPercent:base===0?0:terms.annualPercent,durationMonths:base===0?0:Math.min(months,terms.durationMonths),upfrontAmount:Math.round(base*terms.upfrontPercent)/100};
 }catch{return null;}
}
export function fhaMonthlyBreakdown(v:Values,result:Result){
 const get=(label:string)=>result.metrics.find(m=>m.label===label)?.value??0;
 const first=result.rows?.[0],paid=first?Number(first[2]):0,scheduled=Math.min(paid,get('Monthly principal & interest'));
 const costs=(key:string)=>((v[key+'_unit']==='Percent of home value'?Number(v.price)*Number(v[key])/100:Number(v[key]))/12);
 const rows=[{label:'Principal & interest',value:scheduled},{label:'FHA mortgage insurance (MIP)',value:get('Initial monthly FHA MIP')},{label:'Property tax',value:costs('tax')},{label:'Home insurance',value:costs('insurance')},{label:'HOA fees',value:costs('hoa')},{label:'Other ownership costs',value:costs('other')}];
 const extra=Math.max(0,paid-scheduled);if(extra>0.000001)rows.push({label:'Extra principal in the first payment',value:extra});
 const total=get('Initial monthly total'),rounded=rows.map(r=>({...r,value:Math.round(r.value*100)/100}));
 const difference=Math.round(total*100)-rounded.reduce((sum,r)=>sum+Math.round(r.value*100),0);if(difference)rounded.push({label:'Rounding adjustment',value:difference/100});
 return {rows:rounded,total,upfront:get('Upfront fee'),principal:get('Financed loan amount')};
}
