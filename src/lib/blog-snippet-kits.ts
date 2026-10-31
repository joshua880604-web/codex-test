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
 },
 "fire":{
  "intro": "Financial independence, retire early (FIRE) starts with a portfolio target for the spending that investments must fund. This calculator estimates that full target and the first modeled month current assets and continued investing reach it. Unlike Coast FIRE, it does not discount a future target to a smaller threshold today. Reaching the target is a savings milestone under stated assumptions, not proof that retirement withdrawals will succeed.",
  "method": [
    "The FIRE target is annual portfolio-funded spending divided by the assumed withdrawal rate. For example, a $40,000 annual budget at an illustrative 4% rate produces a $1,000,000 target; that arithmetic does not establish a safe withdrawal rate.",
    "Real annual growth is (1 + nominal return) / (1 + inflation) − 1. Assets grow monthly, followed by month-end investments. The projection stops at the first whole-month target crossing or the selected age limit."
  ],
  "assumptions": [
    "All money is in today’s USD. Monthly investments maintain purchasing power; do not inflate the budget again.",
    "Returns and inflation are constant. The budget must include any taxes and other costs the portfolio needs to fund. Default rates are illustrations."
  ],
  "use": "Use this model to explain a full FIRE number or compare how spending, savings and return assumptions change the modeled timeline. Keep the horizon consistent when comparing plans.",
  "limitations": [
    "No retirement withdrawals, market paths, success probability, account-access rules, contribution limits, benefit estimates or automatic tax calculations are modeled.",
    "The withdrawal rate only sizes the target. A crossing does not test longevity, healthcare costs or sequence risk; an unreached target does not imply a later date outside the selected horizon."
  ]
},
 "debt-snowball":{
  "intro": "The debt snowball method directs extra repayment toward the smallest remaining balance after paying every debt’s minimum. This calculator produces a monthly payoff plan, clearance milestones and a comparison with avalanche using the same starting inputs. It helps explain payment order and budget rollover without assuming that smaller-balance wins guarantee motivation, lower interest or better credit.",
  "method": [
    "Each month, interest equals the opening balance multiplied by APR / 12. After minimum payments, remaining balances are ranked smallest first; equal balances favor the higher APR, then entered order. Payments are capped at the amount owed.",
    "The monthly budget includes all minimums. For example, minimums totaling $250 within a $400 budget leave $150 extra, not $400 extra. A one-time payment is added only in its selected month if debts remain."
  ],
  "assumptions": [
    "Enter up to 20 debts in USD, with fixed APRs and fixed dollar minimums. No new borrowing or fees are added.",
    "With rollover on, freed minimums remain in a fixed total budget until the final capped payment. With it off, each cleared account’s minimum is removed from future budgets."
  ],
  "use": "Use this tool to illustrate snowball payment order and clearance milestones. Keep rollover on for a fixed-budget comparison with avalanche; with rollover off, the strategies can have different future budgets.",
  "limitations": [
    "Actual lenders may use daily interest, changing minimums, promotional rates or different payment allocation. Check current statements before acting on the schedule.",
    "The model supports up to 1,200 months and cannot fix a budget below required minimums. It does not estimate credit scores, debt settlement or behavioral outcomes; clearance order can differ from the extra-payment priority."
  ]
},
 "debt-avalanche":{
  "intro": "The debt avalanche method directs extra repayment toward the highest APR after paying all minimums. This calculator tracks monthly balances, interest and clearance milestones, and compares snowball under the same starting inputs. It makes the cost of different repayment orders visible without treating a projected result as a lender quote or assuming that everyone will maintain the same repayment behavior.",
  "method": [
    "Interest accrues on each opening balance at APR / 12. Minimums are paid first, then extra money goes to remaining debts in descending APR order. Equal APRs preserve entered order. Final payments are capped at the amount owed.",
    "The total budget already includes minimums. For example, a $1,000 opening balance at 24% APR incurs $20 interest in the first modeled month before payments. A scheduled one-time payment is additional to that month’s regular budget."
  ],
  "assumptions": [
    "Use fixed APRs and fixed dollar minimums for up to 20 USD debts. There is no new borrowing or fee accrual.",
    "Rollover on keeps the total monthly budget fixed after an account clears; rollover off removes that account’s minimum from future budgets. Compare the same policy across both strategies."
  ],
  "use": "Use this model to explain highest-APR-first repayment and compare modeled interest with snowball. With rollover off, different clearance dates can change future budgets, so the comparison is not payment order alone.",
  "limitations": [
    "Daily interest, promotional periods, changing minimums and lender-specific allocation are excluded. A smaller debt may clear through minimum payments before the highest-APR extra-payment target.",
    "Projections stop at a supported 1,200-month horizon and require a budget covering minimums. They do not assess affordability, credit scores, settlement options or motivation; review actual statements and changing terms."
  ]
},
 "cash-on-cash-return":{
  "intro": "Cash-on-cash return measures annual cash flow relative to cash invested. This calculator offers a simple cash-yield calculation and a rental property worksheet that separates acquisition cash, operations, financing and reserves. It is a cash-income measure, not total investment return: appreciation and principal paydown are different components and are not added to cash received.",
  "method": [
    "Cash-on-cash return equals annual cash flow divided by positive cash invested, multiplied by 100. For example, $6,000 annual cash flow on $60,000 invested is 10%. Simple monthly mode multiplies recurring monthly cash flow by 12.",
    "The property worksheet uses price minus purchase loan, plus cash-paid closing costs, initial repairs and initial reserve cash as the basis. Annual cash flow subtracts operating expenses, actual first-year scheduled principal and interest, other financing payments and the separate capital reserve allowance."
  ],
  "assumptions": [
    "The worksheet models an immediately stabilized property for its first 12 months, with constant rent, costs and a fixed-rate amortizing loan.",
    "Vacancy reduces rent only; other income is already net. NOI excludes financing and the separate capital reserve. Count each expense once, and include all deductions yourself in simple mode."
  ],
  "use": "Use this tool to distinguish cash yield after financing from cap rate before financing. Compare properties only when the cash basis and reserve treatment are consistent.",
  "limitations": [
    "Zero, negative or sub-cent cash invested has no applicable yield percentage. Negative cash flow on a positive basis produces a negative yield.",
    "No sale, appreciation, refinance, income tax, rent growth or renovation delay is projected. Monthly mode is for recurring cash flow, not annualizing a one-time distribution. Initial reserve cash and the ongoing reserve allowance serve different purposes."
  ]
},
 "mortgage-vs-invest":{
  "intro": "Paying down a mortgage and investing compete for the same available cash. This calculator compares both paths using equal initial cash, an equal monthly budget and one common horizon. It includes investing payments freed after payoff, so the comparison goes beyond interest saved versus investment growth. The result is a conditional financial position, not a recommendation or a forecast.",
  "method": [
    "The monthly budget is scheduled mortgage principal and interest plus the entered extra amount. Paydown-first applies initial cash to principal and pays extra each month; invest-first invests initial cash and the monthly extra while making scheduled payments.",
    "Both paths invest unused budget at month end, including freed payments after payoff. Investments grow before those deposits. At the same horizon, compare investment account minus remaining mortgage; positive invest-first advantage favors that path within the model."
  ],
  "assumptions": [
    "The mortgage uses nominal annual interest / 12; investment return is an effective annual assumption after fees and an entered allowance for tax drag. It is not a calculated tax bill.",
    "For example, a $1,000 scheduled payment plus $200 extra gives both paths a $1,200 monthly budget. Rates and budgets stay fixed in nominal USD; the original scheduled payment is not recast."
  ],
  "use": "Use this comparison to test return sensitivity and distinguish liquid investments from debt reduction. Keep emergency cash outside the initial amount and use identical horizons.",
  "limitations": [
    "Common home value cancels from the comparison. Investment account minus mortgage is not total household net worth; a negative position does not imply negative household wealth.",
    "No volatility, sequence risk, mortgage-interest deduction, withdrawal tax, prepayment penalty, PMI cancellation, refinancing or inflation adjustment is modeled. Loan terms, liquidity and uncertain investment losses can change the decision."
  ]
},
 "roi":{
  "intro": "Return on investment (ROI) compares an investment’s total gain or loss with its initial cost. This calculator shows both total ROI and the constant compound annual rate implied by the entered holding period. Separating those figures helps writers avoid comparing a multi-year percentage directly with a one-year return or presenting an annualized calculation as an observed yearly performance record.",
  "method": [
    "Total ROI equals (amount returned − amount invested) / amount invested × 100. Annualized return equals [(amount returned / amount invested)^(1 / years) − 1] × 100.",
    "For example, $10,000 invested and $15,000 returned after five years means $5,000 gain, 50% total ROI and approximately 8.45% annualized return. The annualized figure is not 50% divided by five."
  ],
  "assumptions": [
    "Use a positive initial investment and holding period, with a nonnegative total amount returned. Enter the full amount recovered, not just the profit.",
    "The calculation treats the investment as an initial outflow and a terminal receipt. Include only costs and taxes you have already reflected consistently in those amounts; they are not estimated separately."
  ],
  "use": "Use this calculator for a single investment with one start and one end value. Choose investment length or start/end dates, and explain total and annualized returns separately.",
  "limitations": [
    "Interim deposits, withdrawals and distributions are not dated cash flows here. If their timing matters, use an appropriate cash-flow return model instead of treating all receipts as terminal.",
    "Annualized return does not imply steady yearly gains, forecast future returns or adjust for risk and inflation. A total loss can show −100%, but comparing opportunities still requires attention to timing, costs and uncertainty."
  ]
},
 "lean-fire":{
  "intro": "Lean FIRE describes financial independence built around a lower-spending lifestyle, not a universal income or wealth cutoff. This calculator builds a portfolio-funded budget from essential monthly costs and recurring annual provisions, then estimates the full FIRE target and time to reach it. It makes spending choices explicit without assuming that a smaller target guarantees a workable retirement.",
  "method": [
    "Annual budget equals monthly categories multiplied by 12, plus recurring annual provisions and the entered tax allowance, with the spending buffer applied to the whole sum. Divide that budget by the withdrawal assumption to size the target.",
    "For example, $2,000 in monthly costs plus $2,000 in annual provisions and a $1,000 tax allowance equals $27,000 before buffer. A 10% buffer gives $29,700; an illustrative 4% withdrawal assumption implies a $742,500 target."
  ],
  "assumptions": [
    "All money uses today’s USD. Monthly investments are added at month end and maintain purchasing power. Exact real growth is (1 + nominal return) / (1 + inflation) − 1.",
    "The portfolio funds the entire budget. Include healthcare, housing, taxes and irregular recurring costs once; annual provisions are not dated one-time expenses."
  ],
  "use": "Use this worksheet to explain how an essential-spending budget translates into a full FIRE number. The budget sensitivity table changes target size only, not the target age or saving capacity.",
  "limitations": [
    "Growth and inflation are constant assumptions. The projection stops at the first whole-month target crossing or age limit; it does not simulate retirement withdrawals or market losses.",
    "No Social Security, pension timing, tax calculation, account-access rules or contribution limits are modeled. A buffer and an assumed withdrawal rate do not establish safety or lifestyle feasibility."
  ]
},
 "fat-fire":{
  "intro": "Fat FIRE describes financial independence with a higher-spending retirement lifestyle. There is no single dollar threshold that makes a plan Fat FIRE. This calculator builds a budget from core living costs and additional lifestyle provisions, then estimates the full portfolio target and modeled savings timeline. It separates the cost of a chosen lifestyle from claims about investment safety.",
  "method": [
    "Annualize monthly core costs, add annual lifestyle categories, other recurring provisions and the entered tax allowance, then apply the spending buffer to that entire budget. The FIRE target is the resulting annual budget divided by the withdrawal assumption.",
    "For example, $5,000 monthly core costs plus $40,000 of annual additions and taxes makes a $100,000 budget before buffer. A 10% buffer gives $110,000; at an illustrative 4% withdrawal rate, the target is $2,750,000."
  ],
  "assumptions": [
    "Core costs and lifestyle additions must not overlap. Tax allowance is your dollar estimate, not an automatically calculated liability. Annual provisions represent recurring costs.",
    "Amounts use today’s USD. Exact real growth is (1 + nominal return) / (1 + inflation) − 1. Month-end investments maintain purchasing power and stop when the full target is first reached."
  ],
  "use": "Use this model to show how travel, family support, healthcare and other lifestyle choices change the required portfolio. Its budget sensitivity rows compare target sizes, not alternative retirement ages.",
  "limitations": [
    "The portfolio funds all entered spending. Benefits, contribution limits, account-access rules and dated large purchases are not modeled; a later-starting pension cannot simply offset every year.",
    "Constant returns do not capture drawdowns or sequence risk. The model ends at target crossing or the age limit and does not test later withdrawals. Neither the buffer nor the withdrawal assumption guarantees a sustainable retirement."
  ]
},
 "barista-fire":{
  "intro": "Barista FIRE combines part-time earnings with portfolio-funded living costs before full retirement. This calculator models a transition from saving to part-time work, an income-stop age and a later full-retirement target. It distinguishes a temporary earnings bridge from income that lasts indefinitely, making the timing of work and spending visible.",
  "method": [
    "The full-retirement target equals the annual full-retirement budget divided by the withdrawal assumption. Working backward, required assets this month equal (next month’s required assets + this month’s end-month spending gap) / monthly real growth.",
    "For example, $40,000 annual bridge spending and $24,000 after-tax earnings leave a $16,000 annual portfolio-funded gap while earnings continue. After the income-stop age, the entire $40,000 bridge budget must be funded by investments until full retirement."
  ],
  "assumptions": [
    "All amounts use today’s USD. Before part-time work, contributions are invested at month end. Contributions stop at the entered transition age; excess part-time income above spending is not reinvested.",
    "Real growth is (1 + nominal return) / (1 + inflation) − 1. Spending, income and contributions maintain purchasing power. Include healthcare and tax allowances in spending; earnings must be after tax."
  ],
  "use": "Use this model to explain why income duration matters and compare projected transition assets with the portfolio required to fund the bridge and leave the terminal target.",
  "limitations": [
    "It does not search for a different transition age or simulate withdrawals after full retirement. The terminal withdrawal assumption sizes a target only, not a safe spending policy.",
    "Withdrawals cannot exceed available assets; uncovered costs appear as unfunded spending. No market paths, changing earnings, Social Security, pensions, tax brackets or early account-access rules are modeled. A funded scenario is not a success probability."
  ]
},
 "cap-rate":{
  "intro": "Capitalization rate compares a property’s annual net operating income (NOI) with its price or market value before financing. This calculator accepts known annual NOI or builds it from rental income and operating costs. It also shows the value implied by a chosen target cap rate, while keeping that scenario separate from an appraisal or investment recommendation.",
  "method": [
    "Cap rate equals annual NOI / property value × 100. For positive NOI, indicated value equals annual NOI / the target rate expressed as a decimal.",
    "For example, $18,000 annual NOI on a $300,000 property produces a 6% cap rate. Holding NOI fixed, an illustrative 5% target rate implies $360,000. That value follows from the assumed rate; it is not an observed market price."
  ],
  "assumptions": [
    "NOI includes ordinary property operating costs such as property tax and insurance. It excludes mortgage payments, depreciation, owner income tax, acquisition costs, capital improvements and replacement reserves.",
    "Match the income period and valuation basis: trailing operations and forward stabilized assumptions are different. Worksheet amounts are annualized once; switching reporting period reinterprets entries rather than converting them."
  ],
  "use": "Use this calculator to explain unlevered operating yield or compare the effect of target rates at unchanged NOI. Use cash-on-cash return for a separate measure after financing and reserves.",
  "limitations": [
    "Negative NOI yields a signed negative cap rate, but zero or negative NOI does not support a positive indicated value at the target rate.",
    "No appraisal, local comparables, rent-growth forecast, lender eligibility or universal good cap rate is supplied. A higher rate can reflect higher risk or different assumptions. Definitions used by lenders and appraisers may differ; this ratio is not total ROI."
  ]
},
 "house-hacking":{
  "intro": "House hacking means living in part of a property while renting other rooms or units. This calculator estimates the owner’s recurring housing cash cost after tenant rent, compares it with an alternative all-in renting budget and shows initial purchase cash separately. The comparison describes a housing budget, not total property profit or investment return.",
  "method": [
    "Monthly net housing cash cost equals mortgage principal and interest plus entered recurring costs and a capital reserve, minus tenant rent after vacancy and other net housing income. Budget difference equals alternative renting cost minus this net housing cost.",
    "For example, $3,000 monthly costs and $1,500 scheduled tenant rent with a 10% loss allowance give $1,350 effective rent and $1,650 net housing cost, assuming no other income. Against a $1,800 renting budget, the recurring difference is $150 per month."
  ],
  "assumptions": [
    "Enter only spaces rented to others, excluding the owner’s living area. Vacancy applies to scheduled tenant rent; other income must already be net. Refundable deposits and owner wages are not property income.",
    "Use whole-property owner-paid costs and a comparable all-in renting budget. Initial cash includes down payment, closing costs, repairs and initial reserves; these are separate from recurring expenses."
  ],
  "use": "Use this snapshot to explain tenant rent offsets, upfront funding and vacancy sensitivity. Keep capital reserves, ordinary maintenance and escrow components distinct to avoid counting a cost twice.",
  "limitations": [
    "A negative net housing cost is a modeled surplus before owner income tax, not guaranteed free housing. Annualized figures multiply the snapshot by 12 rather than simulate first-year events.",
    "No appreciation, sale, opportunity cost, depreciation, personal/rental tax allocation or financing eligibility is assessed. Mortgage insurance is a manual assumption, with no automatic cancellation. Zoning, licensing and occupancy rules require separate checks."
  ]
},
 "drip":{
  "intro": "A dividend reinvestment plan (DRIP) uses dividend cash to buy more shares. This calculator compares reinvesting after-tax dividends with retaining them as cash, using identical starting assets and external monthly deposits. The comparison includes both shares and retained cash in the no-reinvestment path, rather than treating cash dividends as money that disappears.",
  "method": [
    "Starting annual dividend per share equals starting price multiplied by initial yield. Each payout uses that annual dividend per share, adjusted at model-year anniversaries, divided by payments per year and multiplied by the month’s opening shares.",
    "For example, 100 shares at $100 and a 4% annual starting yield pay $100 gross per quarter before dividend growth. At a 20% dividend tax assumption, $80 remains; with a $100 payout-date price, reinvestment buys 0.8 shares."
  ],
  "assumptions": [
    "Share-price appreciation excludes dividends; do not enter a total-return rate. Price growth and dividend-per-share growth are independent assumptions, so yield is not held constant.",
    "Fractional shares are supported. Dividend tax is deducted before reinvestment; external deposits buy shares afterward at month end. New shares do not receive that month’s payout. Retained cash earns no interest."
  ],
  "use": "Use this tool to explain payout frequency, contribution timing and dividend growth, or compare reinvestment with accumulating cash under consistent assumptions.",
  "limitations": [
    "Reinvestment can underperform retained cash when prices fall. Smooth prices do not simulate ex-dividend adjustments, market volatility or dividend cuts. The next-year run rate holds ending shares fixed and is not a promised payout.",
    "The flat dividend tax rate is a scenario, not a tax return or account eligibility check. Sale taxes, tax lots, fees, whole-share restrictions and inflation are excluded. Reinvested dividends are internal flows, not additional external contributions."
  ]
},
 "noi":{
  "intro": "Net operating income (NOI) measures property income after ordinary operating expenses and before financing. This calculator reconciles scheduled rent, vacancy, other operating income and itemized expenses using one consistent reporting period. It helps writers distinguish a property’s operations from the owner’s financing decisions, taxes and overall investment return.",
  "method": [
    "Effective operating income equals scheduled rent × (1 − vacancy and collection-loss rate) + other operating income. NOI equals that effective income minus operating expenses. Monthly entries are multiplied by 12 once for annual results.",
    "For example, $4,000 monthly scheduled rent with 5% vacancy, $100 other net income and $1,350 operating expenses gives $3,900 effective income and $2,550 monthly NOI, or $30,600 annually. A mortgage payment is not deducted in this calculation."
  ],
  "assumptions": [
    "Enter all amounts for the selected monthly or annual period. Changing the period reinterprets values rather than converting them. Other income should already reflect its own expected losses; vacancy reduces scheduled rent only.",
    "Operating expenses include property tax, insurance, management, ordinary maintenance and owner-paid utilities. Management is an entered dollar amount, not an automatically scaling percentage. Count costs once."
  ],
  "use": "Use this worksheet to explain the operating-income bridge before calculating a cap rate or cash flow after financing. Compare properties only with consistent expense definitions and reporting periods.",
  "limitations": [
    "Debt service, depreciation, owner income tax, capital improvements and replacement reserves are excluded. This is before-capex NOI, not spendable cash flow, a tax return or total ROI.",
    "Negative NOI is supported. Income-based ratios are undefined when effective income is zero. No appraisal, cap rate, lender-specific NOI adjustment or debt-service eligibility is inferred. Monthly equivalents divide annual totals by 12 rather than forecast seasonal collections."
  ]
},
 "rental-property":{
  "intro": "A rental property’s operating cash flow, equity and total profit answer different questions. This calculator projects rental operations, loan repayment and a sale over the selected holding period, with separate first-year cap rate and cash-on-cash measures. It brings those components together without treating appreciation, principal paydown or borrowed money as rental cash income.",
  "method": [
    "Initial cash equals purchase price minus the purchase loan, plus closing costs and initial repairs. For example, a $300,000 property financed with $225,000, plus $6,000 closing costs and $10,000 repairs, requires $91,000 initial cash.",
    "Each year, NOI equals rent after vacancy plus other income minus operating expenses. Subtract actual scheduled principal and interest for cash flow. At the holding-period end, net sale proceeds equal sale price after selling costs minus remaining debt. Total profit adds operating cash flows and net sale proceeds, then subtracts initial cash."
  ],
  "assumptions": [
    "Growth assumptions separately change rent, other income and entered expenses. Management fees apply to effective rent plus other income. Vacancy reduces rent only.",
    "The sale uses either an entered price or growth from the entered repaired value, falling back to purchase price. First-year cap rate uses that same repaired-value-or-price basis; loan payments stop at payoff."
  ],
  "use": "Use this model to reconcile cash funding, yearly cash flow and an assumed eventual sale. Explain first-year cash-on-cash separately from annual IRR and total profit.",
  "limitations": [
    "Annual IRR treats operating flows as year-end cash flows and adds sale proceeds to the final year. Nonstandard flows can have multiple or unavailable roots; a displayed IRR is not a guaranteed return.",
    "Income taxes, depreciation deductions and capital-gains tax are excluded. Include relevant cash expenses yourself; no separate automatic capital-reserve allowance is added. Growth, vacancy and sale values are scenarios rather than market forecasts."
  ]
},
 "discount-points":{
  "intro": "Mortgage discount points exchange upfront cash for a quoted interest rate. This calculator compares two same-principal, same-term fixed-rate offers, separating payment savings from borrowing-cost savings that also reflect remaining debt. The useful comparison depends on how long the borrower keeps the loan before selling or refinancing, not just the lower advertised rate.",
  "method": [
    "One point costs 1% of principal: on a $300,000 loan, one point is $3,000. Fractional points and negative points representing an entered lender credit are supported. A point does not imply a fixed rate reduction; enter both actual quoted rates.",
    "Additional upfront cost for offer B equals its points and other costs minus offer A’s. Net cash-flow savings compare cumulative payments less that extra upfront cost. Net borrowing-cost savings compare cumulative interest less the extra cost, equivalently adding the remaining-balance advantage to cash-flow savings."
  ],
  "assumptions": [
    "Both offers use identical loan principal and term. Points and other upfront costs are cash-funded, not added to the balance. Positive savings favor B; negative values favor A.",
    "The selected horizon is a whole number of months through the loan term. Zero months compares upfront costs only. Payments use the entered fixed rates and a capped final installment."
  ],
  "use": "Use this tool to explain why simple upfront-cost / monthly-payment-saving break-even can differ from the balance-aware result. Compare costs at the expected sale or refinance month.",
  "limitations": [
    "First break-even means the first nonnegative modeled comparison, not permanent advantage. A lender-credit offer can start ahead and become more expensive later.",
    "No tax deductions, opportunity cost, discounting, mortgage insurance or prepayment penalties are modeled. Common ownership costs are outside both offers. This is a quote comparison, not a recommendation to buy points or a guarantee about future refinancing."
  ]
},
 "rent-vs-buy":{
  "intro": "Rent-versus-buy decisions involve more than comparing rent with a mortgage payment. This calculator compares buyer equity after an assumed sale with a renter’s comparison portfolio and refundable deposit, showing annual checkpoints over 30 years. It accounts for initial cash differences, recurring housing costs and opportunity return under explicit assumptions.",
  "method": [
    "Initial buying cash is down payment plus purchase closing costs; initial renting cash is deposit plus nonrefundable rental costs. For example, a $400,000 home with 20% down and 3% purchase costs uses $92,000, versus $2,200 for a renter deposit with no other rental costs. The initial comparison portfolio difference is $89,800.",
    "The portfolio grows monthly at the effective annual investment return’s monthly equivalent, then adds buying outlay minus renting outlay. At each year end, buyer equity equals home value after selling costs minus remaining mortgage. Compare that equity with the portfolio plus the refundable deposit."
  ],
  "assumptions": [
    "Mortgage principal and interest, property tax, insurance, HOA and maintenance are separate from purchase and sale costs. Rent and ownership expenses follow the entered growth assumptions; returns and appreciation are scenarios.",
    "The optional tax benefit is a simplified annual calculation: mortgage interest plus property tax above the entered standard deduction, multiplied by the entered marginal rate. It is not a filing-status-aware tax return."
  ],
  "use": "Use annual checkpoints to explore how staying time, appreciation, rent growth and investment return affect the comparison. The first year buying leads need not remain favorable later.",
  "limitations": [
    "The model runs 30 years; negative portfolio balances are comparison arithmetic, not a modeled borrowing arrangement. Read the annual table rather than only the final wealth figures.",
    "SALT caps, mortgage deduction limits, capital-gains tax and phaseouts are excluded. Entered tax settings require review. Lifestyle preferences, liquidity needs, moving constraints and investment volatility are not valued."
  ]
},
 "roth-conversion-ladder":{
  "intro": "A Roth conversion ladder stages traditional IRA conversions for a later early-retirement bridge. This calculator separates regular Roth contribution basis, converted principal, account value and outside cash. Its limited model helps explain conversion timing and funding gaps; it is not a tax-bracket optimizer or a withdrawal instruction.",
  "method": [
    "For a calendar-year taxpayer, a conversion in year Y reaches its five-tax-year date on January 1, Y + 5. A 2027 conversion therefore reaches that date on January 1, 2032. This conversion clock is distinct from the qualified-distribution rules for Roth earnings.",
    "Each annual step converts at January 1, budgets tax from outside cash, funds living costs and then applies year-end growth. A $40,000 fully taxable conversion at an illustrative 20% flat tax assumption needs $8,000 tax cash; the gross $40,000 enters Roth."
  ],
  "assumptions": [
    "The model starts with one owner’s all-pre-tax traditional IRA, remaining regular Roth contribution basis and outside cash, without earlier conversion lots or initial Roth earnings.",
    "Living costs use regular basis, then seasoned conversion principal in year order, then outside cash. Roth withdrawals are capped by market value; unseasoned principal and earnings are not used to fill gaps."
  ],
  "use": "Use this bridge to illustrate each conversion’s separate clock and the need for cash to fund tax and spending before principal becomes available. Review the annual shortfall rows.",
  "limitations": [
    "The whole-year bridge ends by planning age 59, excluding the age-59½ transition. Clock completion does not make all earnings accessible or all distributions qualified.",
    "No pro-rata basis, inherited account, tax brackets, subsidy effects, workplace-plan eligibility or special early-distribution exceptions are modeled. Outside cash earns no interest. IRS Publication 590-B (2025) provides rule context; actual records and circumstances require separate review."
  ]
},
 "covered-call":{
  "intro": "A covered call combines shares with a short call, trading some upside potential for an option premium while retaining substantial stock downside. This calculator evaluates a new standard stock buy-write at expiry and compares it with holding the same shares alone. Premium received is cash inflow, not guaranteed profit.",
  "method": [
    "Each contract covers exactly 100 purchased shares. Net initial debit equals stock purchase cost plus stock and option opening fees minus premium. Expiry profit/loss equals shares × min(expiry price, strike) minus that debit and assumed exit costs.",
    "For example, buying 100 shares at $50 and selling one $55 call for $2 per share, with all fees set to zero, creates a $4,800 debit. Break-even is $48, maximum expiry profit is $700 and loss at a zero stock price is $4,800."
  ],
  "assumptions": [
    "Premium is per share, option opening fee is per contract, and stock purchase and exit fees are position totals. Returns use positive net initial debit, not broker margin or historical tax basis.",
    "Above strike the model assumes delivery at strike; below strike shares are marked to market, not automatically sold. At strike, assignment is uncertain. The same flat exit-cost allowance applies across outcomes."
  ],
  "use": "Use this payoff comparison to explain capped upside, fee-adjusted break-even and the difference from shares alone. Price scenarios show outcomes, not their probability.",
  "limitations": [
    "Early assignment can occur, including around dividends. The model does not price options, predict assignment or value an early close, roll or adjusted contract. Dividends, taxes, financing and unentered trading costs are excluded.",
    "The simple annualized maximum return multiplies one-trade return by 365 / days; it is not APY or repeatable income. Some fee/premium combinations have no profitable expiry price. A premium cushion does not remove the risk of a large stock loss."
  ]
}
};
