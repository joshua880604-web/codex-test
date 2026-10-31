import assert from 'node:assert/strict';import fs from 'node:fs';
import cases from '../src/lib/decision-guide-cases.json';import {calculators,defaults,runCalculation} from '../src/lib/calculators';
const targets={mortgage:['mortgage-vs-invest','compare'],drip:['drip','projection'],roth:['roth-conversion-ladder','bridge'],cap:['cash-on-cash-return','property']} as const;
let checks=0,maxDifference=0;
for(const [topic,rows] of Object.entries(cases))for(const row of rows){const [id,modeId]=targets[topic as keyof typeof targets];const c=calculators.find(c=>c.id===id)!;const mode=c.modes.find(m=>m.id===modeId)!;const values={...defaults(mode),...Object.fromEntries(Object.entries(row.values).map(([k,v])=>[k,String(v)]))};const result=runCalculation(id,modeId,values);
 for(const [label,expected] of Object.entries(row.metrics)){const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,label);const difference=Math.abs(actual.value-expected);maxDifference=Math.max(maxDifference,difference);assert.ok(difference<1e-6,`${topic}/${row.label}/${label}: ${actual.value} vs ${expected}`);checks++;}
 if(topic==='roth')for(let i=0;i<(row as any).rows.length;i++){const ref=(row as any).rows[i];for(const [key,col] of Object.entries({year:0,cash_living:10,cash_tax:5,roth_basis:8,seasoned:9,unfunded_living:11,unfunded_tax:6})){assert.ok(Math.abs(Number(result.rows![i][col])-ref[key])<1e-6);checks++;}}
}
console.log(JSON.stringify({cases:Object.values(cases).flat().length,metricAndRowChecks:checks,tolerance:1e-6,maxDifference,independentArithmetic:'Python Decimal 60 digits',status:'passed'}));
