// Reproduce the published deterministic scenario grids with the existing engines.
import fs from 'node:fs/promises';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const mode=(id:string,mid:string)=>calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mid)!;
const base=(id:string,mid:string)=>defaults(mode(id,mid));
const metric=(r:ReturnType<typeof runCalculation>,label:string)=>r.metrics.find(m=>m.label===label)!;
const coast=[];
for(const nominal of [5,7,9])for(const inflation of [2,2.5,3,3.5,4]){
 const values={...base('coast-fire','coast'),return:String(nominal),inflation:String(inflation)},r=runCalculation('coast-fire','coast',values);
 coast.push({nominal,inflation,values,threshold:metric(r,'Coast FIRE number today').value,realReturn:metric(r,'Real annual return assumption').value});
}
const brrrr=[];
for(const arv of [225000,250000,275000,300000])for(const rate of [6,7,8]){
 const values={...base('brrrr','deal'),arv:String(arv),refi_rate:String(rate)},r=runCalculation('brrrr','deal',values),coc=metric(r,'Post-refinance cash-on-cash return');
 brrrr.push({arv,rate,values,cashBefore:metric(r,'Cash invested before refinance').value,cashLeft:metric(r,'Cash remaining in deal (signed)').value,payment:metric(r,'Monthly refinance principal and interest').value,cashFlow:metric(r,'Monthly cash flow after reserve').value,loan:metric(r,'New refinance loan amount').value,coc:coc.displayValue?null:coc.value});
}
const roas=[];
for(const margin of [20,30,40,50])for(const multiple of [2,3,4,5,6]){
 const actualValues={...base('roas','actual'),revenue:'12000',spend:String(12000/multiple)},thresholdValues={...base('roas','break-even'),revenue:'12000',contribution_margin:String(margin)},a=runCalculation('roas','actual',actualValues),b=runCalculation('roas','break-even',thresholdValues);
 const spend=metric(a,'Advertising spend').value,contribution=metric(b,'Contribution before advertising').value-spend;
 roas.push({margin,multiple,actualValues,thresholdValues,spend,breakEven:metric(b,'Break-even ROAS (multiple)').value,postAdDollars:contribution,postAdMargin:contribution/12000*100});
}
const data={checkedOn:'2026-10-30',kind:'Deterministic model sensitivity analysis; not observed market, user or historical data',coast,brrrr,roas};
await fs.writeFile('src/lib/model-study-data.json',JSON.stringify(data,null,2)+'\n');
function csv(name:string,columns:string[],rows:(string|number|null)[][]){return fs.writeFile('public/data/'+name+'.csv','\uFEFF'+[['Model checked on','Data type',...columns],...rows.map(row=>['2026-10-30','Hypothetical deterministic scenario; not observed data',...row])].map(row=>row.map(v=>'"'+String(v===null?'Not applicable':v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n');}
await csv('coast-fire-inflation-sensitivity',['Nominal return (%)','Inflation (%)','Real return (%)','Coast threshold (today USD)','Current age','Retirement age','Annual portfolio-funded spending (today USD)','Withdrawal assumption (%)'],coast.map(r=>[r.nominal,r.inflation,r.realReturn,r.threshold,35,65,40000,4]));
await csv('brrrr-refinance-cash-flow',['ARV (USD)','Refinance annual rate (%)','LTV (%)','Cash before refinance (USD)','New loan (USD)','Cash remaining (USD)','Monthly principal and interest (USD)','Monthly cash flow after reserve (USD)','Annual cash-on-cash (%)'],brrrr.map(r=>[r.arv,r.rate,75,r.cashBefore,r.loan,r.cashLeft,r.payment,r.cashFlow,r.coc]));
await csv('roas-contribution-margin',['Pre-ad contribution margin (%)','Actual ROAS (multiple)','Revenue (USD)','Ad spend (USD)','Break-even ROAS (multiple)','Post-ad contribution (USD)','Post-ad contribution margin (%)'],roas.map(r=>[r.margin,r.multiple,12000,r.spend,r.breakEven,r.postAdDollars,r.postAdMargin]));
console.log('Generated15Coast+12BRRRR+20ROAS=47modelcases and3CSVfiles.');
