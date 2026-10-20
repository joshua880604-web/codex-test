import { tool } from "./helpers";
import {
  num,
  select,
  number as n,
  money,
  metric,
  type Values,
  type Mode,
  type Result,
} from "../types";
import { federalTax, type TaxInputs, type Filing } from "../tax";
import rules from "../official-rules.json";
const statuses = [
  "Single",
  "Married filing jointly",
  "Head of household",
  "Married filing separately",
];
export function filing(s: string): Filing {
  const i = statuses.indexOf(s);
  if (i < 0) throw new Error("Choose a filing status.");
  return (
    [
      "single",
      "married_joint",
      "head_household",
      "married_separate",
    ] as Filing[]
  )[i];
}
const fields = () => [
  select("year", "Tax year", ["2026", "2025"]),
  select("filing", "Filing status", statuses),
  num("wages", "Your annual wages", 80000, "$"),
  num("spouse_wages", "Spouse annual wages", 0, "$"),
  num("business", "Your net business income", 0, "$", -1e12),
  num("spouse_business", "Spouse net business income", 0, "$", -1e12),
  num("interest", "Taxable interest", 0, "$"),
  num("exempt_interest", "Tax-exempt interest", 0, "$"),
  num("dividends", "Nonqualified dividends", 0, "$"),
  num("qualified", "Qualified dividends", 0, "$"),
  num("short", "Net short-term capital gains", 0, "$", -1e12),
  num("long", "Net long-term capital gains", 0, "$", -1e12),
  num("social", "Social Security benefits", 0, "$"),
  num("other", "Other taxable income", 0, "$"),
  num("adjustments", "Eligible IRA and other above-line deductions", 0, "$"),
  num("student", "Student loan interest paid", 0, "$"),
  num("itemized", "Eligible itemized deductions excluding SALT", 0, "$"),
  num("salt", "State/local income and property taxes paid", 0, "$"),
  num("age65", "Eligible people age 65 or older", 0, "people"),
  num("tips", "Qualified reported tips", 0, "$"),
  num("overtime", "Qualified overtime premium", 0, "$"),
  num("car", "Qualified new-vehicle loan interest", 0, "$"),
  num("children", "Qualifying children under 17", 0, "people"),
  num("dependents", "Other qualifying dependents", 0, "people"),
  ...Array.from({ length: 4 }, (_, i) => [
    num(
      "education" + i,
      "Student " + (i + 1) + " eligible education expenses",
      0,
      "$",
    ),
    select("education_type" + i, "Student " + (i + 1) + " education credit", [
      "None",
      "American Opportunity",
      "Lifetime Learning",
    ]),
  ]).flat(),
  select(
    "aotc_refundable",
    "Eligible for refundable American Opportunity credit?",
    ["No", "Yes"],
  ),
  num("care", "Qualifying dependent care expenses", 0, "$"),
  num("care_people", "Qualifying people for dependent care", 0, "people"),
  num("credits", "Other eligible nonrefundable credits", 0, "$"),
  num("amt", "Other AMT adjustments", 0, "$"),
  select("qbi", "Apply simplified eligible QBI deduction?", ["No", "Yes"]),
  num(
    "withheld",
    "Federal income tax withheld / estimated payments",
    10000,
    "$",
  ),
];
const optionalNumber = (v: Values, key: string) => v[key] === undefined || v[key].trim() === "" ? 0 : n(v,key);
function inputs(v: Values): TaxInputs {
  const ordinaryIncludesQualified = v.dividend_definition === "Total ordinary includes qualified";
  if (ordinaryIncludesQualified && n(v,"qualified") > n(v,"dividends")) throw new Error("Qualified dividends cannot exceed total ordinary dividends.");
  return {
    year: Number(v.year) as 2025 | 2026,
    filing: filing(v.filing),
    wages: n(v, "wages"),
    spouseWages: n(v, "spouse_wages"),
    medicareWages: v.medicare_wages?.trim() ? n(v,"medicare_wages") : undefined,
    spouseMedicareWages: v.spouse_medicare_wages?.trim() ? n(v,"spouse_medicare_wages") : undefined,
    nonitemizerCashGifts: optionalNumber(v,"cash_gifts"),
    business: n(v, "business"),
    spouseBusiness: n(v, "spouse_business"),
    interest: n(v, "interest"),
    dividends: n(v, "dividends") - (ordinaryIncludesQualified ? n(v,"qualified") : 0),
    qualified: n(v, "qualified"),
    shortGains: n(v, "short"),
    longGains: n(v, "long"),
    socialSecurity: n(v, "social"),
    other: n(v, "other") + optionalNumber(v,"passive"),
    adjustments: n(v, "adjustments") + optionalNumber(v,"ira_deduction"),
    studentInterest: n(v, "student"),
    itemized: n(v, "itemized") + optionalNumber(v,"mortgage_interest") + optionalNumber(v,"eligible_itemized_charity"),
    salt: n(v, "salt") + optionalNumber(v,"property_tax") + optionalNumber(v,"state_withheld") + optionalNumber(v,"local_withheld") + optionalNumber(v,"spouse_state_withheld") + optionalNumber(v,"spouse_local_withheld"),
    age65: n(v, "age65"),
    tips: n(v, "tips"),
    overtime: n(v, "overtime"),
    carInterest: n(v, "car"),
    children: n(v, "children"),
    dependents: n(v, "dependents"),
    credits: n(v, "credits"),
    amtAdjustments: n(v, "amt"),
    qualifiedBusiness: v.qbi === "Yes",
    exemptInterest: n(v, "exempt_interest"),
    educationExpenses: Array.from({ length: 4 }, (_, i) =>
      n(v, "education" + i),
    ),
    educationTypes: Array.from(
      { length: 4 },
      (_, i) => v["education_type" + i],
    ),
    aotcRefundable: v.aotc_refundable === "Yes",
    careExpenses: n(v, "care"),
    carePeople: n(v, "care_people"),
  };
}
function validateTax(x: TaxInputs) {
  if (![2025, 2026].includes(x.year))
    throw new Error("Supported tax years are 2025 and 2026.");
  if (
    x.filing !== "married_joint" &&
    (x.spouseWages || x.spouseBusiness || (x.spouseMedicareWages ?? 0) || x.age65 > 1)
  )
    throw new Error(
      "Spouse income and two age-65 deductions require married filing jointly.",
    );
  if (
    x.age65 > 2 ||
    !Number.isInteger(x.age65) ||
    !Number.isInteger(x.children) ||
    !Number.isInteger(x.dependents)
  )
    throw new Error("Enter valid whole-number dependent and age counts.");
}
function taxResult(v: Values): Result {
  const x = inputs(v);
  validateTax(x);
  if(x.filing!=="married_joint" && ["spouse_withheld","spouse_estimated_paid","spouse_state_withheld","spouse_local_withheld"].some(key=>optionalNumber(v,key)>0))throw new Error("Spouse withholding and estimated payments require married filing jointly.");
  const t = federalTax(x),
    balance = n(v, "withheld") + optionalNumber(v,"spouse_withheld") + optionalNumber(v,"estimated_paid") + optionalNumber(v,"spouse_estimated_paid") - t.federal;
  return {
    metrics: [
      money("Estimated federal income tax", t.federal),
      money(
        balance >= 0 ? "Estimated refund" : "Estimated amount owed",
        Math.abs(balance),
      ),
      money("Adjusted gross income", t.agi),
      money("Taxable income", t.taxable),
      metric(
        "Effective federal tax rate",
        t.gross > 0 ? (t.federal / t.gross) * 100 : 0,
        "percent",
      ),
    ],
    columns: ["Calculation", "Amount"],
    rows: [
      ["Gross income including Social Security", t.gross],
      ["Taxable Social Security", t.taxableSS],
      ["Adjusted gross income", t.agi],
      ["Deduction used", t.deduction],
      ["Non-itemizer cash gift deduction", t.nonitemizerCashDeduction],
      ["Additional qualified deductions", t.extra],
      ["Eligible QBI deduction", t.qbi],
      ["Taxable income", t.taxable],
      ["Regular income tax", t.regular],
      ["Additional alternative minimum tax", t.amt],
      ["Eligible nonrefundable education credit", t.educationCredit],
      ["Eligible dependent-care credit", t.careCredit],
      ["Nonrefundable credits applied", t.credit],
      ["Refundable child credit", t.refundable],
      ["Self-employment tax", t.se],
      ["Additional Medicare tax", t.additional],
      ["Net investment income tax", t.niit],
      ["Employee Social Security", t.payrollSS],
      ["Employee Medicare", t.medicare],
    ],
    notes: [
      `Tax year ${x.year}; federal rules only. State and local income tax are not calculated as a tax return.`,
      `Sources: IRS annual inflation adjustments and Schedule 1-A; published 2026 rules reviewed October 19, 2026.`,
      `Eligibility for tips, overtime, vehicle interest, dependents, and entered deductions must be satisfied. Education credit type and refundable eligibility must be selected for each student. Dependent-care credit is limited by earned income and entered qualifying expenses. EITC, foreign-tax credits and other credits must be entered explicitly.`,
      `AMT includes standard/SALT add-back plus your supplied adjustments. QBI is an optional simplified calculation without wage/property or specified-service-business limitations.`,
    ],
  };
}
const income = tool(
  "income-tax",
  [
    {
      id: "federal",
      title: "Federal Income Tax",
      fields: [
        ...fields(),
        select("dividend_definition", "Dividends field means", ["Nonqualified only", "Total ordinary includes qualified"]),
        num("passive", "Rental, royalty and other passive income", 0, "$", -1e12),
        num("ira_deduction", "Eligible deductible IRA contributions not entered above", 0, "$"),
        num("mortgage_interest", "Eligible mortgage interest not entered above", 0, "$"),
        num("eligible_itemized_charity", "Eligible itemized charitable deduction not entered above", 0, "$"),
        num("property_tax", "Real estate taxes not included in SALT above", 0, "$"),
        num("state_withheld", "Your state income tax withheld not included in SALT above", 0, "$"),
        num("local_withheld", "Your local income tax withheld not included in SALT above", 0, "$"),
        num("spouse_state_withheld", "Spouse state income tax withheld not included above", 0, "$"),
        num("spouse_local_withheld", "Spouse local income tax withheld not included above", 0, "$"),
        num("spouse_withheld", "Additional spouse federal tax withheld", 0, "$"),
        num("estimated_paid", "Additional federal estimated tax payments", 0, "$"),
        num("spouse_estimated_paid", "Additional spouse federal estimated payments", 0, "$"),
        {...num("medicare_wages", "Your Medicare wages (W-2 box 5)", 0, "$"),value:"",optional:true,hint:"Leave blank to use your wages; enter 0 only if no Medicare wages."},
        {...num("spouse_medicare_wages", "Spouse Medicare wages (W-2 box 5)", 0, "$"),value:"",optional:true},
        {...num("cash_gifts", "Eligible non-itemizer cash gifts (2026)", 0, "$"),hint:"Qualified cash gifts only. Maximum deduction $1,000 ($2,000 married jointly), only when the standard deduction gives the larger total deduction. Do not duplicate an itemized gift."},
      ],
      description:
        "Estimate a 2025 or 2026 federal tax liability with ordinary income, capital gains, deductions, and credits.",
      formula:
        "Progressive ordinary tax + preferential capital-gains tax + applicable additional taxes − credits.",
      calculate: taxResult,
    },
  ],
  "Estimate federal income tax and withholding balance using explicit tax-year assumptions.",
);
const salary = tool(
  "salary",
  [
    {
      id: "conversion",
      title: "Salary Conversion",
      fields: [
        num("salary", "Salary amount", 30, "$"),
        select(
          "frequency",
          "Salary frequency",
          [
            "Hourly",
            "Daily",
            "Weekly",
            "Biweekly",
            "Semimonthly",
            "Monthly",
            "Quarterly",
            "Annually",
          ],
          "Hourly",
        ),
        num("hours", "Hours per week", 40, "hours", 0.1),
        num("days", "Days per week", 5, "days", 0.1),
        num("holidays", "Holidays per year", 10, "days"),
        num("vacation", "Vacation days per year", 15, "days"),
      ],
      description:
        "Convert salary frequencies and compare unadjusted with holiday/vacation-adjusted pay.",
      formula:
        "Annual pay = hourly rate × weekly hours × 52; adjusted annual pay subtracts unpaid days.",
      calculate: (v) => {
        const hours = n(v, "hours"),
          days = n(v, "days");
        if (days > 7) throw new Error("Workdays per week cannot exceed seven.");
        const annualFactors: Record<string, number> = {
            Hourly: hours * 52,
            Daily: days * 52,
            Weekly: 52,
            Biweekly: 26,
            Semimonthly: 24,
            Monthly: 12,
            Quarterly: 4,
            Semiannually: 2,
            Annually: 1,
          },
          inputAnnual = n(v, "salary") * annualFactors[v.frequency],
          off = n(v, "holidays") + n(v, "vacation");
        if (off > days * 52)
          throw new Error("Time off exceeds scheduled annual workdays.");
        const factor = (days * 52 - off) / (days * 52),
          unadjustedInput = ["Hourly", "Daily"].includes(v.frequency);
        if (!unadjustedInput && factor <= 0)
          throw new Error(
            "At least one working day is needed to convert an adjusted salary.",
          );
        const annual = unadjustedInput ? inputAnnual : inputAnnual / factor,
          adjusted = unadjustedInput ? inputAnnual * factor : inputAnnual,
          hourly = annual / (hours * 52);
        return {
          metrics: [
            money("Unadjusted annual salary", annual),
            money("Adjusted annual salary", adjusted),
            money("Unadjusted hourly rate", hourly),
          ],
          columns: ["Frequency", "Unadjusted", "Adjusted for time off"],
          rows: Object.entries(annualFactors).map(([key, factor]) => [
            key,
            annual / factor,
            adjusted / factor,
          ]),
          notes: [
            "Uses 52 weeks per year. Hourly and daily inputs are unadjusted; all other input frequencies are treated as already adjusted for the entered holidays and vacation days.",
          ],
        };
      },
    },
  ],
  "Convert hourly, daily, weekly, monthly, and annual pay with time-off assumptions.",
);
const personFields = () =>
  fields().filter(
    (f) =>
      ![
        "year",
        "filing",
        "withheld",
        "spouse_wages",
        "spouse_business",
      ].includes(f.key),
  );
