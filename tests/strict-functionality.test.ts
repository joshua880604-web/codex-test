import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const run=(id:string,mode:string,values:Record<string,string|number>={})=>{const m=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(values).map(([k,v])=>[k,String(v)]))});};
const val=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number,tol=.005)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('HELOC percentage fees and payment methods conserve net closing cash and APR',()=>{
 const base={principal:12000,rate:0,draw:1,years:1,closing:1,closing_unit:'Percent',charge:0};
 const upfront=run('heloc','draw-repay',{...base,closing_treatment:'Upfront'}),deducted=run('heloc','draw-repay',{...base,closing_treatment:'Deducted from loan'});
 close(val(upfront,'Cash disbursed at closing'),12000);close(val(upfront,'Closing costs paid upfront'),120);close(val(deducted,'Cash disbursed at closing'),11880);close(val(deducted,'Closing costs paid upfront'),0);
 close(val(upfront,'Net initial proceeds after closing costs'),11880);close(val(upfront,'Nominal APR including fees'),val(deducted,'Nominal APR including fees'));
 assert.throws(()=>run('heloc','draw-repay',{...base,closing:100}),/Closing costs/);
});
test('Retirement percentage saving tracks salary growth and fixed-dollar targets remain fixed',()=>{
 const r=run('retirement','required',{age:35,retire:37,life:39,income:100000,salary_growth:10,replacement:30000,replacement_unit:'Dollars per year',return:0,inflation:0,other:0,balance:0,saving:10,saving_unit:'Percent of annual income'});
 close(val(r,'First-year retirement income need'),30000);close(val(r,'Required savings at retirement'),60000);close(val(r,'Projected retirement savings'),21000);
 const annual=run('retirement','required',{age:35,retire:37,life:39,balance:0,saving:1000,saving_unit:'Dollars per year',return:10});close(val(annual,'Projected retirement savings'),2100);
});
test('401k employee deposits are separate from starting balance and additions limits protect the account',()=>{
 const r=run('401k','projection',{age:35,retire:36,life:80,salary:100000,balance:1000,contribution:100,match:500,match_limit:100,return:0});close(val(r,'Employee contributions'),24500);close(val(r,'Starting 401(k) balance'),1000);close(val(r,'Employer contributions'),47500);close(val(r,'Projected 401(k) balance'),73000);
 const catchup=run('401k','projection',{age:50,retire:51,life:80,salary:100000,balance:0,contribution:100,match:500,match_limit:100,return:0});close(val(catchup,'Employee contributions'),32500);close(val(catchup,'Employer contributions'),47500);
 const low=run('401k','projection',{age:35,retire:36,life:80,salary:1000,balance:0,contribution:100,match:100,match_limit:100,return:0});close(val(low,'Employee contributions'),1000);close(val(low,'Employer contributions'),0);
});
test('401k matching uses eligible compensation in the full-match lower endpoint',()=>{
 const r=run('401k','match',{age:35,salary:1000000,match1:100,limit1:3,match2:50,limit2:2});close(val(r,'Minimum contribution rate for full match'),1.8);close(val(r,'Maximum steady contribution rate'),2.45);close(val(r,'Employer annual match'),14400);
});
test('Mortgage extra yearly payments can start independently from monthly extras',()=>{
 const a=run('amortization','schedule',{principal:12000,years:1,months:0,rate:0,extra_monthly:0,extra_yearly:1200,extra_yearly_start:1});close(Number(a.rows![0][2]),2200);
 const b=run('amortization','schedule',{principal:12000,years:1,months:0,rate:0,extra_monthly:0,extra_yearly:1200,extra_yearly_start:12});close(Number(b.rows![0][2]),1000);assert.ok(a.rows!.length<b.rows!.length);
 assert.throws(()=>run('amortization','schedule',{extra_yearly_start:1.5}),/whole/);
});
test('Bond maturity accepts additional months without changing the nominal compound convention',()=>{
 const r=run('loan','bond',{face:110,years:0,months:6,rate:20,compound:'Semiannually'});close(val(r,'Bond present value'),100);
 assert.throws(()=>run('loan','bond',{months:1.5}),/whole/);
});
test('IRR holding months, no-flow and additional investment preserve actual dates and NPV',()=>{
 const r=run('irr','fixed',{initial:100,years:0,months:6,ending:121,cash_action:'No recurring cash flow',cash_frequency:'Annually'});close(val(r,'Annual IRR 1'),46.41);assert.deepEqual(r.rows,[[0,0,-100],[1,.5,121]]);
 const part=run('irr','fixed',{initial:100,years:1,months:6,inflow:10,ending:110,cash_frequency:'Annually'});const rate=val(part,'Annual IRR 1')/100;close(-100+10/(1+rate)+110/(1+rate)**1.5,0,1e-6);
 const more=run('irr','fixed',{initial:100,years:1,months:0,inflow:10,ending:121,cash_action:'Additional investment'});close(val(more,'Annual IRR 1'),11);
});
test('Growth monthly and annual ledgers reconcile with the initial/deposit earnings split',()=>{
 const r=run('interest','accumulation',{principal:1000,years:2,months:3,monthly:100,annual:500,rate:6,compound:'Monthly',tax:20,inflation:0});assert.equal(r.rows!.length,27);assert.equal(r.annualRows!.length,3);
 close(Number(r.rows!.at(-1)![3]),val(r,'Ending balance'));close(Number(r.annualRows!.at(-1)![3]),val(r,'Ending balance'));close(val(r,'Net earnings from starting amount')+val(r,'Net earnings from additional deposits'),val(r,'Net investment earnings'));
});
test('CD ledgers reproduce compound identities and fractional maturity without phantom full months',()=>{
 const r=run('cd','accumulation',{principal:1000,years:1,months:6,rate:10,compound:'Semiannually',tax:20});close(val(r,'Maturity balance'),1000*1.05**3);assert.equal(r.rows!.length,18);assert.equal(r.annualRows!.length,2);close(r.rows!.reduce((s,row)=>s+Number(row[1]),0),val(r,'Interest earned'));
 const partial=run('cd','accumulation',{years:0,months:.5});assert.equal(partial.rows!.length,1);assert.equal(partial.rows![0][0],.5);
});
test('Annuity accumulation schedules reproduce the visible original source case',()=>{
 const r=run('annuity','growth',{principal:20000,annual:10000,monthly:0,timing:'Beginning of period',rate:6,years:10});close(val(r,'Annuity future value'),175533.38);close(val(r,'Starting principal'),20000);close(val(r,'Total additions'),100000);assert.equal(r.rows!.length,120);close(Number(r.annualRows![0][3]),31800);close(r.rows!.reduce((s,row)=>s+Number(row[1]),0),val(r,'Total contributions'));
 const part=run('annuity','growth',{principal:0,annual:1000,monthly:100,timing:'End of period',rate:0,years:1.5});close(val(part,'Annuity future value'),2800);assert.equal(part.rows!.length,18);
});
test('Annuity payout has a final truncated payment and conserves principal and return',()=>{
 const r=run('annuity-payout','payment',{principal:1000,rate:0,frequency:'Annually',payment:300});close(val(r,'Number of payments'),4);close(val(r,'Total payouts'),1000);assert.equal(r.rows!.at(-1)![4],100);assert.equal(r.rows!.at(-1)![5],0);
 const partial=run('annuity-payout','length',{principal:1000,rate:0,frequency:'Annually',years:1.5});close(val(partial,'Total payments'),1000);assert.equal(partial.rows!.at(-1)![1],1.5);
});
test('House affordability solves dollar expenses and down payment without treating them as percentages',()=>{
 const r=run('house-affordability','budget',{budget:2000,down:20000,down_unit:'Dollars',years:10,rate:0,tax_rate:2400,tax_unit:'Dollars per year',insurance:1200,insurance_unit:'Dollars per year',hoa:100,hoa_unit:'Dollars per month',maintenance:600,maintenance_unit:'Dollars per year'});close(val(r,'Estimated home price'),206000);close(val(r,'Loan amount'),186000);
 const percent=run('house-affordability','budget',{budget:2000,down:20,years:10,rate:0,tax_rate:1.2,insurance:.6,insurance_unit:'Percent of home value',hoa:.12,hoa_unit:'Percent of home value per year',maintenance:.6,maintenance_unit:'Percent of home value'}),price=val(percent,'Estimated home price');close(price*.8/120+price*(.012+.006+.0012+.006)/12,2000);
});
test('Income-tax additional payments and dividend definitions avoid double counting',()=>{
 const r=run('income-tax','federal',{filing:'Married filing jointly',wages:20000,withheld:10000,spouse_withheld:2000,estimated_paid:3000,spouse_estimated_paid:2000});close(val(r,'Estimated refund'),17000);
 const dividend=run('income-tax','federal',{wages:0,dividends:5000,qualified:2000,dividend_definition:'Total ordinary includes qualified'});close(val(dividend,'Adjusted gross income'),5000);
 assert.throws(()=>run('income-tax','federal',{dividends:100,qualified:101,dividend_definition:'Total ordinary includes qualified'}),/cannot exceed/);assert.throws(()=>run('income-tax','federal',{spouse_withheld:100}),/jointly/);
});
test('Medicare wages can differ from taxable wages without changing AGI',()=>{
 const r=run('income-tax','federal',{wages:180000,medicare_wages:210000});close(val(r,'Adjusted gross income'),180000);close(Number(r.rows!.find(row=>row[0]==='Additional Medicare tax')![1]),90);close(Number(r.rows!.find(row=>row[0]==='Employee Medicare')![1]),3045);
});
test('2026 non-itemizer cash gifts reduce ordinary taxable income at the applicable cap',()=>{
 const base=run('income-tax','federal',{year:2026,wages:80000,cash_gifts:0}),gift=run('income-tax','federal',{year:2026,wages:80000,cash_gifts:2000});close(val(base,'Estimated federal income tax')-val(gift,'Estimated federal income tax'),220);
 const old=run('income-tax','federal',{year:2025,wages:80000,cash_gifts:2000}),oldBase=run('income-tax','federal',{year:2025,wages:80000,cash_gifts:0});close(val(old,'Estimated federal income tax'),val(oldBase,'Estimated federal income tax'));
});
test('Source-shaped paycheck pays only this job while other wages affect its allocated tax',()=>{
 const base={salary:12000,pretax:0,state_rate:0,local_rate:0,pay_frequency:'Monthly'};
 const one=run('take-home-paycheck','source-paycheck',base);close(val(one,'Annual take-home pay'),11082);close(val(one,'Gross pay per period'),1000);
 const two=run('take-home-paycheck','source-paycheck',{...base,multiple_jobs:'Yes',job2:10000});close(val(two,'Annual take-home pay'),10492);close(val(two,'Gross pay per period'),1000);
 assert.throws(()=>run('take-home-paycheck','source-paycheck',{...base,job2:10000}),/Select Yes/);
});
test('Paycheck self-employment does not subtract employee FICA or reduce SE profit by retirement deposits',()=>{
 const r=run('take-home-paycheck','source-paycheck',{salary:10000,pretax:1000,self_employed:'Yes',state_rate:0,local_rate:0});close(val(r,'Annual take-home pay'),10000-1000-10000*.9235*.153);close(Number(r.rows!.find(row=>row[0]==='Employee Social Security')![1]),0);
});
test('Commission any-two solves each unknown and distinguishes indeterminate zero cases',()=>{
 close(val(run('commission','any-two',{sales:100,rate:5,commission:''}),'Commission'),5);close(val(run('commission','any-two',{sales:'',rate:5,commission:5}),'Sales amount'),100);close(val(run('commission','any-two',{sales:100,rate:'',commission:5}),'Commission rate'),5);
 assert.throws(()=>run('commission','any-two',{sales:0,rate:'',commission:0}),/unique/);close(val(run('commission','any-two',{sales:0,rate:5,commission:''}),'Commission'),0);
});
test('Whole-sale commission details agree with summary; item rates support currency per item',()=>{
 const full=run('commission','tiered',{sales:15000,base:0,method:'Single rate on all sales',tiers:'10000,3\n20000,5'});close(val(full,'Commission'),750);close(full.rows!.reduce((s,row)=>s+Number(row[4]),0),750);
 const item=run('commission','tiered',{sales:15,base:10,tier_unit:'Amount per item',tiers:'10,2\n20,3',method:'Progressive bands'});close(val(item,'Commission'),35);close(val(item,'Total earnings'),45);
});
test('Biweekly mortgage comparison honors the independent annual-extra start month',()=>{
 const base={price:12000,down:0,years:1,months:0,rate:0,tax:0,insurance:0,hoa:0,other:0,extra_yearly:1200,extra_monthly:0};
 const early=run('mortgage','biweekly',{...base,extra_yearly_start:1}),late=run('mortgage','biweekly',{...base,extra_yearly_start:12});close(Number(early.rows![2][1]),1700);close(Number(late.rows![2][1]),500);
});
