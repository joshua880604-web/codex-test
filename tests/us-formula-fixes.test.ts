import test from 'node:test';
import assert from 'node:assert/strict';
import {federalTax, type TaxInputs} from '../src/lib/tax';
import {calculators, defaults, runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {fhaMipTerms, fhaMipSchedule} from '../src/lib/fha-mip';
import {sharedInputs, calculationLink} from '../src/lib/sharing';
const close=(actual:number,expected:number,tolerance=.005)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
const empty:TaxInputs={year:2025,filing:'single',wages:0,spouseWages:0,business:0,spouseBusiness:0,interest:0,dividends:0,qualified:0,shortGains:0,longGains:0,socialSecurity:0,other:0,adjustments:0,itemized:0,salt:0,age65:0,tips:0,overtime:0,carInterest:0,children:0,dependents:0,studentInterest:0,amtAdjustments:0,credits:0,qualifiedBusiness:false};
function inputs(id:string,mode:string,values:Record<string,string|number>={}){const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return {...defaults(m),...Object.fromEntries(Object.entries(values).map(([key,value])=>[key,String(value)]))};}
const run=(id:string,mode:string,values:Record<string,string|number>={})=>runCalculation(id,mode,inputs(id,mode,values));
const metric=(r:ReturnType<typeof run>,label:string)=>{const item=r.metrics.find(m=>m.label===label);assert.ok(item,label);return item.value;};

// IRS Schedule 8812 Credit Limit Worksheet A and Earned Income Worksheet.
for(const year of [2025,2026] as const)test(`US-01: ${year} education credit is applied before the CTC tax limit`,()=>{
 const result=federalTax({...empty,year,wages:20000,interest:13000,children:1,educationExpenses:[4000],educationTypes:['American Opportunity'],aotcRefundable:true});
 close(result.educationCredit,1500);close(result.educationRefund,1000);close(result.childRefund,1700);close(result.refundable,2700);close(result.federal,-2700);
 close(result.childCredit,year===2025?331.5:280);
});
test('US-01: dependent-care and other entered nonrefundable credits preserve ACTC headroom',()=>{
 const care=federalTax({...empty,wages:30000,children:1,careExpenses:3000,carePeople:1});
 close(care.careCredit,810);close(care.childCredit,661.5);close(care.childRefund,1538.5);
 const other=federalTax({...empty,wages:30000,children:1,credits:500});close(other.childRefund,1228.5);
 const alone=federalTax({...empty,wages:30000,children:1});close(alone.childRefund,728.5);
 const noChild=federalTax({...empty,wages:30000,educationExpenses:[4000],educationTypes:['American Opportunity'],aotcRefundable:true});close(noChild.childRefund,0);close(noChild.educationRefund,1000);
});
test('US-02: ACTC earned income deducts half of regular self-employment tax',()=>{
 const result=federalTax({...empty,filing:'married_separate',business:10000,children:1});
 close(result.se,1412.955);close(result.actcEarnedIncome,9293.5225);close(result.childRefund,1019.028375);close(result.federal,393.926625);
 const mixed=federalTax({...empty,filing:'married_separate',wages:5000,business:5000,children:1});close(mixed.actcEarnedIncome,9646.76125);close(mixed.childRefund,1072.0141875);
 const zero=federalTax({...empty,children:1});close(zero.childRefund,0);
});
for(const year of [2025,2026] as const)test(`US-03: ${year} MFS Social Security distinguishes all-year separation`,()=>{
 const apart=federalTax({...empty,year,filing:'married_separate',socialSecurity:40000,mfsLivedApartAllYear:true});
 close(apart.taxableSS,0);close(apart.federal,0);
 const together=federalTax({...empty,year,filing:'married_separate',socialSecurity:40000,mfsLivedApartAllYear:false});close(together.taxableSS,17000);
 close(together.federal,year===2025?125:90);
 close(federalTax({...empty,year,filing:'married_separate',socialSecurity:40000}).taxableSS,17000);
});
for(const [wages,taxableBenefits] of [[14999,0],[15000,0],[15001,.5],[24000,4500],[24001,4500.85]])test(`US-03: MFS all-year separation threshold at combined income ${wages+10000}`,()=>{
 close(federalTax({...empty,filing:'married_separate',socialSecurity:20000,wages,mfsLivedApartAllYear:true}).taxableSS,taxableBenefits);
});
// Exact statutory section 68 factor, not Publication 505's 5.4% approximation.
test('US-04: 2026 section68 uses exact2/37 and leaves2025 unchanged',()=>{
 const result=federalTax({...empty,year:2026,wages:1000000,itemized:100000});
 close(result.itemizedReduction,5405.4054054054);close(result.deduction,94594.5945945946);close(result.federal,298157.25);
 close(federalTax({...empty,wages:1000000,itemized:100000}).itemizedReduction,0);
});
for(const [filing,boundary] of [['single',640600],['head_household',640600],['married_joint',768700],['married_separate',384350]] as const)test(`US-04: ${filing} section68 threshold and partial reduction`,()=>{
 const at=federalTax({...empty,year:2026,filing,wages:boundary,itemized:100000});close(at.itemizedReduction,0);
 const above=federalTax({...empty,year:2026,filing,wages:boundary+10000,itemized:100000});close(above.itemizedReduction,540.5405405405);
});
test('US-04: section68 changes neither QBI computation nor AMT income',()=>{
 const business=federalTax({...empty,year:2026,wages:600000,business:400000,itemized:100000,qualifiedBusiness:true});close(business.qbi,78928.74);close(business.itemizedReduction,5405.4054054054);
 const amt=federalTax({...empty,year:2026,wages:800000,itemized:100000,amtAdjustments:500000});close(amt.regular+amt.amt,331110);
 // Electing itemization below the standard deduction can lower modeled AMT.
 const choice=federalTax({...empty,year:2026,wages:100000,itemized:10000,amtAdjustments:500000});assert.equal(choice.usingStandard,false);close(choice.deduction,10000);
});

// Ordinary forward-loan rates/durations: HUD Mortgagee Letter2023-05, page3.
for(const [base,price,months,rate,duration] of [
 [320000,400000,360,.5,132],[475000,500000,360,.5,360],[482500,500000,360,.55,360],
 [800000,1000000,360,.7,132],[950000,1000000,360,.7,360],[960000,1000000,360,.75,360],
 [320000,400000,180,.15,132],[475000,500000,180,.4,180],
 [760000,1000000,180,.15,132],[800000,1000000,180,.4,132],[950000,1000000,180,.65,180],
 [726200,1000000,360,.5,132],[726200.01,1000000,360,.7,132],
 [90000,100000,360,.5,132],[90000.01,100000,360,.5,360],
 [95000,100000,360,.5,360],[95000.01,100000,360,.55,360],
 [320000,400000,120,.15,120],[320000,400000,181,.5,132],[0,400000,360,0,0],
])test(`US-05: FHA base${base}/price${price}/${months}months`,()=>{
 const terms=fhaMipTerms(base,price,months);close(terms.upfrontPercent,1.75);close(terms.annualPercent,rate);assert.equal(terms.durationMonths,duration);
});
test('US-05/06: FHA default stops at11years and exposes reconciled premium amounts',()=>{
 const result=run('fha-loan','monthly');close(metric(result,'Upfront fee'),5600);close(metric(result,'Annual FHA MIP rate'),.5);close(metric(result,'FHA MIP duration in years'),11);
 close(metric(result,'Initial monthly FHA MIP'),132.59);close(Number(result.rows![120][8]),110.23);close(Number(result.rows![131][8]),110.23);close(Number(result.rows![132][8]),0);
 close(metric(result,'Total FHA MIP'),result.rows!.reduce((total,row)=>total+Number(row[8]),0));
 close(metric(result,'Initial monthly total'),metric(result,'Monthly principal & interest')+525+132.59);
  assert.equal(result.annualRows!.length,30);close(Number(result.annualRows![0][8]),1591.08);close(Number(result.annualRows![11][8]),0);
  close(result.annualRows!.reduce((total,row)=>total+Number(row[8]),0),metric(result,'Total FHA MIP'));
 for(const row of result.rows!)close(Number(row[7]),Number(row[2])+Number(row[6]));
});
test('FHA premium LTV uses the lower purchase price or entered appraised value',()=>{
 const lower=run('fha-loan','monthly',{appraised_value:350000});close(metric(lower,'FHA loan-to-value ratio'),91.42857142857);close(metric(lower,'FHA MIP duration in years'),30);close(metric(lower,'Annual FHA MIP rate'),.5);
 const higher=run('fha-loan','monthly',{appraised_value:500000});close(metric(higher,'FHA loan-to-value ratio'),80);close(metric(higher,'FHA MIP duration in years'),11);
});
test('US-06: HUD published worked example preserves annual averages and staged cents rounding',()=>{
 const premiums=fhaMipSchedule(106605,7.5,745.40,360,2.25,.5,360);
 close(premiums[0],43.26);close(premiums[11],43.26);close(premiums[12],42.85);close(premiums[23],42.85);
 const zero=fhaMipSchedule(12000,0,1000,12,0,.5,12);close(zero[0],2.71);close(zero[11],2.71);
});
test('US-06: extra payments leave original MIP basis intact but stop premiums at payoff',()=>{
 const normal=run('fha-loan','monthly'),early=run('fha-loan','monthly',{extra_monthly:10000});assert.ok(early.rows!.length<132);
 for(let i=0;i<early.rows!.length;i++)close(Number(early.rows![i][8]),Number(normal.rows![i][8]));
 close(metric(early,'Total FHA MIP'),early.rows!.reduce((total,row)=>total+Number(row[8]),0));assert.ok(metric(early,'Total FHA MIP')<metric(normal,'Total FHA MIP'));
});
test('FHA manual terms and legacy links retain explicit zero/custom premiums',()=>{
 const calc=calculators.find(c=>c.id==='fha-loan')!;
 const legacy=sharedInputs(calc,'?mode=monthly&upfront=0&annual_mip=0&mip_years=30','')!;assert.equal(legacy.values.mip_method,'Manual');close(metric(runCalculation(calc.id,legacy.mode.id,legacy.values),'Upfront fee'),0);
 const current=sharedInputs(calc,'?mode=monthly&down=3.5','')!;assert.equal(current.values.mip_method,'Automatic');close(metric(runCalculation(calc.id,current.mode.id,current.values),'Annual FHA MIP rate'),.55);
 const manual=run('fha-loan','monthly',{mip_method:'Manual',upfront:0,annual_mip:0,mip_years:0});close(metric(manual,'Total FHA MIP'),0);
 const zero=run('fha-loan','monthly',{down:100});close(metric(zero,'Financed loan amount'),0);close(metric(zero,'Total FHA MIP'),0);
 assert.throws(()=>run('fha-loan','monthly',{mip_method:'Manual',mip_years:.11}),/whole number/);
 assert.throws(()=>run('fha-loan','monthly',{years:1,months:.5}),/whole number/);
 close(metric(run('fha-loan','monthly',{annual_mip:'',mip_years:'',pmi:'invalid'}),'Annual FHA MIP rate'),.5);
});
test('Public tax models use repaired rules and serialize the MFS residence choice',()=>{
 const edu=run('income-tax','federal',{year:2025,wages:20000,interest:13000,children:1,education0:4000,education_type0:'American Opportunity',aotc_refundable:'Yes',withheld:0});close(metric(edu,'Estimated federal income tax'),-2700);
 const result=run('income-tax','federal',{year:2025,filing:'Married filing separately',wages:0,social:40000,mfs_lived_apart:'Yes'});close(metric(result,'Estimated federal income tax'),0);
 const paycheck=run('take-home-paycheck','paycheck',{filing:'Married filing separately',wages:0,social:40000,mfs_lived_apart:'Yes',pretax:0,state_rate:0});close(metric(paycheck,'Annual take-home pay'),0);
 const calc=calculators.find(c=>c.id==='income-tax')!,mode=calc.modes[0],values=inputs(calc.id,mode.id,{filing:'Married filing separately',mfs_lived_apart:'Yes',social:40000,wages:0});
 const url=new URL(calculationLink('https://calculatorfree.io','/tax-calculator.html',mode,values,true));assert.equal(sharedInputs(calc,url.search,url.hash)!.values.mfs_lived_apart,'Yes');
 const marriage=run('marriage-tax','comparison',{wages:20000,interest:13000,children:1,education0:4000,education_type0:'American Opportunity',aotc_refundable:'Yes',p2_aotc_refundable:'Yes'});
 close(metric(marriage,'Your unmarried federal tax'),-2700);close(metric(marriage,'Married filing jointly tax'),-2700);
});
test('Lazy client calculations and server calculations agree for repaired tax/FHA cases',async()=>{
 for(const [id,mode,values] of [
  ['income-tax','federal',{year:2026,wages:1000000,itemized:100000}],
  ['income-tax','federal',{year:2025,wages:20000,interest:13000,children:1,education0:4000,education_type0:'American Opportunity',aotc_refundable:'Yes'}],
  ['fha-loan','monthly',{down:3.5}],['fha-loan','monthly',{down:20}],
 ] as const){const calc=calculators.find(c=>c.id===id)!,v=inputs(id,mode,values);assert.deepEqual(await runClientCalculation(id,calc.category,mode,v),runCalculation(id,mode,v));}
});
