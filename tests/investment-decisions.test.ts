import {test} from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {directorySearch} from '../src/lib/directory';import {calculators as catalog} from '../src/lib/catalog';
import {imageMetrics,imageDetails} from '../src/lib/result-image-data';
const run=(id:string,mode:string,extra:Partial<Record<string,string|number>>={})=>{const m=calculators.find(c=>c.id===id)!.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(extra).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});};
const val=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
test('Tax-equivalent yield matches independent hand controls for federal and state exemption',()=>{
 const a=run('tax-equivalent-yield','compare',{exempt_yield:4,taxable_yield:5,federal:20,state:0,local:0,surtax:0,amount:10000});close(val(a,'Tax-equivalent taxable yield'),5);close(val(a,'Annual after-tax income advantage'),0);
 const b=run('tax-equivalent-yield','compare',{exempt_yield:4,taxable_yield:6,federal:24,state:5,local:1,surtax:0,muni_state:'Taxed',amount:10000});close(val(b,'Tax-equivalent taxable yield'),4*.94/.70);close(val(b,'Tax-exempt option annual income after tax'),376);close(val(b,'Taxable option annual income after tax'),420);close(val(b,'Annual after-tax income advantage'),-44);
 const c=run('tax-equivalent-yield','compare',{federal:24,state:5,local:1,surtax:3.8,muni_state:'Exempt'});close(val(c,'Combined tax rate on taxable income'),33.8);close(val(c,'Tax-equivalent taxable yield'),4/.662);
});
test('Tax-equivalent zero yield, zero amount and high marginal rates remain finite without hiding negative comparison',()=>{
 const zero=run('tax-equivalent-yield','compare',{exempt_yield:0,amount:0});close(val(zero,'Tax-equivalent taxable yield'),0);close(val(zero,'Annual after-tax income advantage'),0);
 const high=run('tax-equivalent-yield','compare',{federal:99,state:0,local:0,surtax:0});close(val(high,'Tax-equivalent taxable yield'),400,1e-9);
 for(const fields of [{federal:99,state:1},{federal:50,state:25,local:25},{exempt_yield:-1},{federal:'NaN'},{amount:''},{muni_state:'Unknown'}])assert.throws(()=>run('tax-equivalent-yield','compare',fields));
});
test('Equivalent taxable yield truly equalizes after-tax income and sensitivity uses fixed exempt treatment',()=>{
 for(const taxed of ['Exempt','Taxed']){
  const r=run('tax-equivalent-yield','compare',{state:5,local:2,muni_state:taxed});const eq=val(r,'Tax-equivalent taxable yield');const x=run('tax-equivalent-yield','compare',{state:5,local:2,muni_state:taxed,taxable_yield:eq});close(val(x,'Annual after-tax income advantage'),0);
  for(const row of r.rows!)close(Number(row[1])*(1-Number(row[0])/100),val(r,'Tax-exempt option after-tax yield'));
 }
});
test('TreasuryDirect published 182-day discount-price control retains unrounded math',()=>{
 const r=run('treasury-bill','discount',{face:1000,days:182,discount:.145,fee:0,federal:0,surtax:0});
 close(val(r,'Purchase price before fee'),999.2669444444444);close(val(r,'Gross discount interest at maturity'),.7330555555555556);assert.equal(val(r,'Purchase price before fee').toFixed(2),'999.27');
});
test('Quoted-price bill control distinguishes face discount from cost return and federal tax',()=>{
 const r=run('treasury-bill','price',{face:10000,days:91,price100:98,fee:10,federal:24,surtax:0,year_days:'365'});
 close(val(r,'Net profit at maturity after fee and tax'),142);close(val(r,'Total purchase cash outlay'),9810);close(val(r,'Estimated federal tax on discount interest'),48);close(val(r,'Bank discount rate (360-day face basis)'),.02*360/91*100);
 close(val(r,'Holding-period return before fee and tax'),200/9800*100);close(val(r,'Simple annualized yield before fee and tax'),200/9800*365/91*100);close(val(r,'Hypothetical effective annual yield'),((10000/9800)**(365/91)-1)*100);
 close(r.rows!.reduce((s,row)=>s+Number(row[1]),0),142);
});
test('Bill discount/price modes round-trip before display rounding, and year basis never changes price',()=>{
 for(const days of [1,28,42,56,91,119,182,364,366]){
  const a=run('treasury-bill','discount',{days,discount:4.5});const b=run('treasury-bill','price',{days,price100:val(a,'Purchase price before fee')/10000*100});
  close(val(b,'Bank discount rate (360-day face basis)'),4.5,1e-7);close(val(a,'Net profit at maturity after fee and tax'),val(b,'Net profit at maturity after fee and tax'));
  const leap=run('treasury-bill','discount',{days,discount:4.5,year_days:'366'});close(val(a,'Purchase price before fee'),val(leap,'Purchase price before fee'));close(val(leap,'Simple annualized yield before fee and tax')/val(a,'Simple annualized yield before fee and tax'),366/365);
 }
});
test('Bills at par show zero gross return; fees cause actual negative net return',()=>{
 const r=run('treasury-bill','price',{price100:100,fee:10});close(val(r,'Gross discount interest at maturity'),0);close(val(r,'Hypothetical effective annual yield'),0);close(val(r,'Net profit at maturity after fee and tax'),-10);assert.ok(val(r,'Net simple annualized yield after fee and tax')<0);
 const d=run('treasury-bill','discount',{discount:0,fee:0});close(val(d,'Net profit at maturity after fee and tax'),0);
});
test('Bill inputs reject invalid dates/counts, denomination, premium, nonpositive price and combined tax',()=>{
 for(const v of [{days:0},{days:1.5},{days:367},{face:150},{face:0},{discount:99,days:366},{federal:99,surtax:1},{fee:-1},{year_days:'360'},{days:''}])assert.throws(()=>run('treasury-bill','discount',v));
 for(const v of [{price100:0},{price100:101},{price100:.000001,days:1},{price100:'Infinity'}])assert.throws(()=>run('treasury-bill','price',v));
});
test('New tool synonyms resolve uniquely and lazy runtimes match server with all PNG metrics',async()=>{
 for(const [id,queries] of [['tax-equivalent-yield',['tax equivalent yield','taxable equivalent yield']],['treasury-bill',['t bill','t-bill','treasury bill']]] as const){
  for(const query of queries){const results=directorySearch(catalog,query);assert.equal(results[0].tool.id,id);assert.equal(results.filter(r=>r.tool.id===id).length,1);}
  const calc=calculators.find(c=>c.id===id)!;
  for(const mode of calc.modes){const v=defaults(mode),r=run(id,mode.id);assert.deepEqual(await runClientCalculation(id,calc.category,mode.id,v),r);assert.equal(imageMetrics(id,mode.id,r).length,r.metrics.length);assert.deepEqual(imageDetails(id,mode,v,r,mode.fields,false).inputs,[]);assert.equal(imageDetails(id,mode,v,r,mode.fields,false).trend,null);}
 }
});
