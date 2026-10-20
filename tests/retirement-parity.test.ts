import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {retirementIncome} from '../src/lib/retirement-projection';
const run=(id:string,mode:string,v:Record<string,string|number>)=>{const m=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(v).map(([k,x])=>[k,String(x)]))});};
const close=(a:number,b:number,tol=.005)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const value=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
test('Retirement annual deposits follow year-end timing, separately from monthly deposits',()=>{
 const r=run('retirement','withdrawal',{age:65,retire:67,life:77,balance:0,saving:0,annual:1000,return:6,inflation:0});close(value(r,'Balance at retirement'),2060);
 const monthly=run('retirement','withdrawal',{age:65,retire:67,life:77,balance:0,saving:1000/12,annual:0,return:6,inflation:0});assert.ok(value(monthly,'Balance at retirement')>2060);
 const combined=run('retirement','withdrawal',{age:65,retire:67,life:77,balance:0,saving:100,annual:1000,return:0,inflation:0});close(value(combined,'Balance at retirement'),4400);
});
test('401k life expectancy changes withdrawals, not the accumulation balance',()=>{
 const a=run('401k','projection',{age:67,retire:67,life:68,balance:12000,return:0,inflation:0});
 const b=run('401k','projection',{age:67,retire:67,life:69,balance:12000,return:0,inflation:0});
 close(value(a,'Initial monthly retirement withdrawal'),1000);close(value(b,'Initial monthly retirement withdrawal'),500);
 close(value(a,'Projected 401(k) balance'),value(b,'Projected 401(k) balance'));assert.equal(a.additionalTables![0].rows.length,1);assert.equal(b.additionalTables![0].rows.length,2);close(Number(b.additionalTables![0].rows[1][4]),0);
});
test('Retirement withdrawals match independent discounted growing cash flows',()=>{
 for(const [r,inf,years] of [[.06,.03,30],[0,0,10],[-.02,.01,20],[.03,.03,25],[.05,-.01,15]]){
 const result=retirementIncome(100000,r,inf,years,67);let pv=0;
 for(let month=1;month<=years*12;month++)pv+=result.initial*(1+inf)**((month-1)/12)/(1+r)**(month/12);
 close(pv,100000,.0001);close(Number(result.rows.at(-1)![4]),0,.0001);
 for(const row of result.rows)close(Number(row[1])+Number(row[2])-Number(row[3]),Number(row[4]),.0001);
 close(result.rows.reduce((s,row)=>s+Number(row[3]),0),result.total,.0001);
 }
});
test('Retirement empty balances and horizon limits remain finite and bounded',()=>{
 const r=retirementIncome(0,.06,.03,23,67);assert.equal(r.initial,0);assert.ok(r.rows.every(row=>row.slice(1).every(x=>x===0)));
 for(const years of [0,1.5,101])assert.throws(()=>retirementIncome(1000,.05,.02,years,67));
 assert.throws(()=>retirementIncome(1000,-1,0,10,67));assert.throws(()=>run('401k','projection',{life:90.5}));
});
test('Two-tier match returns the independently calculated safe contribution window',()=>{
 const r=run('401k','match',{age:35,salary:80000,match1:100,limit1:3,match2:50,limit2:2});
 close(value(r,'Minimum contribution rate for full match'),5);close(value(r,'Maximum steady contribution rate'),30.625);close(value(r,'Employer annual match'),3200);close(value(r,'Annual contribution to maximize match'),4000);
 // Monthly payroll at the endpoints stays eligible for the complete match every period.
 for(const rate of [.05,.30625]){let remaining=24500,totalMatch=0;for(let i=0;i<12;i++){const salary=80000/12,employee=Math.min(salary*rate,remaining);remaining-=employee;totalMatch+=Math.min(employee,salary*.03)+Math.min(Math.max(0,employee-salary*.03),salary*.02)*.5;}close(totalMatch,3200);}
});
test('Unattainable matching does not claim an achievable full-match window',()=>{
 const r=run('401k','match',{age:35,salary:100000,match1:100,limit1:70,match2:50,limit2:20});
 assert.ok(r.notes!.some(n=>n.includes('No full-match')));assert.equal(r.metrics.some(m=>m.label==='Minimum contribution rate for full match'),false);close(value(r,'Maximum steady contribution rate'),24.5);close(value(r,'Employer annual match'),24500);
});
test('Zero-match tiers do not demand employee contributions for no matching benefit',()=>{
 const none=run('401k','match',{match1:0,match2:0});close(value(none,'Minimum contribution rate for full match'),0);close(value(none,'Employer annual match'),0);
 const first=run('401k','match',{match1:100,limit1:3,match2:0,limit2:2});close(value(first,'Minimum contribution rate for full match'),3);
 assert.throws(()=>run('401k','match',{salary:0}),/greater than zero/);assert.throws(()=>run('401k','match',{limit1:70,limit2:40}),/100%/);
});
test('Match window respects age-based catch-up changes',()=>{
 for(const [age,cap] of [[49,24500],[50,32500],[60,35750],[64,32500]])close(value(run('401k','match',{age,salary:100000}),'Maximum steady contribution rate'),cap/1000);
});
test('Early withdrawal qualification branches preserve ordinary tax and waive only penalty',()=>{
 const base={withdrawal:10000,federal:22,state:5,local:0};
 for(const flags of ([{employed:'No',separated55:'Yes'},{disabled:'Yes'},{exception:'Yes'}] as Record<string,string>[])){const r=run('401k','early',{...base,...flags});close(value(r,'Additional early withdrawal tax'),0);close(value(r,'Estimated income tax'),2700);close(value(r,'Net amount received'),7300);}
 const r=run('401k','early',{...base,employed:'Yes',separated55:'Yes'});close(value(r,'Additional early withdrawal tax'),1000);close(value(r,'Net amount received'),6300);
});

