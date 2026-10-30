import embedTools from "./embed-tools.json";
// Sharing, embedding and Pinterest are independent, verified capabilities.
export const pinterestToolIds=['coast-fire','fire','lean-fire','fat-fire','barista-fire','rmd','hsa','brrrr','rent-vs-buy','mortgage-vs-invest','mortgage-payoff','house-affordability','pmi','heloc','debt-snowball','debt-avalanche','credit-cards-payoff','roas','landed-cost','break-even'] as const;
export const expandedShareToolIds=["roi","compound-interest","investment","cd","mortgage","rental-property","cash-on-cash-return","house-hacking","retirement","401k","loan","auto-loan","credit-card","margin","markup","noi"] as const;
export const shareToolIds=[...pinterestToolIds,...expandedShareToolIds] as const;
export function hasShareTools(id:string){return (shareToolIds as readonly string[]).includes(id);}

export const shareToolPaths:Record<string,string>={"/mortgage-calculator":"mortgage","/mortgage-payoff-calculator":"mortgage-payoff","/house-affordability-calculator":"house-affordability","/rental-property-calculator":"rental-property","/heloc-calculator":"heloc","/rent-vs-buy-calculator":"rent-vs-buy","/auto-loan-calculator":"auto-loan","/investment-calculator":"investment","/compound-interest-calculator":"compound-interest","/cd-calculator":"cd","/roi-calculator":"roi","/retirement-calculator":"retirement","/401k-calculator":"401k","/rmd-calculator":"rmd","/loan-calculator":"loan","/single-credit-card-payoff-calculator":"credit-card","/multiple-credit-card-payoff-calculator":"credit-cards-payoff","/margin-calculator":"margin","/markup-calculator":"markup","/break-even-calculator":"break-even","/pmi-calculator":"pmi","/roas-calculator":"roas","/landed-cost-calculator":"landed-cost","/coast-fire-calculator":"coast-fire","/noi-calculator":"noi","/fire-calculator":"fire","/fat-fire-calculator":"fat-fire","/lean-fire-calculator":"lean-fire","/debt-snowball-calculator":"debt-snowball","/debt-avalanche-calculator":"debt-avalanche","/hsa-calculator":"hsa","/barista-fire-calculator":"barista-fire","/brrrr-calculator":"brrrr","/cash-on-cash-return-calculator":"cash-on-cash-return","/pay-off-mortgage-vs-invest-calculator":"mortgage-vs-invest","/house-hacking-calculator":"house-hacking"};
export const shareOpenEvent="calculator-share-open";

export function hasPinterest(id:string){return (pinterestToolIds as readonly string[]).includes(id);}
export function hasEmbed(id:string){return embedTools.some(tool=>tool.id===id);}
export const shareTabNames=["Share","Embed","Cite","Export"] as const;
export function shareTabs(id:string){return shareTabNames.filter(tab=>tab!=="Embed"||hasEmbed(id));}
