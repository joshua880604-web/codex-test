import type {ReactNode} from 'react';
import type {Field,Values,Result} from '@/lib/types';
import {fhaReviewSections,fhaDisplayedTerms,fhaMonthlyBreakdown} from '@/lib/fha-ui';
import InputReviewSummary from './InputReviewSummary';
const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
export default function FhaLoanFields({fields,values,renderField,sharedValues=null}:{fields:Field[];values:Values;renderField:(f:Field)=>ReactNode;sharedValues?:Values|null}){
 const selected=(keys:string[])=>keys.map(k=>fields.find(f=>f.key===k)).filter((f):f is Field=>Boolean(f));
 const rows=(keys:string[])=>keys.map(key=>{if(['down_unit','tax_unit','insurance_unit'].includes(key))return null;const f=fields.find(f=>f.key===key);if(!f)return null;const unit=fields.find(f=>f.key===key+'_unit');return unit&&['down','tax','insurance'].includes(key)?<div className={key==='down'?'mortgage-down-pair':'fha-cost-pair'} key={key}>{renderField(f)}{renderField(unit)}</div>:renderField(f);});
 const group=(title:string,keys:string[])=><fieldset className="planning-fields"><legend>{title}</legend>{rows(keys)}</fieldset>;
 const terms=fhaDisplayedTerms(values);
 return <div className="fha-loan-fields">
 {group('Your FHA loan',['price','down','down_unit','years','rate'])}
 <p className="result-note">Starting example: 3.5% down. Adjust the inputs for your situation; these are not lender quotes or an eligibility decision.</p>
 <fieldset className="planning-fields"><legend>FHA mortgage insurance</legend>{selected(['mip_method']).map(f=>renderField(f))}
 <div className="fha-premium-preview" aria-label="MIP terms for your current inputs">{terms?terms.base===0?<p>No loan balance: this model charges no FHA MIP.</p>:<><dl><div><dt>Upfront MIP</dt><dd>{terms.upfrontPercent}%</dd></div><div><dt>Annual MIP rate</dt><dd>{terms.annualPercent}%</dd></div><div><dt>MIP duration</dt><dd>{terms.durationMonths/12} years</dd></div></dl><p>{usd(terms.upfrontAmount)} upfront MIP is financed into the loan. Annual MIP is collected monthly and can change each mortgage year.</p></>:<p>Review the loan and premium inputs to see the applicable MIP terms.</p>}</div>
 {selected(['upfront','annual_mip','mip_years']).map(f=>renderField(f))}
 </fieldset>
 {group('Property tax & home insurance',['tax','tax_unit','insurance','insurance_unit'])}
 {fhaReviewSections.map(section=>{const list=selected(section.keys);return list.length?<details className="input-review" data-input-review={section.key} key={section.key}><summary><InputReviewSummary title={section.title} fields={list} values={values} shared={sharedValues}/></summary><div className="fha-extra-inputs">{list.map(f=>renderField(f))}</div></details>:null;})}
 </div>;
}
export function FhaMonthlyBreakdown({values,result}:{values:Values;result:Result}){
 const data=fhaMonthlyBreakdown(values,result);
 return <section className="fha-payment-breakdown" aria-label="First monthly outlay breakdown"><h3>Your first monthly outlay</h3><table><thead><tr><th scope="col">Component</th><th scope="col">Amount</th></tr></thead><tbody>{data.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th><td>{usd(row.value)}</td></tr>)}</tbody><tfoot><tr><th scope="row">Initial monthly total</th><td>{usd(data.total)}</td></tr></tfoot></table><p>Based on entered costs. Future tax, insurance and MIP amounts can change. Extra principal, when entered for the first payment, is listed separately.</p>{data.upfront>0&&<p>Upfront MIP of <strong>{usd(data.upfront)}</strong> is already included in the <strong>{usd(data.principal)}</strong> financed balance. It is not an additional monthly charge.</p>}</section>;
}
