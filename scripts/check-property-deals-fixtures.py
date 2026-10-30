from decimal import Decimal as D,getcontext
import json,pathlib,itertools
getcontext().prec=70;out=[]
def seller(v,io):
 p=D(v['price'])-D(v['down']);i=D(v['rate'])/1200;due=int(v['due']);n=int(v.get('years','1'))*12;a=p*i if io else p/n if not i else p*i/(1-(1+i)**(-n));rows=[]
 def bal(k):return p if io else p-a*k if not i else p*(1+i)**k-a*((1+i)**k-1)/i
 totalinterest=D(0);scheduled=D(0);balloon=D(0);final=D(0)
 if p:
  for k in range(1,due+1):
   old=max(D(0),bal(k-1));interest=old*i;pay=min(a,old+interest);new=max(D(0),bal(k));extra=new if k==due else D(0);rows.append([k,float(pay+extra),float(interest),float(pay-interest+extra),0 if k==due else float(new),float(extra)]);totalinterest+=interest;scheduled+=pay
   if k==due:balloon=extra;final=pay+extra
 return dict(metrics={'Regular monthly payment':float(a),'Balloon principal after final installment':float(balloon),'Total due in final month':float(final),'Total interest through maturity':float(totalinterest),'Total loan payments including balloon':float(scheduled+balloon)},rows=rows)
for io in [False,True]:
 for rate,price,down,years,due in [(0,15000,3000,1,6),(6,300000,60000,30,60),(6,120000,20000,1,12),(100,1000000,0,50,600),(.001,1000,100,5,18),(7,300000,300000,10,12),(4.5,400000,50000,30,360),(0,12,0,1,12),(.1,1,0,1,1),(9,550000,100000,15,100)]:
  v={k:str(x) for k,x in dict(price=price,down=down,rate=rate,years=years,due=due).items()};out.append(dict(id='seller-financing',mode='interest-only' if io else 'amortized',values=v,**seller(v,io)))
for financed,sale,months,rate,selling in itertools.product([False,True],[100000,250000],[1,6],[0,10],[0,6]):
 v={k:str(x) for k,x in dict(price=150000,closing=4500,rehab=35000,contingency=10,months=months,holding=600,sale=sale,selling=selling,sale_fixed=1500,loan=120000,rate=rate,points=2).items()};v['financing']='Interest-only loan' if financed else 'Cash';loan=D(120000) if financed else D(0);interest=loan*D(rate)*months/1200;fees=loan*D('.02');project=D(150000)+4500+D(35000)*D('1.1')+600*months+interest+fees;cost=D(sale)*D(selling)/100+1500;cash=project-loan;profit=D(sale)-cost-project
 out.append(dict(id='fix-and-flip',mode='project',values=v,metrics={'Net project profit before income tax':float(profit),'Total cash required before sale':float(cash),'Net sale cash after loan payoff':float(D(sale)-cost-loan),'Project cash-on-cash ROI':float(profit/cash*100),'Break-even sale price':float((project+1500)/(1-D(selling)/100))}))
p=pathlib.Path(__file__).resolve().parents[1]/'tests/fixtures/property-deals-expected.json';p.write_text(json.dumps(out,indent=2)+'\n');print(len(out),'independent70digitcases')
