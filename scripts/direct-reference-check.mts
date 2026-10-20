import {calculators,defaults,runCalculation} from '../src/lib/calculators/index.ts';
import fs from 'node:fs';
function run(id,mode,inputs){const m=calculators.find(c=>c.id===id).modes.find(m=>m.id===mode);return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,String(v)]))});}
function metric(r,label){return r.metrics.find(m=>m.label===label).value;}
const loan=run('loan','amortized',{principal:100000,years:10,months:0,rate:6,compound:'Monthly',pay:'Monthly'});
const heloc=run('heloc','draw-repay',{principal:50000,rate:8,draw:5,years:15,closing:0,charge:0});
const k=run('401k','projection',{age:35,retire:36,life:90,salary:60000,contribution:6,match:50,match_limit:6,salary_growth:0,return:0});
const checks=[
 {id:'loan-visible-result',url:'https://www.calculator.net/loan-calculator.html',status:'reconstructed_inputs_only',inputs:{principal:100000,years:10,rate:6,compound:'Monthly',pay:'Monthly'},observed_source:[1110.21,133224.60,33224.60],local:[metric(loan,'Payment per period'),metric(loan,'Total payments'),metric(loan,'Total interest')],limitation:'Source form values hidden. Local inputs selected to reconstruct visible output; not same-input submission evidence.'},
 {id:'heloc-visible-schedule',url:'https://www.calculator.net/heloc-calculator.html',status:'reconstructed_inputs_only',inputs:{principal:50000,rate:8,draw:5,years:15,closing:0,charge:0},observed_source:[333.33,477.83,106008.69,56008.69],local:[metric(heloc,'Monthly draw payment'),metric(heloc,'Monthly repayment'),heloc.rows.reduce((s,r)=>s+Number(r[1]),0),metric(heloc,'Total interest')],limitation:'Principal and draw length visible in schedule; rate and repayment duration reconstructed; source fee settings hidden.'},
 {id:'401k-published-match-example',url:'https://www.calculator.net/401k-calculator.html',status:'published_rule_example',inputs:{salary:60000,contribution:6,match:50,match_limit:6},observed_source:[1800],local:[metric(k,'Employer contributions')],limitation:'Article states 50% matching up to 6% salary yields 3% salary. Salary $60,000 chosen locally; not a submitted original form.'},
 ...[5,10,20].map(net=>{const r=run('vat','any-two',{rate:10,net,gross:'',tax:''});return {id:'vat-published-example-'+net,url:'https://www.calculator.net/vat-calculator.html',status:'published_numeric_example',inputs:{net,rate:10},observed_source:[net/10],local:[metric(r,'VAT amount')],limitation:'Published article example, not submitted original form.'};})
];
for(const c of checks)c.display_differences=c.local.map((v,i)=>Number(v.toFixed(2))-c.observed_source[i]);
const report={checked_at:new Date().toISOString(),same_input_source_submissions_verified:0,full_tools_verified:0,source_access:{plain_pages:'available',custom_query_pages:'tool internal error / URL inaccessible',form_values:'hidden as [Input] / [Select]'},checks};
fs.writeFileSync('docs/financial-clone/evidence/direct-reference-check-2026-10-20.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
