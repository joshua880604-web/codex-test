"""Offline authoring: Decimal reference arithmetic and static SVG figures, not a build step."""
from decimal import Decimal as D, getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'public/data/calculation-guides'; IMG=ROOT/'public/images/guides'
DATA.mkdir(parents=True,exist_ok=True);IMG.mkdir(parents=True,exist_ok=True)
def pay(p,annual,years):
 p=D(p);i=D(annual)/1200;n=years*12
 return p/n if not i else p*i/(1-(1+i)**(-n))
def house(vacancy):
 pi=pay(320000,6,30);cost=pi+1100;effective=D(1500)*(1-D(vacancy)/100);net=cost-effective;diff=1800-net
 values={'arrangement':'Rooms in a shared home','price':400000,'loan':320000,'rate':6,'years':30,'closing':8000,'repairs':5000,'initial_reserve':5000,'rentals':json.dumps([{'name':'Tenant room A','rent':750},{'name':'Tenant room B','rent':750}],separators=(',',':')),'vacancy':vacancy,'other_income':0,'mortgage_insurance':0,'tax':400,'insurance':150,'hoa':0,'utilities':200,'maintenance':200,'capital':150,'management':0,'other_costs':0,'current_rent':1800}
 return {'label':f'{vacancy}% tenant rent loss','calculatorId':'house-hacking','mode':'living','values':values,'metrics':{'Monthly net housing cash cost':float(net),'Monthly budget difference versus renting':float(diff),'Initial cash required':98000.0,'Effective monthly tenant rent':float(effective),'Scheduled monthly mortgage P&I':float(pi)},'display':[f'${effective:,.2f}',f'${net:,.2f}',f'${diff:,.2f}']}
def cash(label,loan=200000,rate=6,rent=2500,reserve=100):
 p=D(loan);a=pay(loan,rate,30) if loan else D(0);b=p;debt=D(0)
 for _ in range(12):
  interest=b*D(rate)/1200;actual=min(a,b+interest);b=max(D(0),b+interest-actual);debt+=actual
 cash=D(300000)-p+5000+10000+5000;noi=(D(rent)*D('.95')-850)*12;flow=noi-debt-D(reserve)*12;yield_=flow/cash*100
 values={'price':300000,'loan':loan,'closing':5000,'repairs':10000,'initial_reserve':5000,'rate':rate,'years':30,'rent':rent,'vacancy':5,'other_income':0,'operating':850,'reserve':reserve,'other_debt':0}
 return {'label':label,'calculatorId':'cash-on-cash-return','mode':'property','values':values,'metrics':{'Cash-on-cash return':float(yield_),'Annual cash flow used':float(flow),'Cash invested':float(cash),'Annual NOI before reserve and financing':float(noi),'First-year principal and interest paid':float(debt)},'display':[f'${cash:,.2f}',f'${flow:,.2f}',f'{yield_:,.4f}%']}
def landed(label,changes):
 v={'quantity':500,'goods':5000,'freight':800,'insurance':50,'duties':400,'taxes':150,'brokerage':100,'port':75,'inland':200,'other':25};v.update(changes);total=sum(D(v[k]) for k in v if k!='quantity');unit=total/v['quantity'];extra=total-D(v['goods'])
 return {'label':label,'calculatorId':'landed-cost','mode':'shipment','values':v,'metrics':{'Total landed cost':float(total),'Landed cost per unit':float(unit),'Additional shipment costs':float(extra),'Goods cost per unit':float(D(v['goods'])/v['quantity'])},'display':[f'${v["goods"]:,.2f}',f'${extra:,.2f}',f'${total:,.2f}',f'${unit:,.2f}']}
cases={'house':[house(v) for v in [0,5,20,100]],'cash':[cash('Base: 6% loan'),cash('No purchase loan',loan=0),cash('8% loan',rate=8),cash('USD 300 monthly reserve',reserve=300),cash('USD 2,250 monthly rent',rent=2250)],'landed':[landed('Itemized quote',{}),landed('Higher freight',{'freight':1600}),landed('Higher entered duties',{'duties':1200}),landed('Same total, bundled invoice',{'goods':6800,'freight':0,'insurance':0,'duties':0,'taxes':0,'brokerage':0,'port':0,'inland':0,'other':0})]}
p=ROOT/'src/lib/calculation-guide-cases.json';existing=json.loads(p.read_text());existing.update(cases);p.write_text(json.dumps(existing,indent=2)+'\n')
for topic,rows in cases.items():
 keys=list(rows[0]['metrics'])
 with (DATA/(topic+'-cases.csv')).open('w') as f:
  w=csv.writer(f);w.writerow(['Case',*keys,'Inputs (JSON)'])
  for row in rows:w.writerow([row['label'],*[row['metrics'][k] for k in keys],json.dumps(row['values'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-property-business-guides'})
def save(fig,name):
 fig.tight_layout();fig.savefig(IMG/(name+'.svg'),facecolor='white',metadata={'Date':None});plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Monthly net housing cash cost'] for r in cases['house']];ax.bar(range(4),ys,color='#6653cc',label='Net monthly housing cash cost');ax.axhline(1800,color='#16837b',ls='--',label='Alternative renting budget: USD 1,800');ax.set_xticks(range(4),['0%','5%','20%','100%']);ax.set_xlabel('Tenant rent-loss assumption');ax.set_ylabel('Monthly cash cost (USD)');ax.set_title('Two tenant rooms at USD 750 each; same loan and owner costs');ax.set_ylim(0,4100);ax.legend(loc='upper left',fontsize=9)
for i,y in enumerate(ys):ax.text(i,y+55,f'${y:,.2f}',ha='center',fontsize=10)
save(fig,'house-hacking-budget-guide')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Cash-on-cash return'] for r in cases['cash']];ax.bar(range(5),ys,color=['#6653cc' if y>=0 else '#b34d54' for y in ys]);ax.axhline(0,color='#4b5563',lw=.8);ax.set_xticks(range(5),['Base\n6% loan','No purchase\nloan','8%\nloan','USD 300\nreserve','USD 2,250\nrent']);ax.set_ylabel('First-year cash-on-cash return (%)');ax.set_title('Same USD 300,000 rental: one change per case from the base');ax.set_ylim(-1.6,7)
for i,y in enumerate(ys):ax.text(i,y+(.12 if y>=0 else -.16),f'{y:.2f}%',ha='center',va='bottom' if y>=0 else 'top')
save(fig,'cash-on-cash-method-guide')
fig,ax=plt.subplots(figsize=(9,5));goods=[r['values']['goods'] for r in cases['landed']];extra=[r['metrics']['Additional shipment costs'] for r in cases['landed']];ax.bar(range(4),goods,color='#16837b',label='Invoice amount (may bundle charges)');ax.bar(range(4),extra,bottom=goods,color='#6653cc',label='Additional separately entered charges');ax.set_xticks(range(4),['Itemized','Higher freight','Higher entered\nduties','Same total,\nbundled']);ax.set_ylabel('Shipment cost (USD)');ax.set_title('500 identical units: reconcile included versus additional charges');ax.set_ylim(0,10300);ax.legend(loc='upper left',fontsize=9)
for i,r in enumerate(cases['landed']):ax.text(i,r['metrics']['Total landed cost']+110,r['display'][2],ha='center',fontsize=10)
save(fig,'landed-cost-method-guide')
print(json.dumps({k:[{'label':r['label'],'metrics':r['metrics']} for r in rows] for k,rows in cases.items()},indent=2))
