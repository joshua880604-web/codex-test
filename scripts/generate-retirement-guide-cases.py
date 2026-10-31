"""Offline guide references: independent Decimal arithmetic; no runtime dependency."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return f'${x:,.2f}'
def row(label,id,mode,values,metrics,display):return dict(label=label,calculatorId=id,mode=mode,values=values,metrics={k:float(v) for k,v in metrics.items()},display=display)
def longevity(rate,w=3000):
 b=D(500000);i=(1+D(rate)/100)**(D(1)/12)-1;v={'balance':500000,'withdrawal':w,'return':rate}
 if D(w)<=b*i:return row(f'{rate}% return, {usd(w)}/month','retirement','longevity',v,{'Initial monthly interest':b*i},['Not exhausted in model','Not applicable',usd(b*i)+' initial monthly growth'])
 total=D(0);count=0
 while b>D('1e-40'):
  funds=b*(1+i);paid=min(D(w),funds);b=funds-paid;total+=paid;count+=1
  assert count<=12000
 return row(f'{rate}% return, {usd(w)}/month','retirement','longevity',v,{'Years savings last':D(count)/12,'Monthly withdrawals':count,'Total withdrawn':total,'Final monthly withdrawal':paid},[f'{count} months ({D(count)/12:.2f} years)',usd(paid),usd(total)+' total withdrawn'])
def hsa_tax(months):
 limit=D(4400)*months/12;employer=D(500);personal=D(3000);room=limit-employer;eligible=min(personal,room);tax=eligible*D('.22')
 v={'year':'2026','coverage':'Self-only','catchup':'No','months':months,'employee':3000,'employer':500,'federal':22,'state':0,'method':'Direct contribution','payroll_rate':0}
 return row(f'{months} eligible months: contribution','hsa','contribution',v,{'Modeled annual contribution limit':limit,'Maximum personal contribution after employer':room,'Estimated tax savings on personal contribution':tax,'Planned contributions above modeled limit':max(D(0),personal+employer-limit)},['Contribution room',usd(room),usd(tax)+' modeled personal tax saving'])
def hsa_growth(label,stop=20,spend=1000,fee=0):
 b=D(5000);gainTotal=D(0);paidTotal=D(0);fees=D(0);short=D(0)
 for y in range(1,21):
  gain=b*D('.05');funds=b+gain+(3500 if y<=stop else 0);f=min(D(fee),funds);paid=min(D(spend),funds-f);b=funds-f-paid;gainTotal+=gain;paidTotal+=paid;fees+=f;short+=D(spend)-paid
 v={'year':'2026','coverage':'Self-only','catchup':'No','balance':5000,'employee':3000,'employer':500,'years':20,'contribution_years':stop,'return':5,'spending':spend,'fee':fee,'inflation':2.5}
 return row(label,'hsa','growth',v,{'Projected HSA balance':b,'Ending balance in today’s dollars':b/D('1.025')**20,'Total new contributions':D(3500)*stop,'Investment earnings before fees':gainTotal,'Total medical withdrawals':paidTotal,'Total fees paid':fees,'Medical expenses not funded by HSA':short},['20-year growth',usd(b),usd(b/D('1.025')**20)+' in today’s dollars'])
def rmd(age,factor,taken=0):
 amount=D(500000)/D(factor);left=max(D(0),amount-taken);v={'birth':2026-age,'year':2026,'balance':500000,'taken':taken,'spouse':'No','spouse_birth':1964,'return':0,'projection':1}
 return row(f'Age {age}, {usd(taken)} credited','rmd','annual',v,{'Age in distribution year':age,'Distribution period':D(factor),'Annual RMD':amount,'Remaining RMD for selected year':left,'Monthly budgeting equivalent of annual RMD':amount/12},[factor,usd(amount),usd(left)])
def match(label,m1,l1,m2,l2,salary=80000,age=35):
 eligible=min(D(salary),D(360000));limit=D(24500)+(D(11250) if 60<=age<=63 else D(8000) if age>=50 else 0);minimum=(D(l1)+D(l2) if m2>0 and l2>0 else D(l1) if m1>0 else D(0))/100*eligible/D(salary);required=min(D(salary)*minimum,limit);first=min(required,eligible*D(l1)/100);second=min(max(D(0),required-first),eligible*D(l2)/100);employer=min(first*D(m1)/100+second*D(m2)/100,max(D(0),min(D(salary),D(72000))-min(required,D(24500))));possible=minimum<=min(D(1),limit/salary)
 v={'age':age,'salary':salary,'match1':m1,'limit1':l1,'match2':m2,'limit2':l2}
 metrics={'Minimum contribution rate for full match' if possible else 'Rate required for full match (unattainable)':minimum*100,'Maximum steady contribution rate':min(D(1),limit/salary)*100,'Annual contribution to maximize match' if possible else 'Annual contribution at employee limit':required,'Employer annual match':employer,'Total annual additions':required+employer}
 return row(label,'401k','match',v,metrics,[usd(required),usd(employer),'Full match attainable' if possible else 'Employee limit prevents full match'])
cases={'longevity':[longevity(-2),longevity(0),longevity(5),longevity(5,4000),longevity(5,1500)],'hsa':[hsa_tax(12),hsa_tax(6),hsa_growth('Base: 20 contribution years'),hsa_growth('Contributions stop after 10 years',stop=10),hsa_growth('USD 100 annual fees',fee=100),hsa_growth('USD 5,000 annual medical budget',spend=5000)],'rmd':[rmd(73,'26.5'),rmd(75,'24.6'),rmd(80,'20.2'),rmd(75,'24.6',10000)],'matching':[match('100% of first 3% + 50% of next 2%',100,3,50,2),match('50% of first 6%',50,6,0,0),match('100% of first 6%',100,6,0,0),match('High salary: 100% of first 10%',100,10,0,0,salary=400000)]}
p=R/'src/lib/calculation-guide-cases.json';all_=json.loads(p.read_text());all_.update(cases);p.write_text(json.dumps(all_,indent=2)+'\n')
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w') as f:
  w=csv.writer(f);w.writerow(['Case','Model','Inputs (JSON)','Unrounded reference metrics (JSON)'])
  for r in rows:w.writerow([r['label'],r['mode'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-retirement-guides'})
def chart(topic,title,labels,values,ylabel,notes):
 fig,ax=plt.subplots(figsize=(9,5));ax.bar(range(len(values)),values,color='#6653cc');ax.set_xticks(range(len(values)),labels);ax.set_ylabel(ylabel);ax.set_title(title,pad=16);ax.set_ylim(0,max(values)*1.23)
 for i,y in enumerate(values):ax.text(i,y+max(values)*.025,f'{y:,.2f}',ha='center',fontsize=10)
 fig.text(.5,.015,notes,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.05,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
chart('longevity','USD 500,000: same fixed USD 3,000 monthly withdrawal',['−2% return','0% return','5% return'],[r['metrics']['Years savings last'] for r in cases['longevity'][:3]],'Years to final month-end withdrawal','Constant effective annual returns; no inflation, taxes or fees; hypothetical, not a success probability.')
chart('hsa','20-year HSA balance: change one assumption',['Base','Stop after\n10 years','USD 100\nannual fees','USD 5,000\nmedical budget'],[r['metrics']['Projected HSA balance'] for r in cases['hsa'][2:]],'Ending nominal balance (USD)','USD 5,000 starting balance; 5% return; USD 3,500 year-end contributions; base spending USD 1,000/year.')
chart('rmd','Same USD 500,000 prior year-end balance; different owner ages',['Age 73','Age 75','Age 80'],[r['metrics']['Annual RMD'] for r in cases['rmd'][:3]],'Gross annual RMD (USD)','IRS Table III factors 26.5, 24.6, 20.2; separate owners in 2026, not one person’s projected balances.')
chart('matching','Same USD 80,000 salary; different matching formulas',['100% first 3%\n+ 50% next 2%','50% first 6%','100% first 6%'],[r['metrics']['Employer annual match'] for r in cases['matching'][:3]],'Annual employer match (USD)','Full-year equal pay and constant contributions sufficient for full match; hypothetical plan formulas.')
print(json.dumps({k:len(v) for k,v in cases.items()}))
