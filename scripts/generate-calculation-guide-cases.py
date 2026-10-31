"""Offline authoring only: independent Decimal examples and static charts; no build dependency."""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json,csv
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'public/data/calculation-guides'; IMG=ROOT/'public/images/guides'
DATA.mkdir(parents=True,exist_ok=True); IMG.mkdir(parents=True,exist_ok=True)
def number(x):return float(x)
def mortgage(years,rate):
 p=D(300000);i=D(rate)/1200;n=years*12;a=p/n if not i else p*i/(1-(1+i)**(-n));cost=D(650)
 return {'label':f'{years} years, {rate}%','calculatorId':'mortgage','mode':'monthly','values':{'price':375000,'down':20,'down_unit':'Percent','years':years,'months':0,'rate':rate,'tax':4800,'tax_unit':'Dollars','insurance':1800,'insurance_unit':'Dollars','hoa':1200,'hoa_unit':'Dollars','other':0,'pmi_method':'Manual','pmi':0,'pmi_years':0,'pmi_policy':'Fixed duration','extra_monthly':0,'extra_yearly':0,'extra_once':0,'dated':''},'metrics':{'Monthly principal & interest':number(a),'Initial monthly total':number(a+cost),'Total interest':number(a*n-p)},'display':[f'${a:,.2f}',f'${a+cost:,.2f}',f'${a*n-p:,.2f}']}
def compound(rate,timing):
 p=D(10000);c=D(200);i=D(rate)/1200;n=120;g=(1+i)**n;b=p*g+(c*n if not i else c*(g-1)/i*(1+i if timing=='Beginning of period' else 1));paid=p+c*n
 return {'label':f'{rate}%, '+('month start' if timing=='Beginning of period' else 'month end'),'calculatorId':'compound-interest','mode':'growth','values':{'principal':10000,'years':10,'months':0,'rate':rate,'compound':'Monthly','monthly':200,'annual':0,'tax':0,'inflation':0,'timing':timing},'metrics':{'Ending balance':number(b),'Total contributions':number(paid),'Net investment earnings':number(b-paid)},'display':[f'${paid:,.2f}',f'${b-paid:,.2f}',f'${b:,.2f}']}
def roi(returned,years):
 p=D(10000);g=D(returned)/p;a=(g**(D(1)/D(years))-1)*100;t=(g-1)*100
 return {'label':f'{years} year'+('s' if years!=1 else '')+f', ${returned:,} returned','calculatorId':'roi','mode':'length','values':{'cost':10000,'returned':returned,'years':years},'metrics':{'Return on investment':number(t),'Annualized return':number(a)},'display':[f'{t:,.2f}%',f'{a:,.4f}%']}
def coast(spending,household='Individual'):
 v={'age':35,'retire':65,'balance':150000,'spending':spending,'return':7,'inflation':2.5,'withdrawal':4,'monthly':0,'household':household,'partner_balance':0,'partner_monthly':0};target=D(spending)/D('.04');threshold=target/(D('1.07')/D('1.025'))**30
 if household=='Couple':v.update(balance=200000,partner_balance=100000)
 return {'label':f'${spending:,} portfolio-funded budget','calculatorId':'coast-fire','mode':'coast','values':v,'metrics':{'Coast FIRE number today':number(threshold)},'display':[f'${target:,.2f}',f'${threshold:,.2f}']}
cases={'mortgage':[mortgage(30,6),mortgage(15,6),mortgage(30,0)],'compound':[compound(r,t) for r,t in [(0,'End of period'),(5,'End of period'),(5,'Beginning of period'),(8,'End of period')]],'annualized':[roi(15000,t) for t in [1,3,5]]+[roi(8000,2)],'coast':[coast(40000),coast(60000,'Couple'),coast(36000)]}
(ROOT/'src/lib/calculation-guide-cases.json').write_text(json.dumps(cases,indent=2)+'\n')
for topic,rows in cases.items():
 keys=list(rows[0]['metrics'])
 with (DATA/(topic+'-cases.csv')).open('w') as f:
  w=csv.writer(f);w.writerow(['Case',*keys,'Inputs (JSON)'])
  for row in rows:w.writerow([row['label'],*[row['metrics'][k] for k in keys],json.dumps(row['values'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-calculation-guides'})
def save(fig,name):
 fig.tight_layout();fig.savefig(IMG/(name+'.svg'),facecolor='white',metadata={'Date':None});plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5));rows=cases['mortgage'];base=[r['metrics']['Monthly principal & interest'] for r in rows];ax.bar(range(3),base,label='Monthly principal and interest',color='#6653cc');ax.bar(range(3),[650]*3,bottom=base,label='Entered tax, insurance and HOA',color='#16837b');ax.set_xticks(range(3),[r['label'] for r in rows]);ax.set_ylabel('Initial monthly outlay (USD)');ax.set_title('Same USD 300,000 loan and USD 650 monthly ownership costs');ax.legend(fontsize=10);ax.set_ylim(0,4000)
for i,r in enumerate(rows):ax.text(i,r['metrics']['Initial monthly total']+65,r['display'][1],ha='center')
save(fig,'monthly-mortgage-guide')
fig,ax=plt.subplots(figsize=(9,5));rows=cases['compound'];paid=[r['metrics']['Total contributions'] for r in rows];earn=[r['metrics']['Net investment earnings'] for r in rows];ax.bar(range(4),paid,label='Starting money + new deposits',color='#16837b');ax.bar(range(4),earn,bottom=paid,label='Modeled earnings',color='#6653cc');ax.set_xticks(range(4),[r['label'].replace(', ','\n') for r in rows]);ax.set_ylabel('Balance after 10 years (USD)');ax.set_title('USD 10,000 start + USD 200 monthly; nominal rates / monthly compounding');ax.legend(fontsize=9);ax.set_ylim(0,60000)
for i,r in enumerate(rows):ax.text(i,r['metrics']['Ending balance']+700,r['display'][2],ha='center',fontsize=10)
save(fig,'monthly-contributions-guide')
fig,ax=plt.subplots(figsize=(9,5));rows=cases['annualized'][:3];ax.bar([i-.18 for i in range(3)],[50]*3,width=.36,label='Cumulative return: 50% in every case',color='#16837b');ax.bar([i+.18 for i in range(3)],[r['metrics']['Annualized return'] for r in rows],width=.36,label='Compound annualized return',color='#6653cc');ax.set_xticks(range(3),['1 year','3 years','5 years']);ax.set_ylabel('Return (%)');ax.set_title('Same USD 10,000 cost and USD 15,000 terminal value; no interim cash flows');ax.legend(fontsize=9);ax.set_ylim(0,65)
save(fig,'annualized-total-guide')
print(json.dumps({k:[{'label':r['label'],'metrics':r['metrics']} for r in rows] for k,rows in cases.items()},indent=2))
