import extendedGuides from "./extended-guides.json";
export type WorkedExample = {
  title: string;
  mode: string;
  values: Record<string, string | number>;
  inputs: string;
  steps: string[];
  answer: string;
  expected: { label: string; value: number; tolerance?: number };
};
export type Guide = {
  checkedOn?: string;
  summary: string;
  scope: string;
  examples: WorkedExample[];
  questions: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
};
const investor = {
  title: "SEC Investor.gov: compound interest calculator and input definitions",
  url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
};
const amortization = {
  title: "CFPB: how amortization allocates principal and interest",
  url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/",
};
const mortgageSource = {
  title: "CFPB: how paying down a mortgage works",
  url: "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
};
export const notesCheckedOn = "2026-10-19";
export const guides: Record<string, Guide> = {
  ...(extendedGuides as unknown as Record<string, Guide>),
  vat: {
    summary:
      "VAT is calculated on the net price. Add VAT by multiplying the net price by 1 + rate/100. Remove VAT by dividing the gross price by the same factor.",
    scope:
      "Enter the applicable rate yourself. This tool solves one nonnegative price/rate relationship; it does not determine country-specific eligibility, exemptions or invoice-level rounding. Currency labels do not select a tax jurisdiction.",
    examples: [
      {
        title: "Add 20% VAT to a net price of 100",
        mode: "any-two",
        values: { rate: 20, net: 100, gross: "", tax: "" },
        inputs:
          "Net price 100; VAT rate 20%; leave gross price and tax amount blank.",
        steps: ["Tax = 100 × 20 / 100 = 20.", "Gross = 100 + 20 = 120."],
        answer: "The tax is 20 and the gross price is 120.",
        expected: { label: "Gross amount", value: 120 },
      },
      {
        title: "Remove 20% VAT from a gross price of 120",
        mode: "any-two",
        values: { rate: 20, net: "", gross: 120, tax: "" },
        inputs:
          "Gross price 120; VAT rate 20%; leave net price and tax amount blank.",
        steps: ["Net = 120 ÷ 1.20 = 100.", "Tax = 120 − 100 = 20."],
        answer:
          "The net price is 100. Subtracting 20% of 120 would give 96, which uses the wrong tax base.",
        expected: { label: "Net amount", value: 100 },
      },
      {
        title: "Find the rate from a gross price and tax amount",
        mode: "any-two",
        values: { rate: "", net: "", gross: 120, tax: 20 },
        inputs:
          "Gross price 120; tax amount 20; leave rate and net price blank.",
        steps: ["Net = 120 − 20 = 100.", "Rate = 20 ÷ 100 × 100 = 20%."],
        answer: "The implied VAT rate is 20%.",
        expected: { label: "VAT rate", value: 20 },
      },
    ],
    questions: [
      {
        question: "Which two fields can I enter?",
        answer:
          "Any pair of VAT rate, net price, gross price and tax amount. Leave the other two blank. All six combinations are supported when they determine a unique nonnegative answer.",
      },
      {
        question: "Can I use a zero VAT rate?",
        answer:
          "Yes. A zero rate and a known net or gross price determine zero tax. A zero rate and zero tax alone do not determine a price, so the calculator asks for a different pair.",
      },
      {
        question: "Why are some inputs rejected?",
        answer:
          "Gross price cannot be below net price for this nonnegative VAT model. Tax cannot exceed gross price. Two zero amounts without a known rate do not determine a unique rate. Clear empties all four fields.",
      },
    ],
    sources: [
      {
        title:
          "GOV.UK: VAT rates, including standard, reduced and zero-rated examples",
        url: "https://www.gov.uk/vat-rates",
      },
    ],
  },
  loan: {
    summary:
      "An amortizing loan has a regular payment that covers interest on the outstanding balance and repays principal. The payment depends on the amount borrowed, periodic rate and number of payments.",
    scope:
      "The amortized-loan example excludes fees, insurance and extra payments. Select matching payment and compounding frequencies; a quoted interest rate is not necessarily an all-in APR.",
    examples: [
      {
        title: "A 100,000 loan at 6% over 30 years",
        mode: "amortized",
        values: {
          principal: 100000,
          years: 30,
          months: 0,
          rate: 6,
          compound: "Monthly",
          pay: "Monthly",
        },
        inputs:
          "Principal $100,000; 30 years; 6% nominal annual rate; monthly compounding and payments.",
        steps: [
          "Monthly rate = 0.06 ÷ 12 = 0.005.",
          "Number of payments = 30 × 12 = 360.",
          "Payment = 100000 × 0.005 ÷ (1 − 1.005^(−360)).",
        ],
        answer:
          "The regular monthly payment is $599.55 before fees or insurance.",
        expected: { label: "Payment per period", value: 599.5505251527524 },
      },
    ],
    questions: [
      {
        question: "What happens at zero interest?",
        answer:
          "Without interest or fees, each regular payment is principal divided by the number of payments. A $12,000 loan over 12 monthly payments is $1,000 per month.",
      },
      {
        question: "Why is the final payment sometimes smaller?",
        answer:
          "The schedule caps the last payment at the outstanding principal plus that period’s interest, including when extra payments shorten the loan.",
      },
    ],
    sources: [amortization],
  },
  mortgage: {
    summary:
      "A mortgage payment can include principal and interest plus property taxes, insurance and other ownership costs. The principal-and-interest amount alone is not the total monthly housing cost.",
    scope:
      "This example isolates principal and interest. Actual escrow, PMI/MIP, fees and cancellation rules depend on the selected assumptions and loan program. It is a planning estimate rather than a lender quote.",
    examples: [
      {
        title: "Separate loan payment from ownership costs",
        mode: "monthly",
        values: {
          price: 125000,
          down: 20,
          down_unit: "Percent",
          years: 30,
          months: 0,
          rate: 6,
          tax: 0,
          insurance: 0,
          pmi: 0,
          hoa: 0,
          other: 0,
          extra_monthly: 0,
          extra_yearly: 0,
          extra_once: 0,
        },
        inputs:
          "Home price $125,000; 20% down; 30 years; 6% annual rate; all entered ownership costs and extra payments set to zero.",
        steps: [
          "Down payment = 125000 × 20% = 25000.",
          "Loan principal = 125000 − 25000 = 100000.",
          "At 6% nominal annual interest and 360 monthly payments, principal and interest is $599.55.",
        ],
        answer:
          "Monthly principal and interest is $599.55. Add the property’s actual taxes, insurance and fees to estimate total housing cash flow.",
        expected: {
          label: "Monthly principal & interest",
          value: 599.5505251527524,
        },
      },
    ],
    questions: [
      {
        question: "Does a larger down payment reduce the loan?",
        answer:
          "Yes. Holding the home price and other financing inputs constant, a larger down payment lowers the amount financed. It can also affect mortgage insurance eligibility.",
      },
      {
        question: "Are loan-year tables calendar-year tax records?",
        answer:
          "No. The yearly summary groups payments from the start of the loan and preserves each group’s closing balance. It is not a calendar-year tax statement.",
      },
    ],
    sources: [mortgageSource],
  },
  interest: {
    summary:
      "Compound growth earns interest on both the original amount and accumulated interest. Contribution timing, compounding frequency, tax and inflation can change the projected ending balance.",
    scope:
      "Returns are assumed constant. Positive interest is taxed using the entered planning rate; historical volatility, investment-specific tax rules and transaction fees are not inferred.",
    examples: [
      {
        title: "Grow 1,000 at 5% with no additions",
        mode: "accumulation",
        values: {
          principal: 1000,
          years: 10,
          months: 0,
          rate: 5,
          compound: "Annually",
          annual: 0,
          monthly: 0,
          tax: 0,
          inflation: 0,
        },
        inputs:
          "Starting amount $1,000; 5% annually compounded; 10 years; no deposits, taxes or inflation.",
        steps: [
          "Growth factor = 1.05^10.",
          "Ending balance = 1000 × 1.05^10 = 1628.8946…",
        ],
        answer: "The ending balance is $1,628.89; earnings are $628.89.",
        expected: { label: "Ending balance", value: 1628.8946267774414 },
      },
    ],
    questions: [
      {
        question: "Are nominal and effective annual rates the same?",
        answer:
          "They coincide with annual compounding. With more frequent compounding, a nominal annual rate generally produces a different effective annual yield.",
      },
      {
        question: "Do contributions at the beginning earn more interest?",
        answer:
          "At a positive return, a beginning-of-period contribution earns one more period of interest than the same contribution at period end.",
      },
    ],
    sources: [investor],
  },
  "compound-interest": {
    checkedOn: "2026-10-20",
    summary:
      "Use the compound interest calculator with monthly contributions to project a savings balance, total contributions and net earnings. The separate Equivalent Interest Rate mode preserves effective yield when converting quoted rates.",
    scope:
      "Growth uses a constant nominal annual rate and its selected compounding equivalent; monthly and annual contributions are distinct cash streams. Tax and inflation adjustments are simplified. The conversion mode instead changes the nominal rate to preserve effective yield. Neither mode guarantees returns.",
    examples: [
      {
        title: "Convert 5% nominal monthly compounding to an annual rate",
        mode: "conversion",
        values: { rate: 5, from: "Monthly", to: "Annually" },
        inputs:
          "Input interest rate 5%; input compounding Monthly; output compounding Annually.",
        steps: [
          "Monthly periodic rate = 0.05 ÷ 12.",
          "Effective annual yield = (1 + 0.05/12)^12 − 1.",
        ],
        answer:
          "The equivalent annually compounded rate is approximately 5.1162%.",
        expected: {
          label: "Equivalent interest rate",
          value: 5.1161897881733,
          tolerance: 0.000001,
        },
      },
    ],
    questions: [
      {
        question: "Where can I calculate compound growth with deposits?",
        answer:
          "Use Compound Growth on this page for starting money, monthly or annual contributions and a time horizon. Contribution timing controls whether deposits earn during their first period.",
      },
      {
        question: "Does changing the frequency create extra return here?",
        answer:
          "In Equivalent Interest Rate mode, the quoted rate changes to preserve yield. In Compound Growth mode, changing compounding while holding the nominal rate fixed can change growth. These are different questions.",
      },
    ],
    sources: [investor],
  },
  retirement: {
    summary:
      "A retirement savings plan depends on the target balance, current savings, time to retirement and assumed return. Monthly deposits and a single year-end deposit are different funding schedules.",
    scope:
      "The saving-plan example uses an effective annual return and end-of-month deposits. Future returns are uncertain; the selected model’s inflation and withdrawal timing are stated separately.",
    examples: [
      {
        title: "Save from age 35 to 67 toward 600,000",
        mode: "saving",
        values: {
          age: 35,
          retire: 67,
          target: 600000,
          balance: 30000,
          return: 6,
        },
        inputs:
          "Age 35; retirement age 67; target $600,000; current savings $30,000; effective annual return 6%.",
        steps: [
          "Saving horizon = 32 years = 384 monthly deposits.",
          "Convert the 6% effective annual return to a monthly rate: 1.06^(1/12) − 1.",
          "Current savings grow to $193,601.60. End-of-month deposits fund the remaining target.",
        ],
        answer:
          "Required monthly saving is $362.74. Twelve monthly deposits total $4,352.89 per year; the alternative single year-end deposit is $4,471.33.",
        expected: {
          label: "Required monthly saving",
          value: 362.7406004461587,
        },
      },
    ],
    questions: [
      {
        question: "Should I pay both the monthly and annual plan?",
        answer:
          "No. The monthly plan and single year-end annual deposit are alternatives. The annual total of monthly savings merely adds twelve monthly payments.",
      },
      {
        question: "What does an inflation-adjusted balance mean?",
        answer:
          "It expresses a future nominal amount in the purchasing power of the reference date, using the entered constant inflation assumption.",
      },
    ],
    sources: [investor],
  },
  "401k": {
    summary:
      "The 401(k) projection iterates one year at a time: apply annual return to the opening balance, add employee and employer contributions at year end, then increase salary for the next year.",
    scope:
      "Future years use fixed 2026 employee limits with age-based catch-up. The model does not apply the complete combined employer/employee cap, project future legislative changes or model distributions after retirement. Life expectancy does not affect this accumulation projection.",
    examples: [
      {
        title: "Understand the first year of a 401(k) projection",
        mode: "projection",
        values: {
          age: 35,
          retire: 36,
          life: 90,
          salary: 80000,
          balance: 100000,
          contribution: 10,
          match: 50,
          match_limit: 3,
          salary_growth: 3,
          return: 6,
          inflation: 3,
        },
        inputs:
          "Starting balance $100,000; salary $80,000; employee contribution 10%; employer matches 50% of contributions up to 3% of salary; annual return 6%.",
        steps: [
          "Employee contribution = 80000 × 10% = 8000.",
          "Employer contribution = min(8000, 80000 × 3%) × 50% = 1200.",
          "Year-end balance = 100000 × 1.06 + 8000 + 1200 = 115200.",
        ],
        answer:
          "The first year ends with $115,200. The employee contribution is $8,000 and the employer contribution is $1,200.",
        expected: { label: "Projected 401(k) balance", value: 115200 },
      },
    ],
    questions: [
      {
        question: "What is Employee contributions + current balance?",
        answer:
          "It is the entered starting balance plus future annually calculated employee contributions. Future employer contributions and future investment returns are excluded. The starting balance itself may already contain earlier employer money and returns.",
      },
      {
        question: "Does a 50% match with a 3% limit mean the employer pays 3%?",
        answer:
          "No. In this model the employer matches half of eligible employee contributions up to 3% of salary, so the maximum match is 1.5% of salary before other plan limits.",
      },
    ],
    sources: [
      {
        title:
          "IRS: 2026 retirement contribution limits and age-based catch-up",
        url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
      },
    ],
  },
  "income-tax": {
    summary:
      "A federal income tax estimate starts with income, subtracts applicable deductions and applies the selected year’s ordinary and preferential tax rules and entered credits.",
    scope:
      "Supports selected 2025/2026 federal rules under the inputs shown. It is not a complete tax return or state/local tax engine. QBI, AMT, credit eligibility, separate-return elections and special income require the stated assumptions to be checked.",
    examples: [
      {
        title: "A basic 2026 single wage-earner estimate",
        mode: "federal",
        values: { year: "2026", filing: "Single", wages: 80000 },
        inputs:
          "2026; Single; $80,000 wages; no additional income, deductions or credits; under age 65.",
        steps: [
          "Standard deduction = 16100; taxable income = 80000 − 16100 = 63900.",
          "Tax = 12400 × 10% + (50400 − 12400) × 12% + (63900 − 50400) × 22%.",
        ],
        answer:
          "Estimated federal income tax is $8,770. Employee Social Security and Medicare are separate payroll taxes.",
        expected: { label: "Estimated federal income tax", value: 8770 },
      },
    ],
    questions: [
      {
        question: "Is my marginal rate applied to all income?",
        answer:
          "No. Under progressive ordinary brackets, each slice of taxable income is taxed at its bracket’s rate. Preferential income and credits can change the calculation.",
      },
      {
        question: "Is annual tax the same as paycheck withholding?",
        answer:
          "No. Tax liability estimates what is owed for the year; withholding is money paid during the year and depends on payroll rules and elections.",
      },
    ],
    sources: [
      {
        title:
          "IRS: Revenue Procedure 2025-32 and 2026 inflation-adjusted tax parameters",
        url: "https://www.irs.gov/irb/2025-45_IRB",
      },
      {
        title: "IRS: Schedule 1-A qualified deductions",
        url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf",
      },
    ],
  },
  rmd: {
    summary:
      "An owner-account RMD generally divides the previous December 31 balance by the applicable IRS distribution period. The selected table depends on account and beneficiary circumstances.",
    scope:
      "This implementation supports owner accounts and current life-expectancy tables for distribution years 2022 onward. Inherited-account rules, employer still-working exceptions and all deadline choices are not modeled. The joint table requires a qualifying sole-beneficiary spouse more than ten years younger.",
    examples: [
      {
        title: "Uniform Lifetime Table example at age 75",
        mode: "annual",
        values: {
          birth: 1951,
          year: 2026,
          balance: 500000,
          spouse: "No",
          return: 5,
          projection: 1,
        },
        inputs:
          "Born 1951; distribution year 2026; prior December 31 balance $500,000; Uniform Lifetime Table.",
        steps: [
          "Age in the distribution year = 2026 − 1951 = 75.",
          "Uniform Lifetime Table divisor at age 75 = 24.6.",
          "RMD = 500000 ÷ 24.6.",
        ],
        answer: "The annual RMD is $20,325.20 under this table selection.",
        expected: { label: "Annual RMD", value: 20325.20325203252 },
      },
    ],
    questions: [
      {
        question: "Does the current year’s return change this year’s RMD?",
        answer:
          "The selected year’s owner-account RMD uses the prior year-end balance. The return assumption affects projected future balances under this model’s year-end withdrawal timing.",
      },
      {
        question: "Why are years before 2022 rejected?",
        answer:
          "The implemented IRS life-expectancy factors became effective in 2022. Earlier distribution years need historical tables and potentially relief rules.",
      },
    ],
    sources: [
      {
        title:
          "IRS Publication 590-B: distribution tables and owner-account rules",
        url: "https://www.irs.gov/publications/p590b",
      },
    ],
  },
  irr: {
    checkedOn: "2026-10-20",
    summary:
      "The internal rate of return is a discount rate that makes the net present value of the entered cash flows zero. Cash-flow timing matters, so equal total profits can produce different IRRs.",
    scope:
      "The unequal-flow form uses successive year ends, not arbitrary dates. Fixed-flow rates are converted to effective annual rates from the selected payment period. The numerical search is bounded, and nearly repeated roots are sensitive to rounding; detected roots do not guarantee every root was found.",
    examples: [
      {
        title: "A 40,000 investment with three annual inflows",
        mode: "irregular",
        values: { initial: 40000, flows: "10000, 20000, 30000" },
        inputs:
          "Initial investment $40,000; year-end inflows $10,000, $20,000 and $30,000.",
        steps: [
          "Solve −40000 + 10000/(1+r) + 20000/(1+r)^2 + 30000/(1+r)^3 = 0.",
        ],
        answer: "The detected annual IRR is approximately 19.438%.",
        expected: { label: "Annual IRR 1", value: 19.438, tolerance: 0.0005 },
      },
    ],
    questions: [
      {
        question: "Can an investment have more than one IRR?",
        answer:
          "Yes. Cash flows that change sign more than once can produce multiple solutions. Examine the cash flows and NPV rather than treating a single rate as a complete investment recommendation.",
      },
      {
        question: "Does IRR include risk?",
        answer:
          "No. It summarizes the cash-flow pattern entered. It does not establish that forecast cash flows are reliable or account for risk by itself.",
      },
    ],
    sources: [
      {
        title:
          "Calculator.net: IRR definition and the worked machine-investment example",
        url: "https://www.calculator.net/irr-calculator.html",
      },
    ],
  },
};