const marriage = tool(
  "marriage-tax",
  [
    {
      id: "comparison",
      title: "Before vs. After Marriage",
      fields: [
        select("year", "Tax year", ["2026", "2025"]),
        select("filing1", "Your prior filing status", [
          "Single",
          "Head of household",
        ]),
        select("filing2", "Partner prior filing status", [
          "Single",
          "Head of household",
        ]),
        ...personFields().map((f) => ({ ...f, label: "You · " + f.label })),
        ...personFields().map((f) => ({
          ...f,
          key: "p2_" + f.key,
          label: "Partner · " + f.label,
          value: f.type === "select" ? f.value : 0,
        })),
      ],
      description:
        "Compare two unmarried federal returns with a combined married-joint return.",
      formula:
        "Marriage penalty = joint federal liability − sum of unmarried federal liabilities.",
      calculate: (v) => {
        const partner: Values = {
          year: v.year,
          filing: v.filing2,
          withheld: "0",
          spouse_wages: "0",
          spouse_business: "0",
        };
        for (const f of personFields()) partner[f.key] = v["p2_" + f.key];
        const a = inputs({
            ...v,
            filing: v.filing1,
            withheld: "0",
            spouse_wages: "0",
            spouse_business: "0",
          }),
          b = inputs(partner);
        validateTax(a);
        validateTax(b);
        const joint: TaxInputs = {
          ...a,
          filing: "married_joint",
          spouseWages: b.wages,
          spouseBusiness: b.business,
        };
        const additive: (keyof TaxInputs)[] = [
          "interest",
          "dividends",
          "qualified",
          "shortGains",
          "longGains",
          "socialSecurity",
          "other",
          "adjustments",
          "itemized",
          "salt",
          "age65",
          "tips",
          "overtime",
          "carInterest",
          "children",
          "dependents",
          "studentInterest",
          "amtAdjustments",
          "credits",
          "exemptInterest",
          "careExpenses",
          "carePeople",
        ];
        for (const key of additive)
          (joint as unknown as Record<string, unknown>)[key] =
            Number(a[key] ?? 0) + Number(b[key] ?? 0);
        joint.educationExpenses = [
          ...(a.educationExpenses ?? []),
          ...(b.educationExpenses ?? []),
        ];
        joint.educationTypes = [
          ...(a.educationTypes ?? []),
          ...(b.educationTypes ?? []),
        ];
        joint.aotcRefundable = a.aotcRefundable && b.aotcRefundable;
        const one = federalTax(a),
          two = federalTax(b),
          combined = federalTax(joint);
        return {
          metrics: [
            money("Your unmarried federal tax", one.federal),
            money("Partner unmarried federal tax", two.federal),
            money("Combined unmarried tax", one.federal + two.federal),
            money("Married filing jointly tax", combined.federal),
            money(
              "Marriage penalty / negative bonus",
              combined.federal - one.federal - two.federal,
            ),
          ],
          notes: [
            "Prior head-of-household status must satisfy eligibility rules. Married filing separately is not optimized. For the combined education-credit estimate, refundable AOTC is applied only if both partners select refundable eligibility.",
          ],
        };
      },
    },
  ],
  "Compare unmarried federal income taxes with married filing jointly.",
);
const estateAssets = [
  "Real estate",
  "Investments",
  "Cash",
  "Vehicles and personal property",
  "Retirement accounts",
  "Life insurance included in estate",
  "Other assets",
];
const estate = tool(
  "estate-tax",
  [
    {
      id: "federal",
      title: "Federal Estate Tax",
      fields: [
        ...estateAssets.map((label, i) =>
          num("asset" + i, label, i === 0 ? 10000000 : 0, "$"),
        ),
        num("debts", "Debts and mortgages", 0, "$"),
        num("administration", "Funeral, administration, and claims", 0, "$"),
        num("charity", "Charitable deductions", 0, "$"),
        num("marital", "Eligible marital deduction", 0, "$"),
        num("state", "State estate tax deduction", 0, "$"),
        num("gifts", "Adjusted taxable lifetime gifts", 0, "$"),
        num("gift_tax", "Gift tax previously payable", 0, "$"),
        num(
          "portability",
          "Deceased spouse unused exclusion (if valid)",
          0,
          "$",
        ),
      ],
      description:
        "Estimate federal estate tax with the 2026 basic exclusion and entered eligible deductions.",
      formula:
        "Unified estate/gift tax on adjusted taxable transfers minus applicable exclusion credit and prior gift tax.",
      calculate: (v) => {
        const gross = estateAssets.reduce(
            (a, _, i) => a + n(v, "asset" + i),
            0,
          ),
          deductions =
            n(v, "debts") +
            n(v, "administration") +
            n(v, "charity") +
            n(v, "marital") +
            n(v, "state"),
          taxable = Math.max(0, gross - deductions),
          exclusion = rules.estate.basic_exclusion + n(v, "portability"),
          tax = Math.max(
            0,
            (taxable + n(v, "gifts") - exclusion) * 0.4 - n(v, "gift_tax"),
          );
        return {
          metrics: [
            money("Gross estate", gross),
            money("Taxable estate", taxable),
            money("2026 applicable exclusion", exclusion),
            money("Estimated federal estate tax", tax),
          ],
          notes: [
            "Uses the 2026 $15 million basic exclusion. Portability, marital deduction, insurance inclusion, gifts and prior gift tax are entered explicitly. State estate-tax liability is not computed.",
          ],
        };
      },
    },
  ],
  "Estimate 2026 federal estate tax after eligible deductions and exclusion.",
);
const takehome = tool(
  "take-home-paycheck",
  [
    {
      id: "paycheck",
      title: "Take-Home Paycheck",
      fields: [
        ...fields().filter((f) => !["year", "withheld"].includes(f.key)),
        select(
          "frequency",
          "Pay frequency",
          ["Daily", "Weekly", "Biweekly", "Semimonthly", "Monthly", "Quarterly", "Semiannually", "Annually"],
          "Biweekly",
        ),
        num("pretax", "Annual pre-tax payroll deductions", 5000, "$"),
        num("aftertax", "Annual after-tax payroll deductions", 0, "$"),
        num("state_rate", "Effective state income tax rate", 5, "%"),
        num("local_rate", "Effective local income tax rate", 0, "%"),
        num("extra_withheld", "Additional withholding each paycheck", 0, "$"),
      ],
      description:
        "Estimate net pay after federal income tax, payroll taxes, and selected deductions.",
      formula:
        "Net pay = gross wages − pre-tax deductions − estimated taxes − after-tax deductions.",
      calculate: (v) => {
        const base = inputs({ ...v, year: "2026", withheld: "0" });
        validateTax(base);
        const pretax = n(v, "pretax");
        if (pretax > base.wages)
          throw new Error("Pre-tax deductions cannot exceed your wages.");
        const t = federalTax({ ...base, wages: base.wages - pretax }),
          payroll = federalTax(base),
          f: Record<string, number> = {
            Daily: 260,
            Weekly: 52,
            Biweekly: 26,
            Semimonthly: 24,
            Monthly: 12,
            Quarterly: 4,
            Semiannually: 2,
            Annually: 1,
          },
          periods = f[v.frequency],
          state =
            ((base.wages + base.spouseWages - pretax) * n(v, "state_rate")) /
            100,
          local =
            ((base.wages + base.spouseWages - pretax) * n(v, "local_rate")) /
            100,
          gross = base.wages + base.spouseWages,
          incomeAndAdditionalTax =
            t.federal - t.additional + payroll.additional,
          net =
            gross -
            pretax -
            n(v, "aftertax") -
            incomeAndAdditionalTax -
            payroll.payrollSS -
            payroll.medicare -
            state -
            local,
          per = net / periods - n(v, "extra_withheld");
        return {
          metrics: [
            money("Take-home pay per period", per),
            money("Annual take-home pay", per * periods),
            money("Gross pay per period", gross / periods),
          ],
          columns: ["Deduction", "Annual", "Per paycheck"],
          rows: [
            [
              "Federal income and additional taxes",
              incomeAndAdditionalTax,
              incomeAndAdditionalTax / periods,
            ],
            ["Social Security", payroll.payrollSS, payroll.payrollSS / periods],
            ["Medicare", payroll.medicare, payroll.medicare / periods],
            ["State income tax", state, state / periods],
            ["Local income tax", local, local / periods],
            ["Pre-tax deductions", pretax, pretax / periods],
            [
              "After-tax deductions",
              n(v, "aftertax"),
              n(v, "aftertax") / periods,
            ],
            [
              "Additional withholding",
              n(v, "extra_withheld") * periods,
              n(v, "extra_withheld"),
            ],
          ],
          notes: [
            "Pre-tax deductions are modeled as reducing federal taxable wages but not FICA wages (for example traditional 401(k), not a cafeteria plan). This allocates estimated annual liability evenly; it is not the IRS Publication 15-T payroll withholding algorithm. State/local rates are effective-rate assumptions.",
          ],
        };
      },
    },
  ],
  "Estimate take-home pay using federal, payroll, and explicit state/local tax assumptions.",
);
const sourcePaycheck: Mode = {
  id: "source-paycheck",
  title: "Paycheck Estimate",
  fields: [
    num("salary", "Your job income", 80000, "$ / year"),
    select("pay_frequency", "Pay frequency", ["Daily", "Weekly", "Biweekly", "Semimonthly", "Monthly", "Quarterly", "Semiannually", "Annually"], "Biweekly"),
    select("file_status", "Filing status", statuses),
    num("children", "Qualifying children under 17", 0, "people"),
    num("dependents", "Other qualifying dependents", 0, "people"),
    num("other_income", "Other income (not from jobs)", 0, "$ / year"),
    num("pretax", "Pre-tax payroll deductions withheld", 5000, "$ / year"),
    num("deductions", "Eligible deductions not withheld", 0, "$ / year"),
    num("itemized", "Eligible itemized deductions", 0, "$ / year"),
    select("multiple_jobs", "Other jobs or spouse has job income?", ["No", "Yes"]),
    num("job2", "Other job income 2", 0, "$ / year"),
    num("job3", "Other job income 3", 0, "$ / year"),
    num("state_rate", "Effective state income tax rate", 5, "%"),
    num("local_rate", "Effective city income tax rate", 0, "%"),
    select("senior", "Are you age 65 or older?", ["No", "Yes"]),
    select("spouse_senior", "Is your spouse age 65 or older?", ["No", "Yes"]),
    num("tips", "Qualified reported tips", 0, "$ / year"),
    num("overtime", "Qualified overtime premium", 0, "$ / year"),
    num("car", "Qualified new-vehicle loan interest", 0, "$ / year"),
    num("cash_gifts", "Eligible non-itemizer cash gifts", 0, "$ / year"),
    select("self_employed", "Is this job self-employment?", ["No", "Yes"]),
  ],
  description: "Estimate take-home pay for this job using annual income, selected deductions, other jobs and 2026 federal rules.",
  formula: "This-job net = this-job gross − withheld deductions − allocated annual federal tax − this-job payroll taxes − entered state/city tax. Other job wages affect brackets but are not included in this paycheck.",
  calculate: v => {
    const gross=n(v,"salary"), pretax=n(v,"pretax"), joint=filing(v.file_status)==="married_joint";
    if(pretax>gross)throw new Error("Pre-tax deductions cannot exceed this job’s income.");
    if(v.spouse_senior==="Yes"&&!joint)throw new Error("Spouse age-65 selection requires married filing jointly.");
    if(v.multiple_jobs==="No"&&(n(v,"job2")||n(v,"job3")))throw new Error("Select Yes for other jobs or clear their income amounts.");
    const otherJobs=v.multiple_jobs==="Yes"?n(v,"job2")+n(v,"job3"):0, self=v.self_employed==="Yes";
    const baseValues=Object.fromEntries(fields().map(f=>[f.key,String(f.value)]));
    const x=inputs({...baseValues,year:"2026",filing:v.file_status,wages:String(self?otherJobs:Math.max(0,gross-pretax)+otherJobs),spouse_wages:"0",business:String(self?gross:0),children:v.children,dependents:v.dependents,other:v.other_income,adjustments:String(n(v,"deductions")+(self?pretax:0)),itemized:v.itemized,age65:String(Number(v.senior==="Yes")+Number(v.spouse_senior==="Yes")),tips:v.tips,overtime:v.overtime,car:v.car,cash_gifts:v.cash_gifts});
    x.medicareWages=self?otherJobs:gross+otherJobs;
    const tax=federalTax(x), baseline=otherJobs>0?federalTax({...x,wages:otherJobs,medicareWages:otherJobs,business:0,adjustments:n(v,"deductions"),tips:0,overtime:0,carInterest:0}):null;
    const allocated=baseline?Math.max(0,tax.federal-baseline.federal):tax.federal;
    const periods:Record<string,number>={Daily:260,Weekly:52,Biweekly:26,Semimonthly:24,Monthly:12,Quarterly:4,Semiannually:2,Annually:1};
    const ss=self?0:Math.min(gross,184500)*.062, medicare=self?0:gross*.0145;
    const state=(gross-pretax)*pctTax(v,"state_rate"), local=(gross-pretax)*pctTax(v,"local_rate");
    const net=gross-pretax-allocated-ss-medicare-state-local, count=periods[v.pay_frequency];
    return {metrics:[money("Take-home pay per period",net/count),money("Annual take-home pay",net),money("Gross pay per period",gross/count),money("Annual federal tax allocated to this job",allocated)],
      columns:["Deduction","Annual","Per paycheck"],rows:[["Allocated federal income and additional taxes",allocated,allocated/count],["Employee Social Security",ss,ss/count],["Employee Medicare",medicare,medicare/count],["Pre-tax payroll deductions",pretax,pretax/count],["State income tax",state,state/count],["City income tax",local,local/count]],
      notes:["Independent annual-tax allocation model. For multiple jobs, this job is assigned the incremental household federal tax above the entered other-job baseline; other-job wages are excluded from this paycheck. This is not an IRS Publication 15-T payroll withholding worksheet or an exact replica of the original site's unknown allocation policy.","Other-job amounts are treated as one taxpayer’s wages for this simplified allocation, not separate spouses’ payroll accounts. Pre-tax deductions reduce federal taxable income but not employee FICA wages. State/city rates are explicit effective assumptions; non-job income affects federal tax but is not paid in this paycheck. Daily pay assumes 260 working days.","For self-employment, pre-tax retirement deductions reduce income-taxable income but not the net profit used for self-employment tax. The federal estimate includes self-employment tax; employee Social Security and Medicare rows are zero to avoid counting those taxes twice. Eligible non-itemizer cash gifts use the 2026 $1,000/$2,000 cap when the standard deduction is selected; enter already eligible amounts and check organization eligibility."]};
  },
};
function pctTax(v: Values,key:string){return n(v,key)/100;}
takehome.modes.unshift(sourcePaycheck);

export const taxCalculators = [income, salary, marriage, estate, takehome];
