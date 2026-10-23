import test from 'node:test';
import assert from 'node:assert/strict';
import {glossaryTerms,glossaryCategories,glossaryForCalculator} from '../src/lib/glossary';
import {calculators} from '../src/lib/calculators';
// Independent arithmetic oracles from the explicitly stated worked examples.
// Every value is also bound to a published phrase, so editing the prose cannot silently invalidate the check.
type Case=[string,()=>number,number,string];
const cases:Case[]=[
 ['simple-interest',()=>2000*.05*3,300,'Simple interest is $300'],
 ['apy',()=>((1+.05/12)**12-1)*100,5.116189788173298,'5.1162%'],
 ['inflation',()=>1000*1.03**2,1060.9,'$1,060.90'],
 ['time-value-of-money',()=>1210/1.1**2,1000,'present value of $1,000'],
 ['return-on-investment',()=>(2500-2000)/2000*100,25,'Total ROI is 25% over two years'],
 ['internal-rate-of-return',()=>-1000+1100/1.1,0,'annual IRR is 10%'],
 ['net-present-value',()=>-1000+1100/1.05,47.61904761904771,'NPV is about $47.62'],
 ['payback-period',()=>6000/2000,3,'payback is three years'],
 ['bond-yield',()=>50/950*100,5.263157894736842,'5.2632%'],
 ['certificate-of-deposit',()=>5000*1.04**2,5408,'Maturity value is $5,408'],
 ['mutual-funds-and-etfs',()=>(10200000-200000)/1000000,10,'NAV is $10 per share'],
 ['arithmetic-vs-geometric-return',()=>(Math.sqrt(1.2*.8)-1)*100,-2.02041028867288,'−2.0204%'],
 ['annuity',()=>[1,2,3].reduce((n,t)=>n+1000/1.05**t,0),2723.248029370479,'present value of $2,723.25'],
 ['traditional-vs-roth-ira',()=>1000*.78*2,1560,'Both leave $1,560'],
 ['employer-match-and-vesting',()=>Math.min(60000*.1,60000*.06)*.5*.4,720,'$720 of the match is owned'],
 ['required-minimum-distribution',()=>246000/24.6,10000,'2026 RMD is $10,000'],
 ['social-security-benefits',()=>2000*.7,1400,'benefit is $1,400 a month'],
 ['withdrawal-rate',()=>1000000*.04*1.03,41200,'second-year illustration is $41,200'],
 ['defined-benefit-pension',()=>30*.015*60000,27000,'$27,000 a year'],
 ['apr',()=>(11000/(10000-100)-1)*100,11.111111111111116,'cash-flow cost is about 11.1111%'],
 ['principal-and-interest',()=>12000-(1000-12000*.06/12),11060,'Closing principal: $12,000 − $940 = $11,060'],
 ['fixed-vs-variable-interest',()=>Math.min(4+2.5,5+1),6,'capped illustrative reset is 6%'],
 ['debt-to-income-ratio',()=>(1400+400)/6000*100,30,'Total DTI is 30%'],
 ['debt-consolidation',()=>(2000+3000)*1.03,5150,'new loan starts at $5,150'],
 ['debt-snowball-vs-avalanche',()=>Math.max(.10,.20)*100,20,'Debt B is $2,000 at 20%'],
 ['capitalized-interest',()=>(10000+500)*.06-10000*.06,30,'$30 to the next illustrated year'],
 ['interest-only-and-balloon-loans',()=>100000*.06/12,500,'$500 monthly'],
 ['loan-to-value-ratio',()=>(240000+15000)/300000*100,85,'CLTV with the second loan is 85%'],
 ['home-equity-and-heloc',()=>300000*.8-180000,60000,'borrowing room is only $60,000'],
 ['mortgage-points',()=>240000*.0125/60,50,'recovery of 50 months'],
 ['mortgage-escrow',()=>(3600+1200)/12,400,'Escrow adds $400'],
 ['private-mortgage-insurance',()=>200000*.005/12,83.33333333333333,'monthly premium is $83.33'],
 ['refinance-break-even',()=>2400/(1500-1400),24,'cost recovery is 24 months'],
 ['cap-rate-vs-cash-on-cash-return',()=>(16000-10000)/60000*100,10,'cash-on-cash is 10%'],
 ['down-payment',()=>300000*(1-.15),255000,'base loan is $255,000'],
 ['marginal-vs-effective-tax-rate',()=>(20000*.1+10000*.2)/30000*100,13.333333333333334,'13.3333%'],
 ['deduction-vs-credit',()=>1000*.2,200,'deduction saves $200'],
 ['gross-vs-net-pay',()=>2000-300-100-80,1520,'take-home amount is $1,520'],
 ['sales-tax-vs-vat',()=>120-120/1.2,20,'$100 net price and $20 tax'],
 ['estate-vs-inheritance-tax',()=>100000*.05,5000,'hypothetical tax is $5,000'],
 ['break-even-point',()=>1000/(25-15),100,'At 100 units'],
 ['contribution-margin',()=>100*(40-24)-1000,600,'only $600 in total'],
 ['depreciation',()=>(12000-2000)/5,2000,'depreciation is $2,000'],
 ['commission',()=>20000*.04,800,'commission is $800'],
 ['lease-residual-value',()=>(30000-18000)/36+(30000+18000)*.002,429.3333333333333,'base payment is $429.33'],
 ['ecpm',()=>120/40000*1000,3,'ad eCPM is $3'],
 ['emergency-fund',()=>2500*6-5000,10000,'$10,000 gap'],
 ['budget-and-savings-rate',()=>(4000-3300)/4000*100,17.5,'17.5% of take-home income'],
 ['exchange-rate',()=>100*.9*(1-.02),88.2,'reduces it to €88.20'],
 ['percentage-vs-percentage-points',()=>(6-5)/5*100,20,'relative increase is 20%'],
 ['margin-and-leverage',()=>((10000*.9-5000)/5000-1)*100,-20,'20% equity loss'],
];
for(const [slug,calculate,expected,phrase] of cases)test('Glossary independent example arithmetic: '+slug,()=>{
 const term=glossaryTerms.find(t=>t.slug===slug);assert.ok(term);
 assert.ok(Math.abs(calculate()-expected)<1e-8,slug);
 assert.ok(JSON.stringify(term.example).includes(phrase),`${slug}: published arithmetic phrase changed: ${phrase}`);
});
test('Every financial calculator has at least one relevant term and every topic is discoverable',()=>{
 for(const calc of calculators.filter(c=>!c.directory&&c.category!=='Everyday Tools'))assert.ok(glossaryForCalculator(calc.id).length,calc.id);
 assert.deepEqual(new Set(glossaryTerms.map(t=>t.category)),new Set(glossaryCategories));
 for(const term of glossaryTerms){
  assert.match(term.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(term.definition&&term.formulaNote&&term.example.assumptions&&term.sources.length);
  assert.ok(term.related.length>0,term.slug+' is isolated');
  assert.equal(new Set(term.tools.map(t=>t.id)).size,term.tools.length);
  assert.equal(new Set(term.related).size,term.related.length);
  for(const source of term.sources){const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.ok(source.title);}
 }
 assert.equal(cases.length,51);
 assert.ok(glossaryTerms.find(t=>t.slug==='ecpm')!.tools.length===0,'No invented advertising calculator');
});
test('Cash-flow, tax, retirement and rate examples retain their essential scope distinctions',()=>{
 const term=(slug:string)=>glossaryTerms.find(t=>t.slug===slug)!;
 assert.match(term('apr').formulaNote,/not a universal legal APR/);
 assert.match(term('marginal-vs-effective-tax-rate').example.assumptions,/Invented brackets/);
 assert.match(term('estate-vs-inheritance-tax').example.assumptions,/Fictional flat rate/);
 assert.match(term('required-minimum-distribution').example.assumptions,/2025|1951/);
 assert.match(term('required-minimum-distribution').example.intro,/December 31, 2025/);
 assert.match(term('social-security-benefits').scope!,/1960 or later/);
 assert.match(term('withdrawal-rate').pitfall.title,/not a guaranteed/);
 assert.match(term('exchange-rate').pitfall.text,/saved-rate mode and manual mode/);
 assert.match(term('ecpm').explanation,/page RPM.*page views.*ad RPM.*ad impressions/);
 const npv=(r:number)=>-100+230/(1+r)-132/(1+r)**2;
 assert.ok(Math.abs(npv(.1))<1e-10&&Math.abs(npv(.2))<1e-10,'Both IRR counterexample roots must hold');
 assert.equal((100*.8*1.2).toFixed(2),'96.00');
 assert.equal((100/80-1)*100,25);
});