test('Savings longevity counts actual monthly withdrawals and caps the final payment',()=>{
 const zero=run('retirement','longevity',{balance:1000,withdrawal:300,return:0});
 close(value(zero,'Monthly withdrawals'),4);close(value(zero,'Years savings last'),4/12);
 close(value(zero,'Total withdrawn'),1000);close(value(zero,'Final monthly withdrawal'),100);
 for(const annual of [6,-12]){
  const r=run('retirement','longevity',{balance:1000,withdrawal:300,return:annual});
  let balance=1000,total=0,count=0,last=0;
  while(balance>1e-9){balance*=(1+annual/100)**(1/12);last=Math.min(300,balance);total+=last;balance-=last;count++;}
  close(value(r,'Monthly withdrawals'),count);close(value(r,'Total withdrawn'),total);close(value(r,'Final monthly withdrawal'),last);
  for(const row of r.rows!)close(Number(row[2])+Number(row[3])-Number(row[4]),Number(row[5]),1e-8);
 }
 const empty=run('retirement','longevity',{balance:0,withdrawal:0,return:0});close(value(empty,'Total withdrawn'),0);
 assert.throws(()=>run('retirement','longevity',{balance:1000,withdrawal:0,return:0}),/greater than zero/);
 const perpetual=run('retirement','longevity',{balance:100000,withdrawal:100,return:6});assert.ok(perpetual.notes!.some(n=>n.includes('does not exhaust')));
});

test('Retirement starting now reports immediate funding shortfall instead of zero monthly saving',()=>{
 const input={age:67,retire:67,life:69,replacement:12000,replacement_unit:'Dollars per year',other:0,balance:5000,saving:1000,return:0,inflation:0};
 const r=run('retirement','required',input);
 close(value(r,'Required savings at retirement'),24000);close(value(r,'Projected retirement savings'),5000);
 close(value(r,'Additional savings needed now'),19000);
 assert.equal(r.metrics.some(m=>m.label==='Required monthly saving'),false);
 assert.ok(r.notes!.some(n=>n.includes('no remaining contribution period')));
 const funded=run('retirement','required',{...input,balance:30000});close(value(funded,'Additional savings needed now'),0);
 const future=run('retirement','required',{...input,age:66});close(value(future,'Required monthly saving'),19000/12);
});

test('Retirement age-based models consistently reject fractional life expectancy',()=>{
 for(const mode of ['required','withdrawal'])assert.throws(()=>run('retirement',mode,{life:90.5}),/whole numbers/);
 assert.throws(()=>run('401k','projection',{life:90.5}),/whole numbers/);
});
