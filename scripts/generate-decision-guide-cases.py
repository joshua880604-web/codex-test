"""Reproduce hypothetical guide cases with independent 60-digit Decimal arithmetic.
Run manually: python scripts/generate-decision-guide-cases.py (matplotlib needed only here).
Not a build dependency, historical backtest, tax engine or market forecast.
"""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault("MPLCONFIGDIR","/tmp/calculatorfree-matplotlib")
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'public/data/decision-guides';IMG=ROOT/'public/images/guides'
DATA.mkdir(parents=True,exist_ok=True);IMG.mkdir(parents=True,exist_ok=True)
def rate(x):return D(str(x))/100
def pay(p,r,n):return p/n if r==0 else p*r/(1-(1+r)**(-n))
def out(values):return {k:float(v) if isinstance(v,D) else v for k,v in values.items()}
def mortgage(annual):
 p=D(100000);i=D('.06')/12;n=120;scheduled=pay(p,i,n);budget=scheduled+200;g=(1+rate(annual))**(D(1)/12)
 states=[dict(loan=p-10000,assets=D(0)),dict(loan=p,assets=D(10000))]
 for m in range(n):
  for j,s in enumerate(states):
   s['assets']*=g;owed=s['loan']*(1+i);paid=min(owed,budget if j==0 else scheduled);s['loan']=max(D(0),owed-paid);s['assets']+=budget-paid
 pos=[s['assets']-s['loan'] for s in states]
 return {'label':str(round(D(str(annual)),4))+'% effective return','values':{'principal':100000,'rate':6,'term':10,'lump':10000,'extra':200,'horizon':10,'return':float(annual)},'metrics':out({'Scheduled monthly principal and interest':scheduled,'Same total monthly cash budget':budget,'Paydown-first investments minus mortgage':pos[0],'Invest-first investments minus mortgage':pos[1],'Invest-first advantage at horizon':pos[1]-pos[0]})}
def drip(growth,tax=0):
 price=D(100);step=(1+rate(growth))**(D(1)/12);sd=sc=D(100);cash=D(0);gross=taxpaid=D(0)
 for m in range(1,121):
  price*=step
  if m%3==0:
   gd=sd;gc=sc;net=gd*(1-rate(tax));sd+=net/price;cash+=gc*(1-rate(tax));gross+=gd;taxpaid+=gd*rate(tax)
 a=sd*price;b=sc*price+cash
 return {'label':f'{growth}% price growth / {tax}% dividend tax','values':{'initial':10000,'price':100,'yield':4,'monthly':0,'years':10,'frequency':'Quarterly','price_growth':growth,'dividend_growth':0,'tax':tax},'metrics':out({'Ending portfolio with DRIP':a,'Ending wealth without reinvestment (shares + cash)':b,'DRIP minus cash-dividend wealth':a-b,'Gross dividends with DRIP':gross,'Dividend tax paid with DRIP':taxpaid})}
def roth(cash0,basis0=0):
 cash=D(cash0);basis=D(basis0);pre=D(500000);roth=basis;rungs=[];rows=[];livinggap=taxgap=cashspent=basisspent=rungspent=D(0)
 for y in range(2027,2035):
  pre-=40000;roth+=40000;rungs.append([y,D(40000)]);due=D(8000);tax=min(cash,due);cash-=tax;taxgap+=due-tax;need=D(40000)
  regular=min(need,basis,roth);need-=regular;basis-=regular;roth-=regular;basisspent+=regular;seasoned=D(0)
  for rung in rungs:
   if y>=rung[0]+5:
    taken=min(need,rung[1],roth);need-=taken;rung[1]-=taken;roth-=taken;seasoned+=taken
  bridge=min(cash,need);cash-=bridge;need-=bridge;cashspent+=bridge;livinggap+=need;rungspent+=seasoned
  rows.append(out({'year':y,'cash_living':bridge,'cash_tax':tax,'roth_basis':regular,'seasoned':seasoned,'unfunded_living':need,'unfunded_tax':due-tax}))
 return {'label':f'${cash0:,} cash / ${basis0:,} regular basis','values':{'start_year':2027,'age':40,'years':8,'pretax':500000,'bridge':cash0,'roth_basis':basis0,'conversion':40000,'conversion_growth':0,'tax':20,'spending':40000,'spending_growth':0,'pretax_return':0,'roth_return':0},'metrics':out({'Bridge cash required for this modeled path':cashspent+D(64000)+livinggap,'Additional bridge cash needed':taxgap+livinggap,'Estimated conversion tax':D(64000),'Ending bridge cash':cash,'Living costs funded by original Roth contributions':basisspent,'Living costs funded by seasoned conversions':rungspent,'First conversion five-tax-year date':2032}),'rows':rows}
