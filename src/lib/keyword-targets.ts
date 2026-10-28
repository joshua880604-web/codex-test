import demandIntents from "./demand-intents.json";
import pageIntents from "./page-intents.json";
import catalog from "./catalog-data.json";
export type SearchTask={keyword:string;mode:string;description:string;aliases?:string[];values?:Record<string,string>};
export const searchTasks: Record<string, SearchTask[]> = {
 'mortgage-payoff':[{keyword:'Mortgage calculator with extra payments',mode:'remaining-extra',description:'Use your current balance and regular payment to compare extra monthly, annual or one-time payments. Review interest saved and time to payoff.'}],
 mortgage:[{keyword:'Mortgage calculator with taxes and insurance',mode:'monthly',description:'Estimate principal and interest alongside property tax, homeowners insurance and other entered ownership costs. These costs can change independently of the loan payment.'}],
 amortization:[{keyword:'Amortization calculator with extra payments',mode:'schedule',description:'Build a period-by-period schedule showing interest, principal and the remaining balance after extra payments.'}],
 retirement:[{keyword:'Retirement savings calculator',mode:'saving',description:'Find how much you need to save each month to reach a retirement target. The assumed return is not a guarantee.'},{keyword:'Retirement withdrawal calculator',mode:'withdrawal',description:'Estimate monthly withdrawals over a selected retirement horizon. Use Savings Longevity to explore how long an entered withdrawal can last.'}],
 savings:[{keyword:'Savings goal calculator',mode:'goal-contribution',description:'Enter a target amount, current savings and deadline to calculate the monthly deposit needed. Switch to Time Needed to solve for the first whole month reaching your target.'},{keyword:'Savings calculator with monthly deposits',mode:'accumulation',description:'Project a balance from recurring deposits, the chosen compounding frequency and contribution timing.'}],
 '401k':[{keyword:'401k growth calculator',mode:'projection',description:'Project annual account growth with salary increases, employee contributions and employer matching under the documented annual limits.'},{keyword:'401k contribution calculator',mode:'projection',description:'Review each year’s employee contribution separately from employer additions and account growth. Starting balance is shown separately from new employee contributions.'},{keyword:'401k employer match calculator',mode:'match',description:'Explore matching tiers using the Maximize Employer Match form. Eligibility and plan-specific rules must be checked separately.'}],
 repayment:[{keyword:'Loan payoff calculator with extra payments',mode:'extra-payments',description:'Compare a fixed monthly loan payment with additional principal payments. Review months saved, interest saved and the full repayment schedule.'}],
 'compound-interest':[{keyword:'Compound interest calculator with monthly contributions',mode:'growth',description:'Project the ending balance, total deposits and net earnings. This compound interest calculator with monthly deposits also supports annual contributions and beginning- or end-of-period timing.'}],
};
export const keywordTitles: Record<string,string>={
 'mortgage-payoff':'Mortgage Calculator with Extra Payments - Payoff & Savings',
 mortgage:'Mortgage Calculator with Taxes and Insurance',
 amortization:'Amortization Calculator with Extra Payments',
 retirement:'Retirement Calculator - Savings Goals & Monthly Withdrawals',
 savings:'Savings Calculator - Monthly Deposits & Savings Goals',
 '401k':'401k Calculator - Growth, Contributions & Employer Match',
 repayment:'Loan Payoff Calculator with Extra Payments',
 'compound-interest':'Compound Interest Calculator with Monthly Contributions',
};

// Existing user-researched targets keep ownership; other pages use editorial candidates.
for (const intent of pageIntents) {
  if (!searchTasks[intent.id]) searchTasks[intent.id] = [{keyword:intent.keyword,mode:intent.mode,description:intent.description}];
  if (!keywordTitles[intent.id]) keywordTitles[intent.id] = catalog.find(c=>c.id===intent.id)!.title + " - " + intent.titleSuffix;
}

// Merge researched synonyms into the same useful calculation, rather than duplicate pages/cards.
for (const entry of demandIntents.intents) {
  const values:Record<string,string>|undefined = entry.values ? Object.fromEntries(Object.entries(entry.values).filter(([,value])=>typeof value === "string")) : undefined;
  const description = "description" in entry ? entry.description : undefined;
  const tasks = searchTasks[entry.id];
  const existing = tasks.find(t=>t.keyword.toLowerCase()===entry.keyword.toLowerCase() && !values)
    ?? tasks.find(t=>t.mode===entry.mode && JSON.stringify(t.values)===JSON.stringify(values));
  if (existing) {
    if (existing.keyword.toLowerCase()!==entry.keyword.toLowerCase()) {
      existing.aliases = [...new Set([...(existing.aliases??[]),entry.keyword])];
    }
    if (description) existing.description = description;
  } else tasks.push({keyword:entry.keyword,mode:entry.mode,description:description??tasks[0].description,...(values?{values}:{})});
}
Object.assign(keywordTitles, demandIntents.titles);

