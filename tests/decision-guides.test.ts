import test from 'node:test';import assert from 'node:assert/strict';
import cases from '../src/lib/decision-guide-cases.json';import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const targets={mortgage:['mortgage-vs-invest','compare'],drip:['drip','projection'],roth:['roth-conversion-ladder','bridge'],cap:['cash-on-cash-return','property']} as const;
for(const [topic,rows] of Object.entries(cases))for(const row of rows)test('Independent 60-digit guide arithmetic: '+topic+'/'+row.label,()=>{
 const [id,mid]=targets[topic as keyof typeof targets],c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mid)!;
 const r=runCalculation(id,mid,{...defaults(m),...Object.fromEntries(Object.entries(row.values).map(([k,v])=>[k,String(v)]))});
 for(const [label,value] of Object.entries(row.metrics)){const actual=r.metrics.find(m=>m.label===label);assert.ok(actual,label);assert.ok(Math.abs(actual.value-value)<1e-6,label);}
});
test('Published scenario set retains losses and tax shortfalls as well as favorable cases',()=>{
 assert.ok(cases.drip.some(r=>r.metrics['DRIP minus cash-dividend wealth']<0));
 assert.ok(cases.cap.some(r=>r.metrics['Cash-on-cash return']<0));
 assert.equal(cases.roth[1].metrics['Additional bridge cash needed'],24000);
 assert.equal(cases.roth[2].metrics['Additional bridge cash needed'],0);
 assert.ok(Math.abs(cases.mortgage[3].metrics['Invest-first advantage at horizon'])<.000001);
});
