import {tool} from './helpers';
import {num,select,money,metric,number as read,type Values,type Result} from '../types';
const schedules:Record<string,number>={Monthly:12,Quarterly:4,Semiannually:2,Annually:1};
const bounded=(x:number)=>{if(!Number.isFinite(x)||Math.abs(x)>1e15)throw Error('Projection exceeds the supported range. Reduce the horizon, amounts or growth assumptions.');return x;};
export function dripPlan(v:Values):Result{
 const initial=read(v,'initial'),price=read(v,'price'),yieldRate=read(v,'yield')/100,monthly=read(v,'monthly'),years=read(v,'years'),priceGrowth=read(v,'price_growth')/100,dividendGrowth=read(v,'dividend_growth')/100,tax=read(v,'tax')/100;
 if(initial<0||initial>1e12||monthly<0||monthly>1e9||price<=0||price>1e9)throw Error('Use starting assets from $0 to $1 trillion, monthly additions up to $1 billion and a positive share price up to $1 billion.');
 if(initial===0&&monthly===0)throw Error('Enter starting assets or a positive monthly contribution.');
 if(!Number.isInteger(years)||years<1||years>100)throw Error('Use 1–100 whole projection years.');
 if(yieldRate<0||yieldRate>1||priceGrowth<=-1||priceGrowth>1||dividendGrowth<=-1||dividendGrowth>1||tax<0||tax>1)throw Error('Yield and dividend tax must be between 0% and 100%. Price and dividend growth must be greater than -100% and no more than 100%.');
 const frequency=schedules[v.frequency];if(!frequency)throw Error('Choose a supported dividend payment frequency.');
 const interval=12/frequency,initialDps=price*yieldRate,priceStep=Math.pow(1+priceGrowth,1/12);
 let p=price,dripShares=initial/price,cashShares=dripShares,cash=0,paidIn=initial,grossD=0,taxD=0,grossC=0,taxC=0,reinvested=0;
 let annualGrossD=0,annualTaxD=0,annualGrossC=0,annualTaxC=0;
 const rows:(number|string)[][]=[],annualRows:(number|string)[][]=[];
 for(let m=1;m<=years*12;m++){
  p=bounded(p*priceStep);if(p<1e-10)throw Error('The modeled share price falls below the supported precision. Shorten the horizon or reduce the decline.');
  let dividendD=0,dividendC=0,withheldD=0,withheldC=0;
  if(m%interval===0){
   const dps=bounded(initialDps*Math.pow(1+dividendGrowth,Math.floor((m-1)/12))/frequency);
   dividendD=bounded(dripShares*dps);dividendC=bounded(cashShares*dps);withheldD=dividendD*tax;withheldC=dividendC*tax;
   const net=dividendD-withheldD;dripShares=bounded(dripShares+net/p);cash=bounded(cash+dividendC-withheldC);reinvested=bounded(reinvested+net);
   grossD=bounded(grossD+dividendD);taxD=bounded(taxD+withheldD);grossC=bounded(grossC+dividendC);taxC=bounded(taxC+withheldC);
   annualGrossD+=dividendD;annualTaxD+=withheldD;annualGrossC+=dividendC;annualTaxC+=withheldC;
  }
  // Current-month dividends belong to opening shares; contributions buy at month end afterwards.
  dripShares=bounded(dripShares+monthly/p);cashShares=bounded(cashShares+monthly/p);paidIn=bounded(paidIn+monthly);
  const dripValue=bounded(dripShares*p),cashStock=bounded(cashShares*p),cashWealth=bounded(cashStock+cash);
  rows.push([m,p,monthly,dividendD,withheldD,dividendD-withheldD,dripShares,dripValue,dividendC-withheldC,cashShares,cashStock,cash,cashWealth,dripValue-cashWealth]);
  if(m%12===0){annualRows.push([m/12,paidIn,annualGrossD,annualTaxD,dripValue,annualGrossC,annualTaxC,cashStock,cash,cashWealth,dripValue-cashWealth]);annualGrossD=annualTaxD=annualGrossC=annualTaxC=0;}
 }
 const endD=bounded(dripShares*p),endStock=bounded(cashShares*p),endC=bounded(endStock+cash),forwardDps=bounded(initialDps*Math.pow(1+dividendGrowth,years));
 return {metrics:[money('Ending portfolio with DRIP',endD),money('Ending wealth without reinvestment (shares + cash)',endC),money('DRIP minus cash-dividend wealth',endD-endC),money('External money invested',paidIn),money('DRIP gain after dividend tax (before sale tax)',endD-paidIn),money('Cash-path gain after dividend tax (before sale tax)',endC-paidIn),money('Gross dividends with DRIP',grossD),money('Dividend tax paid with DRIP',taxD),money('Net dividends reinvested',reinvested),money('Cash dividends retained after tax',cash),money('Shares-only ending value without DRIP',endStock),money('Next-year gross dividend run rate with DRIP',bounded(dripShares*forwardDps)),money('Next-year net dividend run rate with DRIP',bounded(dripShares*forwardDps*(1-tax))),metric('Ending shares with DRIP',dripShares),metric('Ending shares without DRIP',cashShares),money('Modeled ending share price',p)],
 columns:['Month','Share price (USD)','External deposit (USD)','DRIP gross dividend (USD)','DRIP dividend tax (USD)','Net reinvested (USD)','Shares with DRIP','DRIP value (USD)','Cash-path net dividend (USD)','Cash-path shares','Cash-path stock value (USD)','Cash retained (USD)','No-DRIP total wealth (USD)','DRIP minus no-DRIP wealth (USD)'],rows,schedulePeriod:'Monthly',
 annualColumns:['Year','External money invested (USD)','DRIP gross dividends that year (USD)','DRIP tax that year (USD)','DRIP ending value (USD)','Cash-path gross dividends that year (USD)','Cash-path tax that year (USD)','Cash-path stock value (USD)','Cash retained to date (USD)','No-DRIP ending wealth (USD)','DRIP minus no-DRIP wealth (USD)'],annualRows,
 additionalTables:[{title:'Where the final wealth comes from',columns:['Reconciliation item','DRIP (USD)','Cash dividends (USD)'],rows:[['External starting assets plus new contributions',paidIn,paidIn],['Gross dividends paid',grossD,grossC],['Dividend taxes paid',taxD,taxC],['After-tax dividends reinvested',reinvested,0],['After-tax dividend cash retained',0,cash],['Ending stock market value',endD,endStock],['Ending stock value plus cash',endD,endC],['Gain after dividend taxes, before sale taxes',endD-paidIn,endC-paidIn]],note:'Reinvested dividends are internal cash flows, not external contributions. Cash in the no-DRIP path earns no interest. Ending stock is marked to market; no liquidation or capital-gains tax is calculated.'}],
 notes:[
 'One hypothetical USD stock or ETF with fractional shares. Initial shares = starting assets / share price. Starting annual dividend per share = share price × entered starting annual yield. The annual per-share dividend changes once at each model-year anniversary by the dividend growth assumption; yield is not held constant as share price changes. No live prices, ticker returns or company dividend forecasts are retrieved.',
 'Price appreciation is an effective annual share-price change EXCLUDING dividends, converted to its monthly root. Do not enter a total-return assumption that already includes dividends. The smooth hypothetical price path is not an ex-dividend date simulation; price growth and dividend growth are independent assumptions, and no additional dividend-related price drop is applied.',
 'Dividends are paid at the end of every selected interval (months 1–12, 3/6/9/12, 6/12 or 12). Opening shares for that month receive the payout. Dividend taxes are deducted immediately; DRIP buys fractional shares at the modeled month-end price. Both paths then buy shares with the same external monthly contribution. New shares do not receive another payout that month.',
 'The no-reinvestment path holds every after-tax dividend in cash with zero interest, rather than spending it. Its reported wealth includes both shares and cash. Reinvestment can perform worse if prices decline; the signed difference is retained. Dividend payments and growth can be cut or stopped in real investments.',
 'Dividend tax is one flat scenario rate, not a tax return. Zero represents no current dividend tax in this illustration, not automatic eligibility for an IRA or tax exemption. Qualified/ordinary distinctions, withholding credits, capital-gains taxes on sale, return of capital, fund distributions, tax lots and cost-basis accounting are not modeled.',
 'The next-year run rate holds ending shares fixed and applies the next model year’s dividend per share; it is not next year’s actual payout or a guaranteed income. It excludes future contributions and additional reinvestment. All amounts are nominal USD; no inflation adjustment, transaction fee, commission, whole-share rounding, DRIP discount or cash interest is included. Estimates only, not investment advice.'
 ]};
}
export const dripCalculator=tool('drip',[{id:'projection',title:'Dividend Reinvestment vs. Cash',description:'Compare reinvesting after-tax dividends with keeping them as cash, using the same starting assets and monthly deposits.',formula:'Payout = opening shares × annual dividend per share / payments per year. Net payout = gross payout × (1 − dividend tax). DRIP shares added = net payout / month-end price. Ending wealth = shares × price + retained cash.',fields:[
 {...num('initial','Starting investment value',10000,'$'),max:1e12},
 {...num('price','Starting share price',100,'$/share',.000001),max:1e9},
 {...num('yield','Starting annual dividend yield',4,'%'),max:100,hint:'Annual dividend per share divided by the starting price. Not a total-return assumption.'},
 select('frequency','Dividend payment frequency',['Monthly','Quarterly','Semiannually','Annually'],'Quarterly'),
 {...num('monthly','New investment each month',200,'$/month'),max:1e9,hint:'External money added after any dividend payment at month end. Same deposit in both paths.'},
 {...num('years','Projection length',20,'years',1),max:100,step:1},
 {...num('price_growth','Annual share-price appreciation',3,'%',-99.99),max:100,hint:'Excludes dividends. Do not use a total-return rate that already includes them.'},
 {...num('dividend_growth','Annual dividend-per-share growth',2,'%',-99.99),max:100,hint:'Changes the annual cash dividend per share once each model year; separate from share-price growth.'},
 {...num('tax','Flat dividend tax assumption',0,'%'),max:100,hint:'Deducted from each payout before reinvesting or retaining cash. Not a full U.S. tax calculation.'}
 ],calculate:dripPlan}],'Use this free DRIP calculator to compare dividend reinvestment with taking cash dividends. Model monthly contributions, payout frequency, dividend growth, share-price appreciation and a flat dividend-tax assumption.');