// Keep the largest supported, broad query at the first use-case entry for each researched page.
const primaryQueries:Record<string,string>={
 'auto-loan':'Car payment calculator',salary:'Salary calculator','sales-tax':'Sales tax calculator',rent:'Rent affordability calculator',
 'mortgage-payoff':'Mortgage payoff calculator','home-equity-loan':'Home equity loan calculator',amortization:'Mortgage amortization calculator',
 'house-affordability':'Home affordability calculator',refinance:'Refinance calculator',heloc:'Heloc calculator',savings:'Savings interest calculator',
 investment:'Investment growth calculator',roi:'Return on investment calculator',bond:'Bond price calculator',retirement:'Retirement income calculator',
 'debt-payoff':'Debt payoff calculator','student-loan':'Student loan payoff calculator',margin:'Profit margin calculator','income-tax':'Federal income tax calculator',
};
for(const [id,keyword] of Object.entries(primaryQueries)){
 const tasks=searchTasks[id], task=tasks.find(t=>t.keyword.toLowerCase()===keyword.toLowerCase()||t.aliases?.some(a=>a.toLowerCase()===keyword.toLowerCase()));
 if(!task)continue;
 if(task.keyword.toLowerCase()!==keyword.toLowerCase()){
  task.aliases=[task.keyword,...(task.aliases??[]).filter(a=>a.toLowerCase()!==keyword.toLowerCase())];task.keyword=keyword;
 }
 searchTasks[id]=[task,...tasks.filter(t=>t!==task)];
}

// User-researched evergreen tools own distinct intents; legacy functions remain available.
import evergreenTargets from "./evergreen-targets.json";
for(const [id,entry] of Object.entries(evergreenTargets)){searchTasks[id]=entry.tasks;keywordTitles[id]=entry.title;}

// Dedicated mortgage pages own these intents; retain the older calculation modes.
import mortgageToolTargets from "./mortgage-tools-targets.json";
for (const [id, entry] of Object.entries(mortgageToolTargets)) { searchTasks[id] = entry.tasks; keywordTitles[id] = entry.title; }

// User-provided competitor gap, 2026-10-26: one CD page owns term variants.
keywordTitles.cd = "CD Calculator - Interest, APY & Maturity";
searchTasks.cd[0].description = "Estimate CD maturity value and interest for terms such as 6, 12 or 14 months. Match the entered nominal rate to its compounding frequency; monthly schedule interest is accrued, not a cash payout.";
searchTasks.cd[0].aliases = [...new Set([...(searchTasks.cd[0].aliases ?? []), "12 month CD calculator", "14 month CD calculator", "Monthly CD interest calculator"])];

import investmentDecisionTargets from "./investment-decisions-targets.json";
for (const [id, entry] of Object.entries(investmentDecisionTargets)) {searchTasks[id]=entry.tasks;keywordTitles[id]=entry.title;}

// US research: serve high-yield and goal intents from the existing Savings page.
for (const task of searchTasks.savings) {
  task.aliases = task.aliases?.filter(alias => !["high yield savings calculator", "high yield savings account calculator", "hysa calculator"].includes(alias.toLowerCase()));
  if (task.mode === "accumulation") task.description = "Project savings with deposits and an entered APY or nominal rate. Match the rate type and contribution timing; current bank offers are not fetched.";
}
searchTasks.savings.push({keyword:"High yield savings calculator",mode:"accumulation",description:"Project savings using an entered APY, monthly deposits and term. APY includes compounding; account yields can change and no live rates are fetched.",values:{rate_type:"APY"},aliases:["High yield savings account calculator","HYSA calculator"]});

// User-provided US broad-match and question research, reviewed 2026-10-28.
keywordTitles['house-affordability']='House Affordability Calculator - Income & Monthly Budget';
keywordTitles['fha-loan']='FHA Loan Calculator - Payment, Down Payment & MIP';
keywordTitles['va-mortgage']='VA Loan Calculator - Monthly Payment & Funding Fee';
searchTasks['house-affordability'][0].description='Estimate how much house fits your gross income or monthly housing budget, with down payment, debts, tax and insurance assumptions. Not lender approval.';
searchTasks['fha-loan'][0].description='Estimate FHA monthly payments with down payment, financed upfront MIP, recurring mortgage insurance and entered ownership costs. Eligibility is not determined.';
searchTasks['va-mortgage'][0].description='Estimate a VA purchase loan payment with the funding fee financed or paid upfront, down payment and entered ownership costs. Confirm eligibility separately.';
searchTasks['va-mortgage'][0].aliases=[...new Set([...(searchTasks['va-mortgage'][0].aliases??[]),'VA loan calculator','VA home loan calculator','VA loan payment calculator'])];
searchTasks['fha-loan'][0].aliases=[...new Set([...(searchTasks['fha-loan'][0].aliases??[]),'FHA loan payment calculator','FHA mortgage calculator'])];

// User-provided retirement US keyword research, reviewed 2026-10-28.
keywordTitles['401k']='401k Calculator - Contributions, Match & Growth';
keywordTitles['roth-ira']='Roth IRA Calculator - Growth & Contributions';
keywordTitles.rmd='RMD Calculator - Required Minimum Distributions';
const withdrawalTask=searchTasks.retirement.find(task=>task.mode==='withdrawal')!;
withdrawalTask.aliases=[...new Set([withdrawalTask.keyword,...(withdrawalTask.aliases??[])])].filter(keyword=>keyword.toLowerCase()!=='retirement withdrawal calculator');
withdrawalTask.keyword='Retirement withdrawal calculator';
withdrawalTask.description='Estimate before-tax monthly withdrawals with entered return, inflation and lifespan assumptions. Constant-return results are not guaranteed income or safe withdrawal rates.';
searchTasks['roth-ira'][0].description='Project Roth IRA growth with year-end contributions and a simplified taxable comparison. Contribution eligibility and qualified tax-free distributions require separate checks.';
searchTasks['roth-ira'][0].aliases=[...new Set([...(searchTasks['roth-ira'][0].aliases??[]),'Roth IRA calculator','Roth IRA growth calculator'])];
searchTasks.rmd[0].aliases=[...new Set([...(searchTasks.rmd[0].aliases??[]),searchTasks.rmd[0].keyword,'Required minimum distribution calculator'])];
searchTasks.rmd[0].keyword='RMD calculator';