def cap(loan,annual,reserve=0):
 p=D(loan);r=rate(annual)/12;payment=pay(p,r,360) if loan else D(0);balance=p;service=D(0)
 for m in range(12):
  interest=balance*r;actual=min(payment,balance+interest);balance=max(D(0),balance+interest-actual);service+=actual
 cash=D(300000)-p+5000;flow=D(18000)-service-D(reserve)*12
 return {'label':f'{round(loan/300000*100)}% LTV, {annual}% loan'+(' + reserve' if reserve else ''),'values':{'price':300000,'loan':loan,'closing':5000,'repairs':0,'initial_reserve':0,'rate':annual,'years':30,'rent':2500,'vacancy':0,'other_income':0,'operating':1000,'reserve':reserve,'other_debt':0},'metrics':out({'Cash invested':cash,'Annual cash flow used':flow,'First-year principal and interest paid':service,'Cash-on-cash return':flow/cash*100,'Cap rate at purchase price':D(6)})}
reference=(1+D('.06')/12)**12-1
cases={'mortgage':[mortgage(r) for r in [0,3,6,reference*100,9]],'drip':[drip(r) for r in [-10,0,3,6]]+[drip(3,20)],'roth':[roth(200000),roth(240000),roth(280000),roth(240000,40000)],'cap':[cap(0,5),cap(150000,5),cap(240000,5),cap(240000,8),cap(240000,8,100)]}
(ROOT/'src/lib/decision-guide-cases.json').write_text(json.dumps(cases,indent=2)+'\n')
for topic,rows in cases.items():
 keys=list(rows[0]['metrics'])
 with (DATA/(topic+'-cases.csv')).open('w') as f:
  w=csv.writer(f);w.writerow(['Case',*keys,'Input assumptions (JSON)'])
  for row in rows:w.writerow([row['label'],*[row['metrics'][k] for k in keys],json.dumps(row['values'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-decision-guides'})
def save(fig,name):
 fig.tight_layout();fig.savefig(IMG/(name+'.png'),dpi=150,facecolor='white');fig.savefig(IMG/(name+'.svg'),facecolor='white',metadata={'Date':None});plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5));rows=cases['mortgage'];ys=[r['metrics']['Invest-first advantage at horizon'] for r in rows];bars=ax.bar(range(5),ys,color=['#d05656' if x<0 else '#6653cc' for x in ys]);ax.axhline(0,color='#4b5563',lw=.8);ax.set_xticks(range(5),['0%','3%','6%','6.1678%\n(equal growth)','9%']);ax.set_xlabel('Effective annual investment return assumption');ax.set_ylabel('Invest-first advantage after 10 years (USD)');ax.set_title('Same initial cash and monthly budget; constant returns')
for bar,y in zip(bars,ys):ax.annotate(f'${y:,.0f}',(bar.get_x()+bar.get_width()/2,y),ha='center',va='bottom' if y>=0 else 'top',xytext=(0,4 if y>=0 else -4),textcoords='offset points')
ax.margins(y=.2);save(fig,'mortgage-vs-invest')
fig,ax=plt.subplots(figsize=(9,5));x=list(range(4));ax.bar([i-.18 for i in x],[r['metrics']['Ending portfolio with DRIP'] for r in cases['drip'][:4]],width=.36,label='Reinvest dividends',color='#6653cc');ax.bar([i+.18 for i in x],[r['metrics']['Ending wealth without reinvestment (shares + cash)'] for r in cases['drip'][:4]],width=.36,label='Retain dividend cash, zero cash interest',color='#1b8c82');ax.set_xticks(x,['−10%','0%','3%','6%']);ax.set_xlabel('Annual price appreciation assumption (excludes dividends)');ax.set_ylabel('Ending shares + retained cash after 10 years (USD)');ax.set_title('$10,000 start, 4% initial dividend yield; no deposits or tax');ax.legend(fontsize=9);save(fig,'drip-vs-cash')
fig,ax=plt.subplots(figsize=(9,5));rows=cases['roth'][2]['rows'];x=[r['year'] for r in rows];bottom=[0]*8
for key,label,color in [('cash_living','Outside cash: living costs','#6653cc'),('cash_tax','Outside cash: conversion tax','#1b8c82'),('seasoned','Seasoned conversion principal','#e6a23c')]:
 y=[r[key] for r in rows];ax.bar(x,y,bottom=bottom,label=label,color=color);bottom=[a+b for a,b in zip(bottom,y)]
ax.set_ylabel('Annual living budget + conversion tax (USD)');ax.set_title('$280,000 cash bridge: conversion principal first used in 2032');ax.set_xticks(x);ax.legend(fontsize=9,loc='upper center',bbox_to_anchor=(.5,-.12),ncol=2);save(fig,'roth-ladder-bridge')
fig,ax=plt.subplots(figsize=(9,5));rows=cases['cap'];ax.bar(range(5),[r['metrics']['Cash-on-cash return'] for r in rows],color='#6653cc',label='Cash-on-cash, after stated reserve');ax.axhline(6,color='#1b8c82',ls='--',label='Cap rate: 6% in every case');ax.axhline(0,color='#4b5563',lw=.8);ax.set_xticks(range(5),['Cash\npurchase','50% LTV\n5% loan','80% LTV\n5% loan','80% LTV\n8% loan','80% LTV, 8%\n$1,200 reserve']);ax.set_ylabel('Annual rate (%)');ax.set_title('Same USD 300,000 property and USD 18,000 NOI; financing changes');ax.legend(fontsize=9);save(fig,'cap-vs-cash')
print('Generated19independent cases,4CSVs,4PNG+4SVG charts.')
