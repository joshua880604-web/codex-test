import {siteName} from './site';
import type {Result,Values} from './types';
import {resultContext} from './result-context';

export function resultCardCopy(id:string,mode:string,values:Values,result:Result){
 const sensitive=result.metrics.some(m=>m.value<-.005&&/earnings|growth|surplus|shortfall|gain|return|balance/i.test(m.label));
 const tax=['income-tax','marriage-tax','estate-tax','take-home-paycheck','sales-tax','vat'].includes(id);
 const tagline=sensitive?'Clear numbers help you consider your next step.':tax?'A little clarity makes planning easier.':
  ['percentage','tip-bill-split','date','unit-converter'].includes(id)?'The numbers did the heavy lifting.':
  id==='scientific'?'Less guessing. More knowing.':
  ['savings','compound-interest','interest','investment','cd','roth-ira','ira'].includes(id)?'Make room for your next goal.':
  ['retirement','401k','pension','annuity','annuity-payout','rmd'].includes(id)?'A clearer view. A more thoughtful plan.':
  'A clearer plan starts with clearer numbers.';
 const interpretation=resultContext(id,mode,values,result)??
  (id==='irr'&&result.metrics.length>1?'These cash flows have multiple internal rates of return. No single rate is an unambiguous investment return.':
   id==='scientific'?'Calculated using the selected angle setting and expression. Check the expression and units before applying the result.':
   id==='vat'?'Net amount excludes VAT; gross amount includes VAT. The tax amount is the difference between them.':null);
 return {interpretation,tagline};
}
export function resultCardAddress(toolURL:string){
 const url=new URL(toolURL);const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 return {url:url.origin+url.pathname,label:local?'LOCAL PREVIEW • '+siteName:url.host===siteName?siteName:url.host+' • '+siteName};
}
