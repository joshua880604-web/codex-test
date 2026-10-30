"""Independent 60-digit Decimal ledger. Does not import or run the app model."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,itertools
getcontext().prec=60
base={'start_year':'2027','age':'40','years':'10','pretax':'500000','bridge':'300000','roth_basis':'0','conversion':'40000','conversion_growth':'0','spending':'40000','spending_growth':'0','tax':'20','pretax_return':'0','roth_return':'0'}
cases=[{**base,'years':str(y),'tax':str(tax),'roth_basis':str(basis),'roth_return':str(ret)} for y,tax,basis,ret in itertools.product([1,5,6,10],[0,20],[0,20000],[-50,0,5])]
cases.extend([{**base,'bridge':'240000'},{**base,'bridge':'0'},{**base,'pretax':'15000'},{**base,'conversion_growth':'3','spending_growth':'2','pretax_return':'5','roth_return':'5'},{**base,'pretax_return':'-40','roth_return':'-90'},{**base,'conversion':'0','roth_basis':'10000'},{**base,'spending':'0'},{**base,'tax':'100'},{**base,'pretax':'0','bridge':'0','roth_basis':'0'},{**base,'start_year':'2025','years':'6'},{**base,'pretax_return':'5','roth_return':'5'}])
fixtures=[]
for v in cases:
 n=lambda k:D(v[k]);pre=n('pretax');cash=n('bridge');roth=n('roth_basis');regular=roth;rungs=[];rows=[]
 convertedTotal=taxTotal=taxPaid=unpaidTax=unpaidLiving=paidLiving=usedRegular=usedRungs=missedConversion=D(0);firstShort=firstSeasoned=None
 for i in range(int(v['years'])):
  y=int(v['start_year'])+i;planned=n('conversion')*(1+n('conversion_growth')/100)**i;conv=min(pre,planned);pre-=conv;roth+=conv;convertedTotal+=conv;missedConversion+=planned-conv
  if conv>0:rungs.append({'year':y,'amount':conv,'left':conv,'withdrawn':D(0)})
  due=conv*n('tax')/100;paid=min(cash,due);cash-=paid;missingTax=due-paid;taxTotal+=due;taxPaid+=paid;unpaidTax+=missingTax
  budget=n('spending')*(1+n('spending_growth')/100)**i;remaining=budget;reg=min(remaining,regular,roth);regular-=reg;roth-=reg;remaining-=reg;usedRegular+=reg
  consumed=D(0)
  for rung in rungs:
   if y-rung['year']<5:break
   draw=min(remaining,rung['left'],roth);rung['left']-=draw;rung['withdrawn']+=draw;roth-=draw;remaining-=draw;consumed+=draw
  if consumed>0 and firstSeasoned is None:firstSeasoned=y
  usedRungs+=consumed;cashSpend=min(remaining,cash);cash-=cashSpend;remaining-=cashSpend;unpaidLiving+=remaining;paidLiving+=cashSpend
  if (remaining>D('0.0000001') or missingTax>D('0.0000001')) and firstShort is None:firstShort=y
  pre*=1+n('pretax_return')/100;roth*=1+n('roth_return')/100
  mature=sum((r['left'] for r in rungs if y>=r['year']+5),D(0));rows.append([str(x) for x in [y,n('age')+i,planned,conv,due,paid,missingTax,budget,reg,consumed,cashSpend,remaining,pre,roth,cash,mature,regular]])
 short=unpaidTax+unpaidLiving;required=paidLiving+taxTotal+unpaidLiving;first=rungs[0]['year']+5 if rungs else 0
 metrics=[required,short,0 if short>D('0.0000001') else 1,first,convertedTotal,taxTotal,taxPaid,unpaidTax,unpaidLiving,usedRegular,usedRungs,paidLiving,pre,roth,cash,missedConversion,firstShort or 0,firstSeasoned or 0]
 fixtures.append({'values':v,'metrics':[str(z) for z in metrics],'rows':rows,'rungs':[[str(r['year']),str(r['amount']),'January 1, '+str(r['year']+5),str(r['withdrawn']),str(r['left'])] for r in rungs]})
Path('tests/fixtures/roth-ladder-expected.json').write_text(json.dumps(fixtures,indent=2)+'\n');print('Created',len(fixtures),'independent Decimal fixtures, full annual ledgers and conversion-cohort records.')
