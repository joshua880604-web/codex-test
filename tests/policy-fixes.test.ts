import test from 'node:test';
import assert from 'node:assert/strict';
import {federalTax, type TaxInputs} from '../src/lib/tax';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {guides} from '../src/lib/guides';
const empty:TaxInputs={year:2026,filing:'single',wages:0,spouseWages:0,business:0,spouseBusiness:0,interest:0,dividends:0,qualified:0,shortGains:0,longGains:0,socialSecurity:0,other:0,adjustments:0,itemized:0,salt:0,age65:0,tips:0,overtime:0,carInterest:0,children:0,dependents:0,studentInterest:0,amtAdjustments:0,credits:0,qualifiedBusiness:false};
const close=(actual:number,expected:number,tolerance=.005)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
function inputs(id:string,modeId:string,values:Record<string,string|number>={}){const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===modeId)!;return {...defaults(m),...Object.fromEntries(Object.entries(values).map(([key,value])=>[key,String(value)]))};}
const run=(id:string,mode:string,values:Record<string,string|number>={})=>runCalculation(id,mode,inputs(id,mode,values));
const metric=(r:ReturnType<typeof run>,label:string)=>{const item=r.metrics.find(m=>m.label===label);assert.ok(item,label);return item.value;};
const row=(r:ReturnType<typeof run>,label:string)=>{const item=r.rows?.find(row=>row[0]===label);assert.ok(item,label);return Number(item[1]);};

