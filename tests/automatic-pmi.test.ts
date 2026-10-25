import test from 'node:test';
import assert from 'node:assert/strict';
import {automaticPmiPremium,estimateMortgagePmi,mortgagePmiFieldVisible,pmiCreditBands} from '../src/lib/mortgage-pmi';
import rates from '../src/lib/mortgage-pmi-rates.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {runClientCalculation} from '../src/lib/calculate-client';
import {resultTrend} from '../src/lib/result-trend';
import {resultContext} from '../src/lib/result-context';
const c=calculators.find(c=>c.id==='mortgage')!,m=c.modes[0];
const inputs=(v:Record<string,string|number>={})=>({...defaults(m),...Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]))});
const run=(v:Record<string,string|number>={})=>runCalculation(c.id,m.id,inputs(v));
const metric=(r:ReturnType<typeof run>,label:string)=>{const x=r.metrics.find(x=>x.label===label);assert.ok(x,label);return x.value;};
const close=(actual:number,expected:number,tol=.005)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
// Independent transcription of selected standard-coverage rows of National MI's
// MA.MN.BP.2022-03 card; coverage is cross-checked with Fannie Mae B7-1-02.
const fixtures=[
 {months:360,ltv:85,coverage:12,expected:[.19,.20,.23,.25,.28,.38,.40,.44]},
 {months:360,ltv:90,coverage:25,expected:[.28,.38,.46,.55,.65,.90,.91,.94]},
 {months:360,ltv:95,coverage:30,expected:[.38,.53,.66,.78,.96,1.28,1.33,1.42]},
 {months:360,ltv:97,coverage:35,expected:[.58,.70,.87,.99,1.21,1.54,1.65,1.86]},
 {months:240,ltv:85,coverage:6,expected:[.14,.16,.20,.21,.21,.23,.25,.28]},
 {months:240,ltv:90,coverage:12,expected:[.19,.21,.25,.28,.33,.42,.48,.56]},
 {months:240,ltv:95,coverage:25,expected:[.30,.39,.46,.56,.67,.83,.97,1.14]},
 {months:240,ltv:97,coverage:35,expected:[.40,.53,.68,.80,1.01,1.34,1.51,1.72]},
];
for(const f of fixtures)for(const [i,credit] of pmiCreditBands.entries())test(`PMI card: ${f.months} months / ${f.ltv}% LTV / ${credit}`,()=>{
 const r=estimateMortgagePmi(f.ltv*1000,100000,f.months,credit);close(r.annualPercent,f.expected[i],1e-12);assert.equal(r.coveragePercent,f.coverage);
});
test('Automatic PMI has a dated primary-source card and independently verified coverage basis',()=>{
 assert.equal(rates.effective_from,'2022-03-01');assert.match(rates.source_url,/nationalmi\.com\/.*2022-03\.pdf/);assert.match(rates.coverage_url,/fanniemae\.com/);assert.match(rates.scope,/not a live quote/i);
});
test('PMI boundaries include exact 80,85,90,95,97 LTV and 20-year term',()=>{
 for(const [ltv,rate] of [[80,0],[80.0001,.20],[85,.20],[85.0001,.38],[90,.38],[90.0001,.53],[95,.53],[95.0001,.70],[97,.70]])close(estimateMortgagePmi(ltv*1000,100000,360,'740-759').annualPercent,rate,1e-12);
 close(estimateMortgagePmi(85000,100000,240,'740-759').annualPercent,.16);close(estimateMortgagePmi(85000,100000,241,'740-759').annualPercent,.20);
});
test('Unsupported automatic PMI inputs fail clearly instead of inventing a rate',()=>{
 assert.throws(()=>estimateMortgagePmi(97001,100000,360,'740-759'),/up to 97%/);
 assert.throws(()=>estimateMortgagePmi(95000,100000,481,'740-759'),/up to 40 years/);
 assert.throws(()=>estimateMortgagePmi(95000,100000,360,'610'),/credit score range/);
 assert.throws(()=>estimateMortgagePmi(95000,0,360,'740-759'),/valid loan amount/);
 assert.throws(()=>estimateMortgagePmi(NaN,100000,360,'740-759'),/valid loan amount/);
 close(estimateMortgagePmi(97000,100000,480,'740-759').annualPercent,.70);
});
test('4% and 15% down automatically change both PMI rate and original loan basis',()=>{
 const four=run({down:4}),fifteen=run({down:15});
 close(metric(four,'Estimated annual PMI rate'),.70);close(metric(four,'Initial monthly PMI'),224);
 close(metric(fifteen,'Estimated annual PMI rate'),.20);close(metric(fifteen,'Initial monthly PMI'),340000*.002/12);
 for(const r of [four,fifteen]){close(Number(r.rows![0][8]),metric(r,'Initial monthly PMI'));close(metric(r,'Initial monthly total'),metric(r,'Monthly principal & interest')+525+metric(r,'Initial monthly PMI'));}
 const dollar=run({down:60000,down_unit:'Dollars'});assert.deepEqual(dollar.metrics,fifteen.metrics);
});
test('Credit score and term affect the estimate without changing entered mortgage interest',()=>{
 close(metric(run({down:4,pmi_credit:'760+'}),'Initial monthly PMI'),384000*.0058/12);
 close(metric(run({down:4,pmi_credit:'620-639'}),'Estimated annual PMI rate'),1.86);
 close(metric(run({down:15,years:20}),'Estimated annual PMI rate'),.16);
 close(metric(run({down:15,years:15}),'Estimated annual PMI rate'),.16);
 close(metric(run({down:4}),'Monthly principal & interest'),metric(run({down:4,pmi_method:'Manual',pmi:0}),'Monthly principal & interest'));
});
test('At least 20% original-value equity gives zero automatic PMI; a lower purchase appraisal is respected',()=>{
 for(const down of [20,25,100]){const r=run({down});close(metric(r,'Initial monthly PMI'),0);close(metric(r,'Total PMI'),0);}
 const lower=run({down:20,appraised_value:350000});close(metric(lower,'Original value for PMI'),350000);close(metric(lower,'Estimated annual PMI rate'),.53);close(metric(lower,'Initial monthly PMI'),320000*.0053/12);
 close(metric(run({down:20,appraised_value:450000}),'Initial monthly PMI'),0);
});
test('Constant renewals use original principal and reduce the rate after month 120',()=>{
 close(automaticPmiPremium(384000,.70,119),224);close(automaticPmiPremium(384000,.70,120),64);
 close(automaticPmiPremium(340000,.16,120),340000*.0016/12);
 const r=run({down:4,rate:15});close(Number(r.rows![119][8]),224);close(Number(r.rows![120][8]),64);
});
test('Requested cancellation, extra principal and monthly/yearly PMI reconcile without double counting',()=>{
 const r=run({down:4,tax:0,insurance:0});
 for(const [i,row] of r.rows!.entries()){
  const opening=i?Number(r.rows![i-1][5]):384000;
  close(Number(row[8]),opening>320000?automaticPmiPremium(384000,.70,i):0);
  close(Number(row[6]),Number(row[8]));close(Number(row[7]),Number(row[2])+Number(row[8]));
 }
 close(metric(r,'Total PMI'),r.rows!.reduce((s,row)=>s+Number(row[8]),0));close(metric(r,'Total PMI'),r.annualRows!.reduce((s,row)=>s+Number(row[8]),0));
 assert.ok(resultTrend(c.id,m.id,inputs({down:4}),r));
 const early=run({down:4,extra_once:64000,extra_once_month:1,tax:0,insurance:0});close(Number(early.rows![0][8]),224);close(Number(early.rows![1][8]),0);close(metric(early,'Total PMI'),224);assert.equal(metric(early,'Months with PMI'),1);
});
test('Automatic ignores hidden manual values; Manual ignores the hidden credit range',()=>{
 const r=run({down:4,pmi:'bad',pmi_unit:'bad',pmi_years:'bad',pmi_policy:'bad'});close(metric(r,'Initial monthly PMI'),224);
 const manual=run({down:4,pmi_method:'Manual',pmi:1200,pmi_years:1,pmi_credit:'bad'});close(metric(manual,'Initial monthly PMI'),100);close(metric(manual,'Total PMI'),1200);close(Number(manual.rows![12][8]),0);
 const ltv=run({down:4,pmi_method:'Manual',pmi:1200,pmi_policy:'Cancel at 80% original LTV',pmi_years:'bad'});assert.ok(metric(ltv,'Total PMI')>1200);
});
test('No PMI controls are active in the biweekly principal-and-interest comparison',()=>{
 const mode=c.modes[1],v={...defaults(mode),down:'0',pmi_credit:'bad',pmi_method:'bad',pmi:'bad',pmi_unit:'bad',pmi_years:'bad',pmi_policy:'bad',appraised_value:'bad'};
 const r=runCalculation(c.id,mode.id,v);assert.ok(r.rows!.length>0);assert.ok(!r.metrics.some(x=>/PMI/.test(x.label)));
 for(const key of ['pmi_method','pmi_credit','pmi','pmi_unit','pmi_years','pmi_policy','appraised_value'])assert.equal(mortgagePmiFieldVisible(mode.id,v,key),false);
});
test('Automatic and manual field visibility follows the active contract',()=>{
 const auto=inputs(),manual=inputs({pmi_method:'Manual'}),ltv=inputs({pmi_method:'Manual',pmi_policy:'Cancel at 80% original LTV'});
 for(const key of ['pmi','pmi_unit','pmi_years','pmi_policy'])assert.equal(mortgagePmiFieldVisible('monthly',auto,key),false);
 assert.ok(mortgagePmiFieldVisible('monthly',auto,'pmi_credit'));assert.ok(mortgagePmiFieldVisible('monthly',auto,'appraised_value'));
 assert.ok(mortgagePmiFieldVisible('monthly',manual,'pmi_years'));assert.equal(mortgagePmiFieldVisible('monthly',manual,'pmi_credit'),false);
 assert.equal(mortgagePmiFieldVisible('monthly',ltv,'pmi_years'),false);assert.ok(mortgagePmiFieldVisible('monthly',ltv,'appraised_value'));
});
test('Legacy quote links preserve manual amounts, durations and explicit zero insurance',()=>{
 for(const [query,expected] of [['?mode=monthly&pmi=1200&pmi_years=1',1200],['?mode=monthly&pmi=0&down=4',0]] as const){
  const old=sharedInputs(c,query,'')!;assert.equal(old.values.pmi_method,'Manual');close(metric(runCalculation(c.id,old.mode.id,old.values),'Total PMI'),expected);
 }
 assert.equal(sharedInputs(c,'?mode=monthly&down=4','')!.values.pmi_method,'Automatic estimate');
 assert.equal(sharedInputs(c,'?mode=monthly&down=4&pmi=1200&pmi_method=Automatic+estimate','')!.values.pmi_method,'Automatic estimate');
});
test('New shared links and lazy calculations preserve automatic assumptions and manual quotes',async()=>{
 for(const v of [inputs({down:4}),inputs({down:15,pmi_credit:'760+'}),inputs({down:4,pmi_method:'Manual',pmi:1200})]){
  const url=new URL(calculationLink('https://calculatorfree.io','/mortgage-calculator.html',m,v,true)),shared=sharedInputs(c,url.search,url.hash)!;
  assert.deepEqual((await runClientCalculation(c.id,c.category,m.id,shared.values)).metrics,runCalculation(c.id,m.id,v).metrics);
 }
});
test('Automatic estimates state credit and quote assumptions prominently and keep FHA/VA separate',()=>{
 const v=inputs({down:4}),r=run({down:4});assert.match(resultContext(c.id,m.id,v,r)!,/credit score 740-759/);assert.match(r.notes!.join(' '),/not a live lender quote/);assert.match(r.notes!.join(' '),/0.20%/);
 for(const id of ['fha-loan','va-mortgage'])assert.ok(!calculators.find(c=>c.id===id)!.modes.some(m=>m.fields.some(f=>f.key==='pmi_method')));
});
