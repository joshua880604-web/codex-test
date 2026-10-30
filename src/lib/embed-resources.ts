import tools from './embed-tools.json';
import descriptions from './embed-resource-copy.json';
import {absoluteURL,siteConfig} from './site';
export const embedResourcesPath='/embed-resources';
export const embedResourcesReviewedOn='2026-10-30';
export const embedResources=tools.map(tool=>({...tool,path:'/'+tool.slug,description:descriptions[tool.id as keyof typeof descriptions]}));
export function embedResourcesSchema(config=siteConfig()){
 const url=absoluteURL(embedResourcesPath,config);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage',...(url?{'@id':url+'#page',url}:{}),name:'Free embeddable financial calculators',description:'Ad-free hosted calculators for personal and commercial blogs, with visible attribution.',dateModified:embedResourcesReviewedOn},
  {'@type':'ItemList',name:'Supported calculator embeds',numberOfItems:embedResources.length,itemListElement:embedResources.map((tool,i)=>({'@type':'ListItem',position:i+1,name:tool.title,...(absoluteURL(tool.path,config)?{url:absoluteURL(tool.path,config)}:{})}))}
 ]};
}
