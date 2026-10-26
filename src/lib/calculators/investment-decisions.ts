import { tool } from './helpers';
import { num, select, number as n, metric, money, type Values, type Result } from '../types';
const percent = (label: string, value: number) => ({ ...metric(label, value, 'percent'), digits: 4 });
const rateField = (key: string, label: string, value: number) => ({ ...num(key, label, value, '%'), max: 99 });

function taxEquivalent(v: Values): Result {
  const federal = n(v, 'federal'), state = n(v, 'state'), local = n(v, 'local'), extra = n(v, 'surtax');
  const taxableTax = (federal + state + local + extra) / 100;
  const muniTax = v.muni_state === 'Exempt' ? 0 : (state + local) / 100;
  if (taxableTax >= 1 || muniTax >= 1) throw Error('Each combined marginal tax rate must be below 100%. Check overlapping rates; do not enter the same tax twice.');
  const exempt = n(v, 'exempt_yield'), taxable = n(v, 'taxable_yield'), amount = n(v, 'amount');
  const netExempt = exempt * (1 - muniTax), netTaxable = taxable * (1 - taxableTax), equivalent = netExempt / (1 - taxableTax);
  return {
    metrics: [percent('Tax-equivalent taxable yield', equivalent), percent('Tax-exempt option after-tax yield', netExempt), percent('Taxable option after-tax yield', netTaxable),
      { label: 'After-tax yield advantage (exempt minus taxable)', value: netExempt - netTaxable, displayValue: (netExempt - netTaxable).toFixed(4) + ' percentage points' },
      money('Tax-exempt option annual income after tax', amount * netExempt / 100), money('Taxable option annual income after tax', amount * netTaxable / 100), money('Annual after-tax income advantage', amount * (netExempt - netTaxable) / 100),
      percent('Combined tax rate on taxable income', taxableTax * 100), percent('State/local tax rate on exempt option', muniTax * 100), money('Compared investment amount', amount)],
    columns: ['Taxable marginal rate (%)', 'Required taxable yield (%)'],
    rows: [...new Set([0, 10, 20, 30, 40, 50, 60, taxableTax * 100])].sort((a,b)=>a-b).map(tax => [tax, netExempt / (1 - tax / 100)]),
    notes: ['Annual yield comparison in an ordinary U.S. taxable account. The exempt option is assumed federally tax-exempt; the selected state/local treatment applies to its full interest amount. This is not a determination that a particular bond or fund qualifies for exemption.',
      'Taxable marginal rate = entered federal + state + local + additional investment-income tax rates. The optional additional rate applies only to the taxable option. Rates are added without federal/state deductibility interactions, SALT limits, automatic income brackets, NIIT threshold tests or other credits. Enter non-overlapping effective rates appropriate to your situation.',
      'AMT-sensitive private-activity bonds, partially exempt fund distributions, capital gains, market discount, Social Security interactions and tax-advantaged retirement accounts are outside this model. State/local Exempt applies only when your security and residence qualify; an out-of-state municipal bond may be taxed differently.',
      'Use comparable annual yield conventions and holding horizons. Tax-equivalent yield is a break-even yield, not a guaranteed return or a risk-adjusted recommendation. Credit, duration, liquidity, fees and reinvestment risk are not equated. Annual income uses amount × annual after-tax yield without compounding.',
      'The sensitivity table varies only the combined rate on the taxable option, keeping the exempt option’s entered tax treatment fixed. Its rates are hypothetical comparison points, not a statutory tax-bracket table. A negative income advantage favors the taxable option under these assumptions.'],
  };
}
export const taxEquivalentYield = tool('tax-equivalent-yield', [{ id:'compare', title:'Compare After-Tax Yields',
  fields:[rateField('exempt_yield','Federally tax-exempt annual yield',4),rateField('taxable_yield','Taxable annual yield to compare',5),rateField('federal','Federal marginal income tax rate',24),rateField('state','State marginal tax rate',0),rateField('local','Local marginal tax rate',0),select('muni_state','State/local treatment of exempt option',['Exempt','Taxed']),{...rateField('surtax','Additional tax on taxable interest',0),hint:'Optional effective investment-income surtax rate, such as NIIT if applicable. No eligibility or income-threshold test is performed.'},{...num('amount','Investment amount for income comparison',10000,'$'),max:1e12}],
  description:'Compare federally tax-exempt and taxable annual yields using your marginal tax assumptions. Review the required taxable yield and annual after-tax income; no state or federal tax bracket is selected automatically.',
  formula:'Equivalent taxable yield = exempt yield × (1 − exempt-option tax rate) / (1 − taxable-option tax rate). After-tax yield = entered annual yield × (1 − applicable tax rate).', calculate:taxEquivalent
}], 'Compare tax-exempt and taxable investment yields, including entered state/local treatment and optional investment-income tax.');

