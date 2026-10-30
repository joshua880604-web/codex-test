// Original editorial copy, checked against the existing calculator models.
// Server-rendered only; never interpolate a visitor's inputs or result.
export type BlogSnippetKit={intro:string;method:string[];assumptions:string[];use:string;limitations:string[]};
export const blogSnippetKits:Record<string,BlogSnippetKit>={
 'coast-fire':{
  intro:'Coast FIRE describes a retirement-saving milestone: an invested portfolio could grow toward a future retirement target without further contributions, under stated assumptions. The Coast FIRE Calculator estimates that threshold in today’s purchasing power and models when continued monthly investing could reach it. It separates the amount needed today from the larger portfolio needed at retirement. Reaching the modeled threshold does not pay current living costs or mean someone can retire immediately.',
  method:[
   'The retirement portfolio target equals annual portfolio-funded spending divided by the assumed withdrawal rate. Today’s Coast threshold discounts that target over the years remaining until the entered retirement age.',
   'Real annual growth is (1 + nominal return) / (1 + inflation) − 1, using decimal rates. Below the threshold, the model adds month-end investments until the first whole-month crossing, then stops contributions. If no crossing occurs, contributions continue through the target age.'
  ],
  assumptions:[
   'Money is expressed in today’s USD. Do not inflate the spending budget again; monthly investments maintain purchasing power.',
   'Returns and inflation are constant assumptions. Default rates and the withdrawal rate are illustrations, not forecasts or recommended safe settings.',
   'Couple mode combines both partners’ retirement investments and contributions once, using one shared age horizon and a combined spending budget.'
  ],
  use:'Use this tool to explain the difference between a Coast threshold and a retirement target, or to compare the effect of changing spending, returns or the target retirement age.',
  limitations:[
   'It does not model withdrawals or fund living costs before the target retirement age. Taxes, account-access rules, contribution limits, pensions and Social Security are not modeled.',
   'Constant growth does not capture market drawdowns or sequence risk. The output is not a probability of success, a guarantee or personalized financial advice.'
  ]
 },
 brrrr:{
  intro:'BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat. The BRRRR Calculator evaluates one property acquisition and one refinance, separating the cash invested before refinancing, the net refinance proceeds and the cash remaining in the deal. It also estimates stabilized rental cash flow after operating expenses, a separate capital reserve and the new loan payment. Cash recovered through refinancing comes from borrowing; it is not rental profit or proof that another deal can be funded.',
  method:[
   'Cash invested before refinance equals purchase price, acquisition closing costs, rehab with contingency, holding costs, acquisition interest and loan points, less acquisition loan funding.',
   'New refinance principal equals the entered after-repair value multiplied by the loan-to-value assumption. Net refinance cash subtracts the acquisition principal payoff and refinance costs. Cash remaining equals pre-refinance cash invested minus those net proceeds.',
   'Post-refinance cash-on-cash return equals annual stabilized cash flow after the capital reserve divided by positive cash remaining. Zero, negative or sub-cent remaining cash has no applicable return percentage.'
  ],
  assumptions:[
   'One USD property, a fully advanced interest-only acquisition loan and one fixed-rate amortizing refinance. Rehab and other project costs are cash-funded.',
   'The acquisition principal stays unchanged during the hold. Interest and points are paid from cash; refinance fees are deducted from proceeds once.',
   'NOI excludes financing and the separate capital reserve. Cash flow subtracts both the reserve and refinance principal and interest.'
  ],
  use:'Use this tool to reconcile a deal’s cash funding and refinance bridge, then compare cash remaining with stabilized rental cash flow under different ARV or rate assumptions.',
  limitations:[
   'It excludes rental income during the hold, staged construction draws, sale proceeds, appreciation as a return, income taxes and depreciation.',
   'ARV, LTV and loan rates are entered assumptions, not an appraisal, financing quote or approval. Cash-out restrictions and lender-specific DSCR eligibility are not evaluated; cash-on-cash is not total project ROI.'
  ]
 },
 roas:{
  intro:'Return on ad spend, or ROAS, compares revenue attributed to advertising with the advertising cost used to generate it. The ROAS Calculator expresses that relationship as a multiple and a percentage, and provides separate margin-based break-even and target contribution calculations. A multiple of four means four dollars of attributed revenue per advertising dollar, not four dollars of profit. Revenue attribution, reporting periods and the costs included in the margin must stay consistent when comparing scenarios.',
  method:[
   'Actual ROAS equals attributed revenue divided by positive advertising spend. Multiply that multiple by 100 to express ROAS as a percentage.',
   'Break-even ROAS equals 1 divided by contribution margin before advertising, using a positive decimal margin. Required ROAS for a post-ad contribution target equals 1 divided by the difference between pre-ad and target post-ad margins; the target must be lower than the pre-ad margin.'
  ],
  assumptions:[
   'Use the same period, currency, revenue definition and attribution window. Enter checked values manually; no advertising account or platform API is accessed.',
   'Contribution margin is a percentage of revenue after the included non-ad variable costs, not markup on cost. Do not subtract advertising from this input.',
   'A 40% pre-ad contribution margin implies break-even ROAS of 2.5, or 250%, for the included variable costs and advertising only.'
  ],
  use:'Use this tool to explain revenue per advertising dollar, compare actual ROAS with a consistent cost threshold, or explore the ad budget compatible with a post-ad contribution target.',
  limitations:[
   'Revenue less advertising spend is not profit. Unentered fixed overhead, financing and income taxes remain separate and can still produce a company loss.',
   'The model does not validate attribution, remove duplicate orders claimed by different platforms, forecast sales or recommend a bid setting. Platform conversion values must represent revenue for Actual ROAS.'
  ]
 }
};
