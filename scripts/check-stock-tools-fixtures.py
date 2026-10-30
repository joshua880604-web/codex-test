from decimal import Decimal as D,getcontext
from pathlib import Path
import itertools,json
getcontext().prec=70;cases=[]
def profit(v):
 q=D(v['shares']);b=q*D(v['buy']);s=q*D(v['sell']);bf=D(v['buy_fee'])*(b/100 if v['buy_fee_unit']=='Percent' else 1);sf=D(v['sell_fee'])*(s/100 if v['sell_fee_unit']=='Percent' else 1);cost=b+bf;net=s-sf;cash=D(v['dividends']);gain=net+cash-cost;fraction=D(v['sell_fee'])/100 if v['sell_fee_unit']=='Percent' else D(0);fixed=D(v['sell_fee']) if v['sell_fee_unit']=='USD' else D(0);den=q*(1-fraction);be=max(D(0),(cost+fixed-cash)/den) if den else D(0)
 return {'Net profit / loss before income tax':float(gain),'Net return on purchase cost':float(gain/cost*100) if cost else 0,'Break-even sale price per share':float(be),'Total purchase cost including fees':float(cost),'Net sale proceeds after fees':float(net),'Cash dividends included':float(cash),'Total trading fees':float(bf+sf),'Price-change gain / loss before fees':float(s-b),'Shares':float(q),'Net profit / loss per share':float(gain/q)}
for q,sell,bu,su,div in itertools.product(['100','.125'],['60','40','0'],['USD','Percent'],['USD','Percent'],['0','30']):
 v=dict(shares=q,buy='50',sell=sell,buy_fee_unit=bu,buy_fee='5' if bu=='USD' else '1',sell_fee_unit=su,sell_fee='5' if su=='USD' else '2',dividends=div);cases.append(dict(id='stock-profit',mode='trade',values=v,metrics=profit(v)))
base=dict(shares='10',buy='100',sell='80',buy_fee_unit='USD',buy_fee='0',sell_fee_unit='USD',sell_fee='0',dividends='0')
for patch in [dict(buy='0'),dict(buy='0',sell_fee_unit='Percent',sell_fee='100'),dict(sell_fee_unit='Percent',sell_fee='100'),dict(sell_fee_unit='Percent',sell_fee='100',dividends='1000'),dict(dividends='1100'),dict(sell_fee='2000')]:
 v={**base,**patch};cases.append(dict(id='stock-profit',mode='trade',values=v,metrics=profit(v)))
for n,market in itertools.product([1,2,3,10,30],['','0','45']):
 lots=[dict(shares=str(D(i+1)/2),price=str(D(20)+i*3),fee=str(D(i)/10)) for i in range(n)];q=sum(D(x['shares']) for x in lots);gross=sum(D(x['shares'])*D(x['price']) for x in lots);fee=sum(D(x['fee']) for x in lots);cost=gross+fee;val=q*D(market or 0);gain=val-cost;has=market!=''
 metrics={'Average cost per share including buy fees':float(cost/q),'Total shares held':float(q),'Total purchase cost including fees':float(cost),'Weighted purchase price excluding fees':float(gross/q),'Total buy fees':float(fee),'Position value at comparison price':float(val) if has else 0,'Unrealized gain / loss before sale fees and tax':float(gain) if has else 0,'Unrealized return on purchase cost':float(gain/cost*100) if has and cost else 0,'Purchases entered':n}
 cases.append(dict(id='stock-average',mode='purchases',values=dict(lots=json.dumps(lots),market=market),metrics=metrics))
p=Path(__file__).resolve().parents[1]/'tests/fixtures/stock-tools-expected.json';p.write_text(json.dumps(cases,indent=2)+'\n');print(len(cases),'independent70-digitDecimalcases')
