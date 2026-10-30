"""Independent Decimal reference cases; no application code is imported."""
from decimal import Decimal as D, getcontext
import json,pathlib
getcontext().prec=60
root=pathlib.Path(__file__).resolve().parents[1]
card=[]
for b in ['0','10','5000']:
 for apr in ['0','5.9','24']:
  for add_interest in [False,True]:
   for extra in ['0','50']:
    v={'principal':b,'rate':apr,'minimum':'2','floor':'25','interest_extra':'Yes' if add_interest else 'No','extra':extra}
    balance=D(b);total_interest=D(0);rows=[];failed=False
    for month in range(1,12001):
     if balance<=D('0.0000001'):break
     charge=balance*D(apr)/D(1200)
     due=min(balance+charge,max(D(25),balance*D('.02')+(charge if add_interest else D(0))))
     paid=min(balance+charge,due+D(extra))
     if paid<=charge:failed=True;break
     if not rows:first_minimum=due
     principal=paid-charge;balance-=principal;total_interest+=charge
     rows.append([month,float(paid),float(charge),float(principal),float(balance)])
    if balance>D('.000001') or len(rows)>1200:failed=True
    card.append({'values':v,'error':failed,**({} if failed else {'rows':rows,'firstMinimum':float(first_minimum) if rows else 0,'firstPayment':rows[0][1] if rows else 0,'months':len(rows),'interest':float(total_interest),'total':float(D(b)+total_interest)})})
cap=[]
for noi in ['-18000','0','1','18000','22500','31800','1000000']:
 for price in ['300000','1234567.89']:
  for target in ['.01','6','100']:
   n,p,t=D(noi),D(price),D(target);cap.append({'values':{'noi':noi,'value':price,'target':target},'rate':float(n/p*100),'needed':float(p*t/100),'surplus':float(n-p*t/100),'implied':float(n/(t/100)) if n>0 else None})
path=root/'tests/fixtures/priority-two-expected.json';path.write_text(json.dumps({'precision':60,'card':card,'cap':cap},indent=2)+'\n')
print(f'{len(card)} card cases and {len(cap)} cap-rate cases; 60-digit Decimal, including non-amortizing rules.')