guides.irr.examples.push({title:"Monthly cash-flow periods, annual IRR",mode:"fixed",values:{initial:100,years:1,inflow:0,cash_frequency:"Monthly",ending:121,timing:"End of period"},inputs:"Invest 100 USD at time zero, receive 121 at the end of one year, and use twelve monthly periods with no interim flows.",steps:["The monthly rate solves 100 × (1+r)^12 = 121.","Effective annual IRR = (1+r)^12 − 1 = 121/100 − 1 = 21%."],answer:"Annual IRR is 21%; this is not a 21% monthly return.",expected:{label:"Annual IRR 1",value:21,tolerance:0.00005}},{title:"A cash-flow pattern with two IRRs",mode:"irregular",values:{initial:100,flows:"230, -132"},inputs:"Initial outflow 100 USD, year-one inflow 230, year-two outflow 132.",steps:["NPV = −100 + 230/(1+r) − 132/(1+r)^2.","At 10%: −100 + 230/1.1 − 132/1.1² = 0.","At 20% the same NPV is also zero; neither root alone is an unambiguous investment ranking."],answer:"The calculator detects annual IRRs of 10% and 20%.",expected:{label:"Annual IRR 1",value:10,tolerance:0.00005}});
guides.irr.questions.push({question:"Is this IRR result annual or monthly?",answer:"Headline results are effective annual rates. Monthly or quarterly fixed cash flows are first solved per period and then compounded to an annual rate, not multiplied by the number of periods."},{question:"Can I enter cash flows on irregular dates?",answer:"This page assumes equally spaced periods. For dated cash flows, use the dated cash-flow mode of Average Return Calculator. Keep zero entries for empty years in the unequal annual form."});
guides.irr.sources.push({title:"Dated cash-flow return calculator",url:"/average-return-calculator.html?mode=cashflows"});

