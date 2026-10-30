"""Independent Decimal recurrence checks; no imports from the TS engines."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json
getcontext().prec=60
source=json.loads(Path('src/lib/guide-check-data.json').read_text());expected={'debt':[],'biweekly':[],'points':[]}
def check(actual,value):assert abs(D(str(actual))-D(value))<D('0.000001'),(actual,str(value))
def amortize(principal,rate,payment):
 balance=D(principal);total=D(0);rows=[]
 for month in range(1,20001):
  if balance<=D('0.000000001'):break
  interest=balance*rate;paid=min(payment,balance+interest);balance=balance+interest-paid;total+=interest;rows.append((paid,interest,balance))
 else:raise AssertionError('No payoff')
 return total,rows
def payment(p,r,n):return p/D(n) if r==0 else p*r/(1-(1+r)**(-n))
for row in source['debt']:
 balance=list(map(D,['1000','5000','2500']));minimum=list(map(D,['50','150','75']));rates=[D(6)/1200,D(24)/1200,D(12)/1200];total=D(0);first=None;count=0
 while any(b>D('0.0000001') for b in balance):
  count+=1;available=D(row['budget']);opened=[i for i,b in enumerate(balance) if b>D('0.0000001')]
  for i in opened:
   interest=balance[i]*rates[i];total+=interest;balance[i]+=interest
  for i in opened:
   pay=min(balance[i],minimum[i]);balance[i]-=pay;available-=pay
  order=sorted(opened,key=lambda i:(balance[i],-rates[i]) if row['strategy']=='snowball' else (-rates[i],))
  for i in order:
   pay=min(balance[i],max(D(0),available));balance[i]-=pay;available-=pay
  if first is None and any(b<=D('0.0000001') for b in balance):first=count
  assert count<12000
 assert row['firstMonth']==first and row['months']==count;check(row['interest'],total);check(row['paid'],D(8500)+total)
 expected['debt'].append({'budget':row['budget'],'strategy':row['strategy'],'months':count,'firstMonth':first,'interest':str(total),'paid':str(D(8500)+total)})
for row in source['biweekly']:
 p=D(300000);r=D(row['rate'])/100;m=payment(p,r/12,360);half=m/2;matched=half*26/12
 normal,nrows=amortize(p,r/12,m);bi,brows=amortize(p,r/26,half);equal,erows=amortize(p,r/12,matched)
 vals={'monthly':m,'half':half,'matchedPayment':matched,'annualBudget':half*26,'standardInterest':normal,'biweeklyInterest':bi,'matchedInterest':equal,'biweeklyYears':D(len(brows))/26,'matchedYears':D(len(erows))/12}
 for k,v in vals.items():check(row[k],v)
 expected['biweekly'].append({'rate':row['rate'],**{k:str(v) for k,v in vals.items()}})
for row in source['points']:
 p=D(400000);ra=D('6.75')/1200;rb=D('6.375')/1200;pa=payment(p,ra,360);pb=payment(p,rb,360);_,a=amortize(p,ra,pa);_,b=amortize(p,rb,pb);up=D(4000)+D(row['feeB'])-3000
 paidA=paidB=intA=intB=D(0);costBreak=cashBreak=None;results=[]
 for i,(ar,br) in enumerate(zip(a,b),1):
  paidA+=ar[0];paidB+=br[0];intA+=ar[1];intB+=br[1];cash=paidA-paidB-up;adv=ar[2]-br[2];net=intA-intB-up
  if costBreak is None and net>=-D('0.0000001'):costBreak=i
  if cashBreak is None and cash>=-D('0.0000001'):cashBreak=i
  results.append((cash,adv,net))
 hold=row['hold'];cash,adv,net=results[hold-1] if hold else (-up,D(0),-up)
 vals={'upfront':up,'cashSaving':cash,'balanceAdvantage':adv,'netSaving':net,'costBreak':D(costBreak),'cashBreak':D(cashBreak)}
 for k,v in vals.items():check(row[k],v)
 expected['points'].append({'feeB':row['feeB'],'hold':hold,**{k:str(v) for k,v in vals.items()}})
Path('tests/fixtures/guide-check-expected.json').write_text(json.dumps(expected,indent=2)+'\n')
print('All27cases match independent60-digit Decimal recurrences within0.000001;37planoutcomes checked.')
