import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultContext,inputHint} from '../src/lib/result-context';
function run(id:string,mode:string,overrides:Record<string,string>={}) {
 const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!,v={...defaults(m),...overrides},r=runCalculation(id,mode,v);
 return {r,v,context:resultContext(id,mode,v,r),get:(label:string)=>r.metrics.find(m=>m.label===label)!.value};
}
const close=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<.005,`${actual} != ${expected}`);
test('annual loan frequency is explicit and agrees with independent annuity fixture',()=>{
 const x=run('loan','amortized',{principal:'10000',years:'2',months:'0',rate:'10',compound:'Annually',pay:'Annually'});
 close(x.get('Payment per period'),10000*.1/(1-1.1**-2));assert.match(x.context!,/payments made annually/);
});
test('compound interpretation separates principal and tax-adjusted losses',()=>{
 const x=run('compound-interest','growth',{principal:'1000',monthly:'0',annual:'0',years:'2',rate:'-10',compound:'Annually',tax:'0'});
 close(x.get('Ending balance'),810);close(x.get('Net investment earnings'),-190);assert.match(x.context!,/loss is -\$190.00/);
 assert.equal(resultContext('compound-interest','conversion',{}, {metrics:[]}),null);
});
test('retirement saving fixture independently sums 384 monthly deposits',()=>{
 const x=run('retirement','saving',{age:'35',retire:'67',target:'600000',balance:'30000',return:'6'});
 const monthly=1.06**(1/12)-1;let factor=0;for(let i=0;i<384;i++)factor+= (1+monthly)**i;
 close(x.get('Required monthly saving'),(600000-30000*1.06**32)/factor);assert.match(x.context!,/alternative plan/);
});
test('retirement explanation distinguishes deficits, surpluses and rounded zero',()=>{
 for(const [gap,phrase] of [[-10,'below'],[10,'above'],[.001,'match']] as const)assert.match(resultContext('retirement','required',{}, {metrics:[{label:'Projected surplus / shortfall',value:gap,format:'money'}]})!,new RegExp(phrase));
});
test('tax liability and refund are separate: 2025 single wages-only fixture',()=>{
 const x=run('income-tax','federal',{year:'2025',filing:'Single',wages:'50000',withheld:'5000'});
 // $50,000 less $15,750 standard deduction; first $11,925 at 10%, remainder at 12%.
 close(x.get('Estimated federal income tax'),11925*.1+(34250-11925)*.12);assert.match(x.context!,/tax year 2025/);assert.match(x.context!,/exceed/);
 const y=run('income-tax','federal',{year:'2025',filing:'Single',wages:'50000',withheld:'0'});assert.match(y.context!,/remains owed/);
});
test('unknown metric contract adds no invented interpretation; hints are mode-specific',()=>{
 assert.equal(resultContext('mortgage','monthly',{}, {metrics:[]}),null);assert.equal(inputHint('loan','bond','pay'),undefined);assert.match(inputHint('loan','amortized','pay')!,/frequency/);
});