const compoundMonthlyRate = 0.05/12;
const compoundMonthFactor = (1+compoundMonthlyRate)**12;
guides["compound-interest"].examples.push({
  title:"Compound growth with monthly contributions", mode:"growth",
  values:{principal:1000,years:1,months:0,rate:5,compound:"Monthly",annual:0,monthly:100,timing:"End of period",tax:0,inflation:0},
  inputs:"Start with 1,000 USD; deposit 100 at each month end for one year; 5% nominal annual rate compounded monthly; no tax or inflation adjustment.",
  steps:["Monthly rate is 0.05 / 12.","Ending balance = 1,000 × (1+0.05/12)^12 + 100 × ((1+0.05/12)^12 − 1)/(0.05/12)."],
  answer:"Ending balance is approximately 2,279.05 USD; total contributions are 2,200 USD.",
  expected:{label:"Ending balance",value:1000*compoundMonthFactor+100*(compoundMonthFactor-1)/compoundMonthlyRate,tolerance:0.005},
});

export const relatedCalculatorIds: Record<string, string[]> = {
  vat: ["sales-tax", "discount", "margin", "commission"],
  mortgage: [
    "amortization",
    "mortgage-payoff",
    "house-affordability",
    "refinance",
    "apr",
    "rent-vs-buy",
  ],
  loan: ["payment", "repayment", "interest-rate", "apr", "debt-consolidation"],
  interest: [
    "compound-interest",
    "savings",
    "investment",
    "future-value",
    "present-value",
  ],
  "compound-interest": [
    "interest",
    "savings",
    "investment",
    "future-value",
    "simple-interest",
  ],
  retirement: [
    "401k",
    "ira",
    "roth-ira",
    "annuity-payout",
    "social-security",
    "rmd",
  ],
  "401k": ["retirement", "ira", "roth-ira", "income-tax", "rmd"],
  "income-tax": [
    "take-home-paycheck",
    "salary",
    "marriage-tax",
    "estate-tax",
    "401k",
  ],
  rmd: ["ira", "roth-ira", "401k", "retirement", "annuity-payout"],
  irr: ["roi", "payback-period", "average-return", "investment"],
};
