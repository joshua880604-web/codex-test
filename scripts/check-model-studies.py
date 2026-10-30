"""Independent 60-digit Decimal arithmetic; uses no TypeScript engine functions.
Checks published data against formulas and writes transparent regression fixtures.
"""
import json
from decimal import Decimal as D, getcontext
from pathlib import Path
getcontext().prec=60
p=Path('src/lib/model-study-data.json'); data=json.loads(p.read_text()); expected={'coast':[],'brrrr':[],'roas':[]}
def check(actual,wanted,tolerance=D('0.0000001')):
 assert abs(D(str(actual))-wanted)<=tolerance,(actual,str(wanted))
for r in data['coast']:
 n=D(str(r['nominal']))/100;i=D(str(r['inflation']))/100;g=(1+n)/(1+i)
 t=D(40000)/D('.04')/(g**30); real=(g-1)*100
 check(r['threshold'],t);check(r['realReturn'],real)
 expected['coast'].append({'nominal':r['nominal'],'inflation':r['inflation'],'threshold':str(t),'realReturn':str(real)})
for r in data['brrrr']:
 # Explicit funding arithmetic, independently stated in the article.
 cash=D(150000)+4500+D(35000)*D('1.10')+500*6+D(120000)*D('.10')*D(6)/12+D(120000)*D('.02')-120000
 loan=D(r['arv'])*D('.75'); rate=D(r['rate'])/1200
 pay=loan*rate/(1-(1+rate)**D(-360)); left=cash-(loan-120000-4000)
 flow=D(2200)*D('.95')-600-100-pay
 coc=flow*12/left*100 if left>=D('.005') else None
 for k,v in [('cashBefore',cash),('loan',loan),('payment',pay),('cashLeft',left),('cashFlow',flow)]:check(r[k],v)
 if coc is None:assert r['coc'] is None
 else:check(r['coc'],coc)
 expected['brrrr'].append({'arv':r['arv'],'rate':r['rate'],'cashBefore':str(cash),'loan':str(loan),'payment':str(pay),'cashLeft':str(left),'cashFlow':str(flow),'coc':None if coc is None else str(coc)})
for r in data['roas']:
 margin=D(r['margin'])/100;multiple=D(r['multiple']);spend=D(12000)/multiple;contribution=D(12000)*margin-spend
 vals={'spend':spend,'breakEven':1/margin,'postAdDollars':contribution,'postAdMargin':contribution/12000*100}
 for k,v in vals.items():check(r[k],v)
 expected['roas'].append({'margin':r['margin'],'multiple':r['multiple'],**{k:str(v) for k,v in vals.items()}})
Path('tests/fixtures/model-study-expected.json').write_text(json.dumps(expected,indent=2)+'\n')
print('All47cases match independent60-digit Decimal arithmetic within0.0000001;fixtures written.')
