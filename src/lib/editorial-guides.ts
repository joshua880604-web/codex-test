import {absoluteURL,directoryPath,siteConfig,siteName} from './site';
export const guidesPath='/guides/';
export const recastGuide={
 path:'/guides/mortgage-recast-vs-refinance/',
 title:'Mortgage Recast vs. Refinance: Payments, Costs & Extra Principal',
 heading:'Mortgage Recast vs. Refinance: Payments, Costs, and Extra Principal',
 description:'Compare recasting, refinancing and extra principal with worked mortgage examples, upfront cash, monthly payments, interest, fees and reproducible calculator inputs.',
 publishedOn:'2026-10-27',
 calculatorIds:['mortgage-recast','refinance','mortgage-payoff'],
};
export function editorialSchema(article=false,config=siteConfig()){
 const url=absoluteURL(article?recastGuide.path:guidesPath,config);
 const graph:Record<string,unknown>[]=[article?{
  '@type':'Article',headline:recastGuide.heading,description:recastGuide.description,
  datePublished:recastGuide.publishedOn,dateModified:recastGuide.publishedOn,
  author:{'@type':'Organization',name:siteName,url:absoluteURL('/about',config)},
  publisher:{'@type':'Organization',name:siteName},inLanguage:'en-US',
  ...(url?{'@id':url+'#article',url,mainEntityOfPage:url}:{}),
 }:{'@type':'CollectionPage',name:'Financial guides',description:'Worked comparisons for financial decisions, with explicit assumptions, sources and calculator examples.',...(url?{'@id':url,url,hasPart:[{'@type':'Article',headline:recastGuide.heading,url:absoluteURL(recastGuide.path,config)}]}:{})}];
 if(url)graph.push({'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Calculators',item:absoluteURL(directoryPath,config)},
  {'@type':'ListItem',position:2,name:'Guides',item:absoluteURL(guidesPath,config)},
  ...(article?[{'@type':'ListItem',position:3,name:'Mortgage recast vs. refinance',item:url}]:[])
 ]});
 return {'@context':'https://schema.org','@graph':graph};
}
