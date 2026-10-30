import {test} from 'node:test';import assert from 'node:assert/strict';
import data from '../src/lib/model-study-data.json';
import expected from './fixtures/model-study-expected.json';
import {coastStudyArticle,brrrrStudyArticle,roasStudyArticle} from '../src/lib/model-study-articles';
import {calculators,runCalculation} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
const close=(actual:number,wanted:string)=>assert.ok(Math.abs(actual-Number(wanted))<=1e-7,`${actual} differs from independent ${wanted}`);
test('All47published model cases agree with independent60-digit Decimal fixtures and current engines',()=>{
 assert.deepEqual([data.coast.length,data.brrrr.length,data.roas.length],[15,12,20]);
 for(const [i,r] of data.coast.entries()){const e=expected.coast[i];assert.equal(r.nominal,e.nominal);assert.equal(r.inflation,e.inflation);close(r.threshold,e.threshold);close(r.realReturn,e.realReturn);const now=runCalculation('coast-fire','coast',r.values);close(now.metrics.find(m=>m.label==='Coast FIRE number today')!.value,e.threshold);}
 for(const [i,r] of data.brrrr.entries()){const e=expected.brrrr[i];for(const k of ['cashBefore','loan','payment','cashLeft','cashFlow'] as const)close(r[k],e[k]);if(e.coc===null)assert.equal(r.coc,null);else close(r.coc!,e.coc);const now=runCalculation('brrrr','deal',r.values);close(now.metrics.find(m=>m.label==='Cash remaining in deal (signed)')!.value,e.cashLeft);close(now.metrics.find(m=>m.label==='Monthly cash flow after reserve')!.value,e.cashFlow);}
 for(const [i,r] of data.roas.entries()){const e=expected.roas[i];for(const k of ['spend','breakEven','postAdDollars','postAdMargin'] as const)close(r[k],e[k]);const a=runCalculation('roas','actual',r.actualValues),b=runCalculation('roas','break-even',r.thresholdValues);close(b.metrics.find(m=>m.label==='Contribution before advertising')!.value-a.metrics.find(m=>m.label==='Advertising spend')!.value,e.postAdDollars);}
});
test('Every67calculator reproduction links preserve the complete mode and inputs',()=>{
 let links=0;for(const article of [coastStudyArticle,brrrrStudyArticle,roasStudyArticle])for(const row of article.rows)for(const link of row.links){const u=new URL(link.href,'https://www.calculatorfree.io'),id=article.meta.calculatorIds[0],calc=calculators.find(c=>c.id===id)!,restored=sharedInputs(calc,'',u.hash)!;assert.ok(restored);assert.ok(u.pathname===`/${id}-calculator`);assert.equal(u.search,'');const result=runCalculation(id,restored.mode.id,restored.values);assert.ok(result.metrics.length>0);links++;}assert.equal(links,67);
});
test('Charts match every plotted case including negative outcomes and do not imply empirical confidence',()=>{
 const coast=coastStudyArticle.figures[0];for(const [i,n] of [5,7,9].entries())assert.deepEqual(coast.series[i].values,data.coast.filter(r=>r.nominal===n).map(r=>r.threshold));
 assert.deepEqual(brrrrStudyArticle.figures[0].series[0].values,data.brrrr.filter(r=>r.rate===7).map(r=>r.cashLeft));assert.ok(brrrrStudyArticle.figures[0].series[0].values.some(n=>n<0));assert.ok(brrrrStudyArticle.figures[1].series[0].values.some(n=>n<0));
 for(const [i,m] of [20,30,40,50].entries())assert.deepEqual(roasStudyArticle.figures[0].series[i].values,data.roas.filter(r=>r.margin===m).map(r=>r.postAdMargin));
 const c25=data.coast.find(r=>r.nominal===7&&r.inflation===2.5)!,c35=data.coast.find(r=>r.nominal===7&&r.inflation===3.5)!;assert.ok(Math.abs((c35.threshold/c25.threshold-1)*100-33.8118367529)<1e-8);
 assert.equal(data.roas.find(r=>r.multiple===4&&r.margin===20)!.postAdDollars,-600);assert.equal(data.roas.find(r=>r.multiple===4&&r.margin===50)!.postAdDollars,3000);
});

test('SVG point titles serialize as single text nodes for HTML parser hydration',async()=>{
 const [{createElement},{renderToString},{default:StudyChart}]=await Promise.all([import('react'),import('react-dom/server'),import('../src/components/StudyChart')]);
 for(const article of [coastStudyArticle,brrrrStudyArticle,roasStudyArticle])for(const figure of article.figures){
  const markup=renderToString(createElement(StudyChart,{figure}));const titles=[...markup.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/g)].map(m=>m[1]);assert.ok(titles.length>1);for(const title of titles)assert.doesNotMatch(title,/<!--|-->/,'SVG title raw text must not contain React text-boundary comments');
 }
});
