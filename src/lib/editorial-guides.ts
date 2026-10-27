import {absoluteURL,directoryPath,siteConfig,siteName} from './site';
export const guidesPath='/guides/';
export type EditorialGuide={path:string;title:string;heading:string;description:string;publishedOn:string;calculatorIds:string[];topic:string;breadcrumb:string;cardIntro:string};
export const recastGuide:EditorialGuide={
 path:'/guides/mortgage-recast-vs-refinance/',
 title:'Mortgage Recast vs. Refinance: Payments, Costs & Extra Principal',
 heading:'Mortgage Recast vs. Refinance: Payments, Costs, and Extra Principal',
 description:'Compare recasting, refinancing and extra principal with worked mortgage examples, upfront cash, monthly payments, interest, fees and reproducible calculator inputs.',
 publishedOn:'2026-10-27',
 calculatorIds:['mortgage-recast','refinance','mortgage-payoff'],
 topic:'Mortgages',breadcrumb:'Mortgage recast vs. refinance',
 cardIntro:'See what a $50,000 principal payment changes, how recasting differs from keeping the old payment, and how to evaluate a separate refinance offer.',
};
export const debtGuide:EditorialGuide={
 path:'/guides/debt-snowball-vs-avalanche/',
 title:'Debt Snowball vs. Avalanche: Cost and Payoff Compared',
 heading:'Debt Snowball vs. Avalanche: A Same-Budget Comparison',
 description:'Compare debt snowball and avalanche using the same balances and monthly budget. See interest costs, payoff milestones, rollover effects and calculator examples.',
 publishedOn:'2026-10-27',
 calculatorIds:['debt-payoff','credit-cards-payoff','credit-card'],
 topic:'Loans & debt',breadcrumb:'Debt snowball vs. avalanche',
 cardIntro:'Compare three debts with the same $400 budget. See the first payoff milestone, final payoff, interest cost and what changes when payments stop rolling forward.',
};
export const cdSavingsGuide:EditorialGuide={
 path:'/guides/cd-vs-savings-account/',
 title:'CD vs. Savings Account: Rates, Access & Examples',
 heading:'CD vs. Savings Account: Rates, Access, and Worked Examples',
 description:'Compare CDs with savings and high-yield savings accounts using equal-deposit examples, changing APYs, early-withdrawal costs and calculator presets.',
 publishedOn:'2026-10-27',
 calculatorIds:['cd','savings','emergency-fund'],
 topic:'Savings & investing',breadcrumb:'CD vs. savings account',
 cardIntro:'Compare the same $10,000 over matched periods. See what a rate change or an illustrated early-exit penalty does to the difference in dollars.',
};
export const carPayoffGuide:EditorialGuide={
 path:'/guides/pay-off-car-loan-early/',
 title:'Paying Off a Car Loan Early: Savings, Costs & Examples',
 heading:'Paying Off a Car Loan Early: Savings, Costs, and Examples',
 description:'Compare extra monthly car-loan payments with lump sums using worked examples. Review interest savings, payment timing, contract terms and calculator inputs.',
 publishedOn:'2026-10-27',calculatorIds:['repayment','auto-loan'],
 topic:'Loans & debt',breadcrumb:'Paying off a car loan early',
 cardIntro:'See how monthly extras and a $2,000 lump sum affect a $20,000 balance. Compare interest, payoff periods and the cash each plan requires.',
};
export const biweeklyGuide:EditorialGuide={
 path:'/guides/biweekly-vs-monthly-mortgage-payments/',
 title:'Biweekly vs. Monthly Mortgage Payments: A Fair Comparison',
 heading:'Biweekly vs. Monthly Mortgage Payments: A Same-Budget Comparison',
 description:'Compare biweekly mortgage payments with standard monthly and equal-budget monthly plans. See interest, payoff time, partial-payment rules and worked examples.',
 publishedOn:'2026-10-27',calculatorIds:['biweekly-mortgage','mortgage-payoff','mortgage'],
 topic:'Mortgages',breadcrumb:'Biweekly vs. monthly mortgage payments',
 cardIntro:'Separate the extra annual payment from the schedule: compare standard monthly, accelerated biweekly and monthly payments with the same annual budget.',
};
export const pointsGuide:EditorialGuide={
 path:'/guides/are-mortgage-points-worth-it/',
 title:'Are Mortgage Points Worth It? Costs & Break-Even Examples',
 heading:'Are Mortgage Points Worth It? Compare Costs and Break-Even',
 description:'Compare mortgage points using same-loan quotes, monthly payments, cash-flow and balance-aware break-even, holding periods, extra fees and lender credits.',
 publishedOn:'2026-10-27',calculatorIds:['discount-points','mortgage','refinance'],
 topic:'Mortgages',breadcrumb:'Are mortgage points worth it?',
 cardIntro:'Compare a $4,000 points purchase across several holding periods. See why payment recovery and borrowing-cost break-even differ, and how fees can change the result.',
};
export const editorialGuides=[recastGuide,debtGuide,cdSavingsGuide,carPayoffGuide,biweeklyGuide,pointsGuide];
export function editorialSchema(article:boolean|EditorialGuide=false,config=siteConfig()){
 const entry=article===true?recastGuide:typeof article==='object'?article:undefined;
 const url=absoluteURL(entry?entry.path:guidesPath,config);
 const graph:Record<string,unknown>[]=[entry?{
  '@type':'Article',headline:entry.heading,description:entry.description,
  datePublished:entry.publishedOn,dateModified:entry.publishedOn,
  author:{'@type':'Organization',name:siteName,url:absoluteURL('/about',config)},
  publisher:{'@type':'Organization',name:siteName},inLanguage:'en-US',
  ...(url?{'@id':url+'#article',url,mainEntityOfPage:url}:{}),
 }:{'@type':'CollectionPage',name:'Financial guides',description:'Worked comparisons for financial decisions, with explicit assumptions, sources and calculator examples.',...(url?{'@id':url,url,hasPart:editorialGuides.map(guide=>({'@type':'Article',headline:guide.heading,url:absoluteURL(guide.path,config)}))}:{})}];
 if(url)graph.push({'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Calculators',item:absoluteURL(directoryPath,config)},
  {'@type':'ListItem',position:2,name:'Guides',item:absoluteURL(guidesPath,config)},
  ...(entry?[{'@type':'ListItem',position:3,name:entry.breadcrumb,item:url}]:[])
 ]});
 return {'@context':'https://schema.org','@graph':graph};
}
