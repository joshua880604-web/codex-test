import {test} from 'node:test';import assert from 'node:assert/strict';
import {coastScenarios,cloneCoastValues,coastAssumptions} from '../src/lib/coast-scenarios';
import {coastFire,coastFireProjection} from '../src/lib/calculators/coast-fire';
import {defaults} from '../src/lib/types';import {summaryPNGData} from '../src/lib/summary-png';import {resultExportData} from '../src/lib/result-export';
import {calculatorPresetHref} from '../src/lib/preset-links';import {sharedInputs} from '../src/lib/sharing';
test('All example scenarios define every field and independent, reproducible complete plan inputs',()=>{
 const keys=Object.keys(defaults(coastFire.modes[0])).sort();assert.equal(coastScenarios.length,3);
 for(const s of coastScenarios){assert.deepEqual(Object.keys(s.values).sort(),keys);const v=cloneCoastValues(s.values),r=coastFireProjection(v);assert.ok(Number.isFinite(r.metrics[0].value));const link=new URL(calculatorPresetHref('/coast-fire-calculator','coast',v),'https://www.calculatorfree.io');assert.deepEqual(sharedInputs(coastFire,'',link.hash)!.values,v);v.balance='0';assert.notEqual(v.balance,s.values.balance);}
 const couple=coastScenarios[2].values;assert.match(coastAssumptions(couple),/\$250,000/);assert.match(coastAssumptions(couple),/\$1,750/);
});
test('Coast A/B changes use exactly the current engine without mutating the original plan',()=>{
 const a=cloneCoastValues(coastScenarios[0].values),b=cloneCoastValues(a),prior=JSON.stringify(a);b.inflation='3.5';const ra=coastFireProjection(a),rb=coastFireProjection(b);assert.ok(rb.metrics[0].value>ra.metrics[0].value);assert.equal(JSON.stringify(a),prior);
 const target=Number(a.spending)/(Number(a.withdrawal)/100);for(const v of [a,b])assert.ok(Math.abs(coastFireProjection(v).metrics[0].value-target/((1+Number(v.return)/100)/(1+Number(v.inflation)/100))**(Number(v.retire)-Number(v.age)))<1e-7);
});
test('Compact Coast PNG retains status, real-dollar horizon/rate assumptions, scope and risk while omitting unselected amounts',async()=>{
 const mode=coastFire.modes[0],v={...defaults(mode),balance:'0',monthly:'0'},r=coastFireProjection(v),data=await resultExportData('coast-fire',mode,v,r),compact=summaryPNGData('coast-fire',v,mode.fields,data,false);
 assert.equal(compact.details.trend,null);assert.equal(compact.details.formula,'');assert.equal(compact.details.layout,'summary');assert.equal(compact.details.disclosure,'key');assert.ok(compact.metrics.some(m=>m.displayValue==='Not reached by target age'));assert.ok(compact.notes.some(n=>n.includes('safe-rate guarantee')));assert.ok(compact.details.inputs.some(i=>i.label==='Shared planning horizon'&&i.value.startsWith('30 years')));assert.ok(!compact.details.inputs.some(i=>i.label==='Current invested retirement assets'));assert.ok(compact.details.inputs.some(i=>i.label==='Nominal annual return, after fees'));
 const all=summaryPNGData('coast-fire',v,mode.fields,data,true);assert.ok(all.details.inputs.some(i=>i.label==='Current invested retirement assets'));assert.equal(all.details.disclosure,'all');assert.ok(data.notes.length>0);
});
test('Summary PNG preserves diagnostic display values and multiple-IRR warnings beyond the selected highlights',()=>{
 const data={metrics:[...Array.from({length:5},(_,i)=>({label:'Result '+i,value:i})),{label:'Status',value:0,displayValue:'Not applicable'}],notes:['Multiple IRRs detected; there is no single unambiguous rate.'],scope:'Equal annual periods.',copy:{interpretation:null,tagline:'Source'}};
 const s=summaryPNGData('irr',{},[],data,false);assert.ok(s.metrics.some(m=>m.displayValue==='Not applicable'));assert.ok(s.notes.some(n=>n.startsWith('Multiple IRRs detected')));
 const ordinary=summaryPNGData('scientific',{angle:'Degrees',expression:'sin(30)'},[{key:'angle',label:'Angle units',value:'Degrees',type:'select',options:['Degrees','Radians']}],data,false);assert.ok(ordinary.details.inputs.some(i=>i.value==='Degrees'));assert.ok(!ordinary.notes.at(-1)!.includes('financial advice'));
});
