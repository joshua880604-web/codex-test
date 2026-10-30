"""Independent Decimal stock/share/cash ledger; never imports or calls the TS model."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,itertools
getcontext().prec=60
base={'initial':'10000','price':'100','yield':'4','frequency':'Quarterly','monthly':'200','years':'6','price_growth':'3','dividend_growth':'2','tax':'0'}
cases=[]
for freq,tax,price,growth in itertools.product(['Monthly','Quarterly','Semiannually','Annually'],[0,25],[-15,0,6],[0,2]):cases.append({**base,'frequency':freq,'tax':str(tax),'price_growth':str(price),'dividend_growth':str(growth)})
cases.extend([{**base,'years':'20'}, {**base,'monthly':'0','years':'1','price_growth':'0','dividend_growth':'0'}, {**base,'initial':'0','yield':'12','monthly':'100','years':'1','frequency':'Monthly','price_growth':'0','dividend_growth':'0'},{**base,'yield':'0'},{**base,'tax':'100'}])
fixtures=[]
for v in cases:
 n=lambda key:D(v[key]);freq={'Monthly':12,'Quarterly':4,'Semiannually':2,'Annually':1}[v['frequency']];months=int(v['years'])*12;period=12//freq
 shares=n('initial')/n('price');cashShares=shares;cash=D(0);gross=tax=net=grossCash=taxCash=D(0);price=n('price');annualDps=price*n('yield')/100;step=(1+n('price_growth')/100)**(D(1)/12);checkpoints=[]
 for m in range(1,months+1):
  price=price*step;g=gc=t=tc=D(0)
  if m%period==0:
   dps=annualDps*(1+n('dividend_growth')/100)**((m-1)//12)/freq;g=shares*dps;gc=cashShares*dps;t=g*n('tax')/100;tc=gc*n('tax')/100
   shares+=(g-t)/price;cash+=gc-tc;gross+=g;tax+=t;net+=g-t;grossCash+=gc;taxCash+=tc
  shares+=n('monthly')/price;cashShares+=n('monthly')/price
  if m in {1,3,12,months}:checkpoints.append([str(x) for x in [m,price,n('monthly'),g,t,g-t,shares,shares*price,gc-tc,cashShares,cashShares*price,cash,cashShares*price+cash,shares*price-cashShares*price-cash]])
 external=n('initial')+months*n('monthly');end=shares*price;endC=cashShares*price+cash;forward=annualDps*(1+n('dividend_growth')/100)**int(v['years'])
 outputs=[end,endC,end-endC,external,end-external,endC-external,gross,tax,net,cash,cashShares*price,shares*forward,shares*forward*(1-n('tax')/100),shares,cashShares,price]
 fixtures.append({'values':v,'metrics':[str(z) for z in outputs],'checkpoints':checkpoints})
Path('tests/fixtures/drip-expected.json').write_text(json.dumps(fixtures,indent=2)+'\n');print('Created',len(fixtures),'independent 60-digit Decimal cases with payout and anniversary checkpoints.')