function bill(v: Values, quoted: boolean): Result {
  const face=n(v,'face'),days=n(v,'days'),basis=Number(v.year_days),fee=n(v,'fee'),taxRate=(n(v,'federal')+n(v,'surtax'))/100;
  if(!Number.isInteger(days)||days<1||days>366)throw Error('Enter a whole holding period from 1 to 366 days.');
  if(!Number.isInteger(face/100))throw Error('Enter face value in $100 increments for this ordinary U.S. bill model.');
  if(taxRate>=1)throw Error('The combined federal and additional tax rate must be below 100%.');
  const price=quoted?face*(1-n(v,'discount')/100*days/360):face*n(v,'price100')/100;
  if(price<=0||price>face)throw Error('Purchase price must be positive and no greater than face value. Check the discount rate, price per $100 and holding days.');
  const profit=face-price,tax=profit*taxRate,cost=price+fee,net=profit-fee-tax,holding=profit/price;
  const effective=Math.expm1(Math.log1p(holding)*basis/days)*100;
  if(!Number.isFinite(effective))throw Error('Annualization exceeds numeric limits. Check the price and holding days.');
  return { metrics:[money('Net profit at maturity after fee and tax',net),money('Purchase price before fee',price),money('Gross discount interest at maturity',profit),
    money('Face value paid at maturity',face),money('Fee paid at purchase',fee),money('Total purchase cash outlay',cost),money('Estimated federal tax on discount interest',tax),money('Maturity proceeds after estimated tax',face-tax),
    percent('Holding-period return before fee and tax',holding*100),percent('Bank discount rate (360-day face basis)',profit/face*360/days*100),percent('Simple annualized yield before fee and tax',holding*basis/days*100),percent('Hypothetical effective annual yield',effective),
    percent('Net holding-period return after fee and tax',net/cost*100),percent('Net simple annualized yield after fee and tax',net/cost*basis/days*100),metric('Holding days',days),metric('Annualization year days',basis)],
    columns:['Day','Cash flow (USD)','Event'],rows:[[0,-cost,'Purchase price plus fee'],[days,face-tax,'Face value less estimated tax at maturity']],
    notes:['Ordinary U.S. Treasury bill held to maturity, sold at a discount or par. Bank discount rate uses face value and a 360-day year: price = face × (1 − discount × days / 360). This rate is not the return on your purchase cost. All entered rates are assumptions or your quote, not live auction data.',
      'Holding-period gross return = (face − price) / price. Simple annualized gross yield uses your selected 365- or 366-day year and does not compound. It is NOT the official Treasury auction Investment Rate or a promise of a broker bond-equivalent yield, particularly for longer bills with different quotation conventions.',
      'Hypothetical effective annual yield compounds the gross holding-period return assuming repeated reinvestment at the same return for a full selected year. This is a comparison convention, not interest paid each day or a reinvestment forecast. No accrued-balance growth curve is fabricated: the table shows only purchase and maturity cash flows.',
      'Federal tax is a simplified estimate on positive gross discount interest using your federal plus optional additional investment-income tax rate. Bill interest is exempt from state/local income tax. The fee reduces net cash return but is not deducted from the tax base; basis adjustments, AMT, tax-year accrual, withholding and personal NIIT eligibility are not calculated. Tax is shown at maturity for comparison, not as an actual filing/payment schedule.',
      'Face value uses $100 increments. Enter actual settlement-to-maturity days, excluding the settlement day; standard week shortcuts are nominal days, not a dated settlement or holiday calendar. The year-day selector affects annualized returns only, never the 360-day bank-discount price. Secondary sales, price premiums, reinvestment ladders, brokerage-specific charges and tax-advantaged accounts require different analysis. Internal prices retain precision; actual auction/broker rounding can differ.'],
  };
}
const billFields=()=>[{...num('face','Total face value',10000,'$',100),max:1e9,step:100},{...num('days','Holding length',91,'days',1),max:366,step:1},select('year_days','Annualization year length',['365','366']),{...num('fee','Purchase fee',0,'$'),max:1e9},rateField('federal','Federal marginal tax rate',24),{...rateField('surtax','Additional tax on bill interest',0),hint:'Enter an effective surtax only if applicable; this tool does not test NIIT eligibility.'}];
export const treasuryBill=tool('treasury-bill',[
 {id:'discount',title:'Price from Discount Rate',fields:[...billFields().slice(0,2),rateField('discount','Quoted bank discount rate',4.5),...billFields().slice(2)],description:'Enter the bank discount rate, face value and actual days to maturity. Compare purchase price, maturity interest and returns after your entered fee and tax assumptions.',formula:'Price = face × (1 − bank discount rate / 100 × days / 360). Net profit = face − price − fee − estimated federal tax. Simple annualized yield = holding-period return × selected year days / holding days.',calculate:v=>bill(v,true)},
 {id:'price',title:'Yield from Purchase Price',fields:[...billFields().slice(0,2),{...num('price100','Purchase price per $100 face',98,'$',.000001),max:100},...billFields().slice(2)],description:'Enter your price quote per $100 face and holding days. Calculate discount interest, bank discount rate, simple annualized yield and hypothetical effective annual yield without confusing their bases.',formula:'Total price = face × quoted price per $100 / 100. Holding return = (face − price) / price. Bank discount rate = (face − price) / face × 360 / days. Effective annual yield = (face / price)^(selected year days / days) − 1.',calculate:v=>bill(v,false)}
], 'Calculate U.S. Treasury bill purchase price, maturity profit and clearly labeled returns from a bank discount rate or purchase-price quote.');
export const investmentDecisions=[taxEquivalentYield,treasuryBill];
