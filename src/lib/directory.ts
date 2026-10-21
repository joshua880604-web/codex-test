import {calculators} from './catalog';
import {searchTasks} from './keyword-targets';

export const directoryGroups=[
 {id:'mortgage-housing',title:'Mortgage & Housing',categories:['Mortgage and Real Estate'],popular:['mortgage','mortgage-payoff','house-affordability','refinance']},
 {id:'loans-debt',title:'Loans & Debt',categories:['Auto'],popular:['loan','auto-loan','credit-card','debt-payoff']},
 {id:'saving-investing',title:'Saving & Investing',categories:['Investment'],popular:['compound-interest','savings','investment','cd']},
 {id:'retirement',title:'Retirement',categories:['Retirement'],popular:['retirement','401k','roth-ira','rmd']},
 {id:'tax-salary',title:'Tax & Salary',categories:['Tax and Salary'],popular:['income-tax','take-home-paycheck','salary','sales-tax']},
 {id:'everyday',title:'Everyday',categories:['Everyday Tools'],popular:['percentage','scientific','date','unit-converter']},
];
const otherGroups:Record<string,string>={currency:'everyday',budget:'everyday',depreciation:'everyday',margin:'everyday',discount:'everyday',commission:'tax-salary','sales-tax':'tax-salary',vat:'tax-salary',inflation:'saving-investing','college-cost':'saving-investing'};
export function directoryGroup(id:string,category:string){return otherGroups[id]??directoryGroups.find(g=>g.categories.includes(category))?.id??'loans-debt';}
const aliases:Record<string,string>={
 'auto-loan':'car payment car loan vehicle finance',
 'auto-lease':'car lease vehicle lease',
 'take-home-paycheck':'paycheck take home pay gross to net pay',
 'income-tax':'federal tax taxes',
 '401k':'401(k) 401 k employer match',
 'rmd':'required minimum distribution',
 'roi':'return on investment',
 'irr':'internal rate of return',
 'heloc':'home equity line of credit',
 'margin':'profit margin',
 'date':'days between dates',
};
export const directoryDescriptions:Record<string,string>={
 'interest-rate':'Find the rate needed to reach a target.',
 'interest':'Project a balance from a given rate.',
 'apr':'Compare interest and borrowing fees.',
 'margin':'Profit as a share of the selling price.',
 'payment':'Solve for a loan payment or amount.',
};
export function directoryMatch(c:typeof calculators[number],query:string){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const haystack=(c.title+' '+(aliases[c.id]??'')+' '+(searchTasks[c.id]??[]).map(t=>t.keyword+' '+t.description).join(' ')).toLowerCase();
 return terms.every(term=>haystack.includes(term));
}
export function directorySort(tools:typeof calculators,popular:string[]){
 const rank=(id:string)=>{const i=popular.indexOf(id);return i<0?popular.length:i;};
 return [...tools].sort((a,b)=>rank(a.id)-rank(b.id)||a.title.localeCompare(b.title,'en'));
}
