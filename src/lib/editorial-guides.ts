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
export const editorialGuides=[recastGuide,debtGuide];
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
