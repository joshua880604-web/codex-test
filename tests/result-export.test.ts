import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultExportData} from '../src/lib/result-export';
test('Shared PNG and print data retain the independently checked 401(k) growth reconciliation and withdrawal context',async()=>{
 const mode=calculators.find(c=>c.id==='401k')!.modes.find(m=>m.id==='projection')!;
 const v={...defaults(mode),age:'65',retire:'66',life:'67',salary:'12000',balance:'1000',contribution:'10',match:'50',match_limit:'6',return:'10',inflation:'0'};
 const result=runCalculation('401k',mode.id,v),original=JSON.stringify(result),data=await resultExportData('401k',mode,v,result);
 assert.equal(data.metrics.find(m=>m.label==='Projected investment growth')!.value,100);
 assert.equal(data.metrics.find(m=>m.label==='Projected 401(k) balance')!.value,2660);
 assert.match(data.copy.interpretation!,/age 66/);assert.match(data.copy.interpretation!,/age 67/);assert.match(data.copy.interpretation!,/today’s dollars/);
 assert.ok(data.notes.some(n=>n.includes('full vesting and no fees')));assert.equal(JSON.stringify(result),original);
});
test('Export preparation preserves signed 401(k) losses and explicit IRR ambiguity',async()=>{
 const k=calculators.find(c=>c.id==='401k')!.modes.find(m=>m.id==='projection')!,v={...defaults(k),age:'60',retire:'65',life:'80',salary:'0',balance:'100000',return:'-5',inflation:'0'};
 const data=await resultExportData('401k',k,v,runCalculation('401k',k.id,v));assert.ok(data.metrics.find(m=>m.label==='Projected investment loss')!.value<0);
 const m=calculators.find(c=>c.id==='irr')!.modes[0],r={metrics:[{label:'IRR 1',value:10,format:'percent' as const},{label:'IRR 2',value:20,format:'percent' as const}],notes:['Original model note.']};
 const irr=await resultExportData('irr',m,defaults(m),r);assert.ok(irr.notes.some(n=>n.includes('no single unambiguous rate')));assert.ok(irr.notes.includes('Original model note.'));assert.equal(irr.metrics.length,2);
});
