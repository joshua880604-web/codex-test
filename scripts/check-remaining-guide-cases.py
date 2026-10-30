"""Independent 60-digit Decimal checks; no imports from application engines."""
import json
from decimal import Decimal as D,getcontext
from pathlib import Path
getcontext().prec=60
entries=json.loads(Path('src/lib/remaining-guide-data.json').read_text());fixture={}
def payment(p,r,n):return p/n if not r else p*r/(1-(1+r)**(-n))
def loan(p,r,a,limit=12000):
 b=p;interest=D(0);rows=[]
 for m in range(1,limit+1):
  if b<D('0.000000001'):break
  i=b*r;paid=min(a,b+i);b=b+i-paid;interest+=i;rows.append((paid,i,b))
 else:raise AssertionError('unpaid')
 return interest,rows
for e in entries:
 results=[]
 for row in e['rows']:
  v=row['values'];x=D(str(row['x']));id=e['id'];n=lambda k:D(v[k])
  if id=='recast':
   r=n('rate')/1200;periods=n('years')*12;p=n('principal');reduced=p-n('lump');a=payment(p,r,periods)
   expected=[payment(reduced,r,periods)*periods-reduced,loan(reduced,r,a)[0]]
  elif id=='cd':expected=[n('principal')*(1+n('rate')/100)]
  elif id in ['car','debt-save']:expected=[loan(n('principal'),n('rate')/1200,n('payment')+n('extra_monthly'))[0]]
  elif id=='emergency':expected=[n('expenses')*n('months'),max(D(0),n('expenses')*n('months')-n('savings'))]
  elif id=='rent':
   principal=n('price')*(1-n('down')/100);r=n('rate')/1200;a=payment(principal,r,n('years')*12);_,rows=loan(principal,r,a)
   bal=rows[59][2];paid=sum((r[0] for r in rows[:60]),D(0));initial=n('price')*(n('down')+n('buy_closing'))/100
   buyer=n('price')*(1+n('appreciation')/100)**5*(1-n('selling')/100)-bal
   renter=initial+paid+5*(n('tax')+n('insurance')+n('hoa')+n('maintenance'))-60*n('rent')-5*n('renter_insurance')
   expected=[buyer,renter]
  elif id=='apr':expected=[payment(n('principal'),n('rate')/1200,n('years')*12)*n('years')*12-n('principal')+n('upfront')]
  elif id=='refinance':expected=[payment(n('principal'),n('new_rate')/1200,n('new_years')*12)*n('new_years')*12-n('principal')+n('fees')]
  elif id=='ira':
   growth=(1+n('return')/100)**(n('retire')-n('age'));b=n('balance')*growth+n('contribution')*(growth-1)/(n('return')/100)
   expected=[b*(1-n('retire_tax')/100),b*(1-n('tax')/100)]
  elif id=='margin':expected=[n('cost')*(1+n('markup')/100),n('cost')*n('markup')/100]
  elif id=='coast':expected=[n('spending')/(n('withdrawal')/100)/((1+n('return')/100)/(1+n('inflation')/100))**(n('retire')-n('age'))]
  elif id in ['snowball','avalanche']:
   b=list(map(D,['5000','3000']));rates=[D(22)/1200,D(18)/1200];minimum=list(map(D,['150','100']));total=D(0);month=0
   while any(z>D('0.000000001') for z in b):
    month+=1;available=n('budget')+(n('once') if month==n('once_month') else 0)
    for i in range(2):
     interest=b[i]*rates[i];total+=interest;b[i]+=interest
    for i in range(2):
     p=min(minimum[i],b[i]);b[i]-=p;available-=p
    order=sorted(range(2),key=lambda i:(b[i],-rates[i]) if id=='snowball' else (-rates[i],))
    for i in order:
     p=min(b[i],max(D(0),available));b[i]-=p;available-=p
    assert month<1000
   expected=[total]
  elif id=='barista':expected=[n('full_spending')/(n('withdrawal')/100)+n('spending')*(n('retire_age')-n('start_age'))-min(n('income'),n('spending'))*(n('income_end')-n('start_age'))]
  else:raise AssertionError(id)
  for actual,answer in zip(row['outputs'],expected,strict=True):assert abs(D(str(actual))-answer)<D('0.000001'),(id,row['x'],actual,str(answer))
  results.append([str(z) for z in expected])
 fixture[e['id']]=results
Path('tests/fixtures/remaining-guide-expected.json').write_text(json.dumps(fixture,indent=2)+'\n')
print('Verified all 70 cases in 14 guides against independent 60-digit Decimal arithmetic within 0.000001 USD.')
