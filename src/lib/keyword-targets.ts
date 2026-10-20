export type SearchTask={keyword:string;mode:string;description:string};
export const searchTasks: Record<string, SearchTask[]> = {
 'mortgage-payoff':[{keyword:'Mortgage calculator with extra payments',mode:'remaining-extra',description:'Use your current balance and regular payment to compare extra monthly, annual or one-time payments. Review interest saved and time to payoff.'}],
 mortgage:[{keyword:'Mortgage calculator with taxes and insurance',mode:'monthly',description:'Estimate principal and interest alongside property tax, homeowners insurance and other entered ownership costs. These costs can change independently of the loan payment.'}],
 amortization:[{keyword:'Amortization calculator with extra payments',mode:'schedule',description:'Build a period-by-period schedule showing interest, principal and the remaining balance after extra payments.'}],
 retirement:[{keyword:'Retirement savings calculator',mode:'saving',description:'Find how much you need to save each month to reach a retirement target. The assumed return is not a guarantee.'},{keyword:'Retirement withdrawal calculator',mode:'withdrawal',description:'Estimate monthly withdrawals over a selected retirement horizon. Use Savings Longevity to explore how long an entered withdrawal can last.'}],
 savings:[{keyword:'Savings goal calculator',mode:'goal-contribution',description:'Enter a target amount, current savings and deadline to calculate the monthly deposit needed. Switch to Time Needed to solve for the first whole month reaching your target.'},{keyword:'Savings calculator with monthly deposits',mode:'accumulation',description:'Project a balance from recurring deposits, the chosen compounding frequency and contribution timing.'}],
 '401k':[{keyword:'401k growth calculator',mode:'projection',description:'Project annual account growth with salary increases, employee contributions and employer matching under the documented annual limits.'},{keyword:'401k contribution calculator',mode:'projection',description:'Review each year’s employee contribution separately from employer additions and account growth. The summary explicitly includes your existing balance.'},{keyword:'401k employer match calculator',mode:'match',description:'Explore matching tiers using the Maximize Employer Match form. Eligibility and plan-specific rules must be checked separately.'}],
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