// IRS NIIT Q&A: eligible net rent/royalties are NII; wages and qualified
// retirement distributions are not. Only the lesser MAGI excess is taxed.
for(const [filing,wages,passive,expected] of [['single',200000,100000,3800],['married_joint',200000,100000,1900],['married_separate',125000,100000,3800],['single',100000,100000,0]] as const)test(`POL-01: NIIT ${filing}/${wages}/${passive}`,()=>{
 close(federalTax({...empty,filing,wages,other:passive,niitPassiveIncome:passive}).niit,expected);
});
test('POL-01: public passive-income input preserves gross income and supports an established exclusion',()=>{
 const values={wages:200000,passive:100000,withheld:0},yes=run('income-tax','federal',values),no=run('income-tax','federal',{...values,passive_niit:'No'});
 close(row(yes,'Net investment income tax'),3800);close(row(no,'Net investment income tax'),0);
 close(metric(yes,'Adjusted gross income'),300000);close(metric(yes,'Estimated federal income tax')-metric(no,'Estimated federal income tax'),3800);
 close(federalTax({...empty,wages:200000,other:100000}).niit,0);
 close(federalTax({...empty,wages:200000,interest:10000,other:-5000,niitPassiveIncome:-5000}).niit,190);
});
test('POL-01: paycheck modes distinguish the NIIT portion from other taxable income',()=>{
 const broad={wages:200000,passive:100000,pretax:0,state_rate:0},a=run('take-home-paycheck','paycheck',broad),b=run('take-home-paycheck','paycheck',{...broad,passive_niit:'No'});
 close(metric(b,'Annual take-home pay')-metric(a,'Annual take-home pay'),3800);
 const simple={salary:200000,other_income:100000,pretax:0,state_rate:0},c=run('take-home-paycheck','source-paycheck',{...simple,niit_other:100000}),d=run('take-home-paycheck','source-paycheck',simple);
 close(metric(d,'Annual take-home pay')-metric(c,'Annual take-home pay'),3800);
 assert.throws(()=>run('take-home-paycheck','source-paycheck',{other_income:100,niit_other:101}),/cannot exceed Other income/);
});
test('POL-01: marriage combines both eligible NIIT amounts without adding income twice',()=>{
 const v={wages:200000,p2_wages:0,passive:100000},yes=run('marriage-tax','comparison',v),no=run('marriage-tax','comparison',{...v,passive_niit:'No'});
 close(metric(yes,'Your unmarried federal tax')-metric(no,'Your unmarried federal tax'),3800);
 close(metric(yes,'Married filing jointly tax')-metric(no,'Married filing jointly tax'),1900);
});
for(const [year,expected] of [[2025,12514],[2026,12312]] as const)test(`POL-02: ${year} MFS spouse itemizes makes standard deduction unavailable`,()=>{
 const t=federalTax({...empty,year,filing:'married_separate',wages:80000,mfsSpouseItemizes:true});close(t.standard,0);close(t.deduction,0);close(t.federal,expected);assert.equal(t.usingStandard,false);
 const r=run('income-tax','federal',{year,filing:'Married filing separately',wages:80000,mfs_spouse_itemizes:'Yes'});close(metric(r,'Estimated federal income tax'),expected);
});
test('POL-02: own itemized deduction remains usable; forced itemization excludes nonitemizer cash gift',()=>{
 const t=federalTax({...empty,filing:'married_separate',wages:80000,mfsSpouseItemizes:true,itemized:20000,nonitemizerCashGifts:1000,age65:1});close(t.deduction,20000);close(t.nonitemizerCashDeduction,0);close(t.standard,0);
 const single=federalTax({...empty,wages:80000,mfsSpouseItemizes:true});close(single.standard,16100);close(single.federal,8770);
 close(federalTax({...empty,filing:'married_separate',wages:80000}).federal,8770);
});
test('POL-02: both paycheck forms propagate the MFS spouse-itemization condition',()=>{
 const broad={filing:'Married filing separately',wages:80000,pretax:0,state_rate:0},simple={file_status:'Married filing separately',salary:80000,pretax:0,state_rate:0};
 for(const [mode,values] of [['paycheck',broad],['source-paycheck',simple]] as const){const a=run('take-home-paycheck',mode,values),b=run('take-home-paycheck',mode,{...values,mfs_spouse_itemizes:'Yes'});close(metric(a,'Annual take-home pay')-metric(b,'Annual take-home pay'),3542);}
});
// IRS2025 Form6251 line4 example;2026 uses55(d)(4)'s50% substitution.
for(const [year,amti,increase] of [[2025,900350,0],[2025,900351,.25],[2025,920350,5000],[2025,1174350,68500],[2025,1300000,68500],[2026,640200,0],[2026,640201,.5],[2026,750000,54900],[2026,780400,70100],[2026,1000000,70100]] as const)test(`POL-03: ${year} MFS special AMTI increase at${amti}`,()=>{
 close(federalTax({...empty,year,filing:'married_separate',wages:100000,amtAdjustments:amti-100000}).mfsAmtIncrease,increase);
});
test('POL-03: IRS worked example and2026 tax use the adjusted AMTI once',()=>{
 close(metric(run('income-tax','federal',{year:2025,filing:'Married filing separately',wages:100000,amt:820350}),'Estimated federal income tax'),256707);
 close(federalTax({...empty,filing:'married_separate',wages:100000,amtAdjustments:650000}).federal,222927);
 close(federalTax({...empty,wages:100000,amtAdjustments:820350}).mfsAmtIncrease,0);
});
for(const [year,active,expected] of [[2025,true,278.805675],[2026,false,278.805675],[2026,true,400]] as const)test(`POL-04: ${year} active=${active} QBI minimum`,()=>{
 close(federalTax({...empty,year,wages:50000,business:1500,qualifiedBusiness:true,activeBusiness:active}).qbi,expected);
 close(row(run('income-tax','federal',{year,wages:50000,business:1500,qbi:'Yes',qbi_active:active?'Yes':'No'}),'Eligible QBI deduction'),expected);
});
test('POL-04: active QBI threshold uses net income and material participation, not gross profit',()=>{
 close(federalTax({...empty,wages:50000,business:1000,qualifiedBusiness:true,activeBusiness:true}).qbi,185.87045);
 close(federalTax({...empty,wages:50000,business:2000,qualifiedBusiness:true,activeQbiIncome:999.99}).qbi,371.7409);
 close(federalTax({...empty,wages:50000,business:2000,qualifiedBusiness:true,activeQbiIncome:1000}).qbi,400);
 close(federalTax({...empty,wages:50000,business:1500,activeBusiness:true}).qbi,0);
 close(federalTax({...empty,wages:50000,spouseWages:50000,business:0,spouseBusiness:1500,filing:'married_joint',qualifiedBusiness:true,spouseActiveBusiness:true}).qbi,400);
});
test('POL-04: marriage aggregates active businesses and applies a single return minimum',()=>{
 const r=run('marriage-tax','comparison',{wages:50000,p2_wages:50000,business:600,p2_business:600,qbi:'Yes',p2_qbi:'Yes',qbi_active:'Yes',p2_qbi_active:'Yes'});
 close(metric(r,'Married filing jointly tax'),7895.381324);
});
test('POL-05: ideal-age COLA grows a common age62-dollar PIA while waiting',()=>{
 const r=run('social-security','ideal');close(metric(r,'Highest present-value application age'),70);close(Number(r.rows![0][1]),1400);close(Number(r.rows![8][1]),2905.715264885619);
 const zero=run('social-security','ideal',{cola:0});close(Number(zero.rows![8][1]),2480);
 // Independent monthly cash-flow sum at age70; annual COLA continues from62.
 let pv=0;for(let i=0;i<20*12;i++)pv+=2480*1.02**(8+Math.floor(i/12))/1.03**(8+(i+1)/12);
 close(Number(r.rows![8][2]),pv);
});
test('POL-05: claim-date quotes are not inflated again before their own claiming date',()=>{
 const r=run('social-security','compare',{age1:62,monthly1:1000,age2:63,monthly2:1100,life:64,return:0,cola:2});
 close(metric(r,'First option present value'),24240);close(metric(r,'Second option present value'),13200);
});
for(const [repeat,expected] of [['No',8600],['Yes',13200],['Only a manufactured home',8600]] as const)test(`POL-06: VA ordinary purchase prior-use ${repeat}`,()=>{
 const r=run('va-mortgage','monthly',{price:400000,down:0,repeat});close(metric(r,'Upfront fee'),expected);close(metric(r,'Financed loan amount'),400000+expected);
});
test('POL-06: VA exemption, down-payment tiers and upfront fee remain independent',()=>{
 close(metric(run('va-mortgage','monthly',{price:400000,down:0,repeat:'Only a manufactured home',exempt:'Yes'}),'Upfront fee'),0);
 close(metric(run('va-mortgage','monthly',{price:400000,down:5,repeat:'Only a manufactured home'}),'Upfront fee'),5700);
 close(metric(run('va-mortgage','monthly',{price:400000,down:10,repeat:'Only a manufactured home'}),'Upfront fee'),4500);
 close(metric(run('va-mortgage','monthly',{price:400000,down:0,repeat:'Only a manufactured home',fee_treatment:'Pay upfront'}),'Financed loan amount'),400000);
 const va=run('va-mortgage','monthly',{tax:0,insurance:0,pmi:'',pmi_unit:'',pmi_years:'',pmi_policy:''});close(metric(va,'Initial monthly total'),metric(va,'Monthly principal & interest'));
});
test('Policy inputs survive shared links and the lazy client calculation entry',async()=>{
 for(const [id,mode,values] of [['income-tax','federal',{wages:'200000',passive:'100000',passive_niit:'Yes'}],['income-tax','federal',{filing:'Married filing separately',mfs_spouse_itemizes:'Yes'}],['income-tax','federal',{wages:'50000',business:'1500',qbi:'Yes',qbi_active:'Yes'}],['va-mortgage','monthly',{repeat:'Only a manufactured home',down:'0'}]] as const){
  const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!,v=inputs(id,mode,values),link=calculationLink('https://calculatorfree.io','/tool.html',m,v,true),url=new URL(link),shared=sharedInputs(c,url.search,url.hash)!;
  for(const [key,value] of Object.entries(values))assert.equal(shared.values[key],value);
  assert.deepEqual((await runClientCalculation(id,c.category,mode,shared.values)).metrics,runCalculation(id,mode,v).metrics);
 }
});
test('Policy guide scope keeps Roth RMDs, Roth catch-up, and PMI cancellation distinct',()=>{
 assert.match(guides.rmd.scope,/Roth IRA owner balances/);assert.ok(guides['401k'].questions.some(q=>/150,000/.test(q.answer)&&/Roth/.test(q.answer)));
 assert.ok(guides.mortgage.questions.some(q=>/78%/.test(q.answer)&&/80%/.test(q.answer)));
});
