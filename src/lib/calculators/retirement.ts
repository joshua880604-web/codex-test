import jointTable from "../joint-rmd-table.json";
import { tool, timingField } from "./helpers";
import {
  num,
  select,
  number as n,
  money,
  metric,
  type Values,
  type Mode,
} from "../types";
import {
  future,
  annuityPV,
  payment,
  duration,
  positive,
  sum,
  periods,
} from "../finance";
import rules from "../official-rules.json";
const pct = (v: Values, k: string) => n(v, k) / 100;
const monthly = (rate: number) => Math.expm1(Math.log1p(rate) / 12);
const timing = (v: Values) => v.timing === "Beginning of period";
const ageFields = () => [
  num("age", "Current age", 35, "years", 0),
  num("retire", "Retirement age", 67, "years", 1),
  num("life", "Life expectancy", 90, "years", 1),
];
function remaining(v: Values): { working: number; retired: number } {
  const working = n(v, "retire") - n(v, "age"),
    retired = n(v, "life") - n(v, "retire");
  if (working < 0 || retired <= 0)
    throw new Error(
      "Retirement age must be at least current age and below life expectancy.",
    );
  return { working, retired };
}
const retirement = tool(
  "retirement",
  [
    {
      id: "required",
      title: "Required Savings",
      fields: [
        ...ageFields(),
        num("income", "Current annual income", 80000, "$"),
        num("salary_growth", "Annual income increase", 2, "%"),
        num("replacement", "Retirement income replacement", 75, "%"),
        num("return", "Annual investment return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
        num("other", "Other monthly retirement income", 1500, "$"),
        num("balance", "Current retirement savings", 100000, "$"),
        num("saving", "Monthly saving", 500, "$"),
      ],
      description:
        "Estimate the retirement balance needed to fund an inflation-adjusted income gap.",
      formula:
        "Target = PV of the income gap at the real return; required monthly saving funds target less future current savings.",
      calculate: (v) => {
        const { working, retired } = remaining(v),
          r = pct(v, "return"),
          real = (1 + r) / (1 + pct(v, "inflation")) - 1,
          annual =
            n(v, "income") *
            (1 + pct(v, "salary_growth")) ** working *
            pct(v, "replacement"),
          gap = Math.max(0, annual - n(v, "other") * 12),
          target = annuityPV(gap, real, retired),
          existing = future(n(v, "balance"), 0, monthly(r), working * 12),
          factor = future(0, 1, monthly(r), working * 12),
          needed = working ? Math.max(0, (target - existing) / factor) : 0,
          projected = future(
            n(v, "balance"),
            n(v, "saving"),
            monthly(r),
            working * 12,
          );
        return {
          metrics: [
            money("Required savings at retirement", target),
            money("Required monthly saving", needed),
            money("Projected retirement savings", projected),
            money("Projected surplus / shortfall", projected - target),
            money("First-year retirement income need", annual),
          ],
          notes: [
            "Other income is treated as inflation-indexed throughout retirement. Returns and inflation remain constant.",
          ],
        };
      },
    },
    {
      id: "saving",
      title: "Saving Plan",
      fields: [
        num("age", "Current age", 35, "years"),
        num("retire", "Retirement age", 67, "years"),
        num("target", "Target savings", 1500000, "$"),
        num("balance", "Current savings", 100000, "$"),
        num("return", "Annual return", 6, "%", -99),
      ],
      description:
        "Find the periodic saving needed to reach a retirement target.",
      formula:
        "Monthly saving = (target − future current savings)/annuity accumulation factor.",
      calculate: (v) => {
        const N =
            positive(n(v, "retire") - n(v, "age"), "Years until retirement") *
            12,
          r = monthly(pct(v, "return")),
          existing = future(n(v, "balance"), 0, r, N),
          required = Math.max(
            0,
            (n(v, "target") - existing) / future(0, 1, r, N),
          );
        return {
          metrics: [
            money("Required monthly saving", required),
            money("Required annual saving", required * 12),
            money("Current savings future value", existing),
          ],
        };
      },
    },
    {
      id: "withdrawal",
      title: "Monthly Withdrawal",
      fields: [
        ...ageFields(),
        num("balance", "Current savings", 100000, "$"),
        num("saving", "Monthly contribution", 500, "$"),
        num("return", "Annual return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
      ],
      description:
        "Estimate the initial sustainable monthly withdrawal with subsequent inflation increases.",
      formula:
        "Starting retirement balance / real-rate annuity present-value factor.",
      calculate: (v) => {
        const { working, retired } = remaining(v),
          r = pct(v, "return"),
          b = future(n(v, "balance"), n(v, "saving"), monthly(r), working * 12),
          real = (1 + r) / (1 + pct(v, "inflation")) - 1,
          w = payment(b, monthly(real), retired * 12);
        return {
          metrics: [
            money("Balance at retirement", b),
            money("Initial monthly withdrawal", w),
            money(
              "Monthly withdrawal in today’s dollars",
              w / (1 + pct(v, "inflation")) ** working,
            ),
          ],
        };
      },
    },
    {
      id: "longevity",
      title: "Savings Longevity",
      fields: [
        num("balance", "Retirement balance", 500000, "$"),
        num("withdrawal", "Monthly withdrawal", 3000, "$"),
        num("return", "Annual return", 5, "%", -99),
      ],
      description:
        "Find how long a retirement balance supports fixed monthly withdrawals.",
      formula: "N = −ln(1 − PV×i/PMT)/ln(1+i).",
      calculate: (v) => {
        const b = n(v, "balance"),
          w = n(v, "withdrawal"),
          r = monthly(pct(v, "return"));
        if (r > 0 && w <= b * r)
          return {
            metrics: [money("Initial monthly interest", b * r)],
            notes: [
              "Under these constant-return assumptions the withdrawal does not exhaust the balance.",
            ],
          };
        const N = duration(b, w, r);
        return {
          metrics: [
            metric("Years savings last", N / 12),
            metric("Monthly withdrawals", N),
            money("Total withdrawn", w * N),
          ],
        };
      },
    },
  ],
  "Plan retirement saving, income, withdrawals, and savings longevity.",
);
function limit401(age: number): number {
  return (
    rules.retirement_contributions.employee_401k_limit +
    (age >= 60 && age <= 63
      ? rules.retirement_contributions.catch_up_60_to_63
      : age >= 50
        ? rules.retirement_contributions.catch_up_50plus
        : 0)
  );
}
const k401 = tool(
  "401k",
  [
    {
      id: "projection",
      title: "401(k) Projection",
      fields: [
        ...ageFields(),
        num("salary", "Annual salary", 80000, "$"),
        num("balance", "Current 401(k) balance", 100000, "$"),
        num("contribution", "Employee contribution", 10, "% of salary"),
        num("match", "Employer match", 50, "%"),
        num("match_limit", "Employer match limit", 6, "% of salary"),
        num("salary_growth", "Annual salary increase", 2, "%"),
        num("return", "Annual return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
      ],
      description:
        "Project savings one year at a time. Employee contributions + current balance includes the starting 401(k) balance plus the sum of each projected year’s capped employee contribution.",
      formula:
        "For each year: employee = min(annual salary × contribution%, age-based annual limit); employer = min(employee, annual salary × match limit%) × match%; ending balance = opening balance × (1 + annual return) + employee + employer. Employee contributions + current balance = starting 401(k) balance + sum of annual employee amounts.",
      calculate: (v) => {
        const { working } = remaining(v);
        if (working > 100)
          throw new Error("Projection must not exceed 100 years.");
        let b = n(v, "balance"),
          salary = n(v, "salary");
        const rows: (string | number)[][] = [];
        for (let y = 0; y < working; y++) {
          const e = Math.min(
              salary * pct(v, "contribution"),
              limit401(n(v, "age") + y),
            ),
            match =
              Math.min(e, salary * pct(v, "match_limit")) * pct(v, "match");
          b = b * (1 + pct(v, "return")) + e + match;
          rows.push([n(v, "age") + y + 1, salary, e, match, b]);
          salary *= 1 + pct(v, "salary_growth");
        }
        return {
          metrics: [
            money("Projected 401(k) balance", b),
            money(
              "Employee contributions + current balance",
              n(v, "balance") + sum(rows.map((row) => Number(row[2]))),
            ),
            money(
              "Employer contributions",
              sum(rows.map((row) => Number(row[3]))),
            ),
            money(
              "Inflation-adjusted balance",
              b / (1 + pct(v, "inflation")) ** working,
            ),
          ],
          columns: ["Age", "Salary", "Employee", "Employer", "Balance"],
          rows,
          notes: [
            "Annual iteration: the entered salary applies to the first projection year; salary increases once after each year. Each year’s employee contribution is salary × contribution percentage, capped by the limit for your age at the start of that projection year. Employee contributions + current balance adds the entered starting 401(k) balance once to the sum of these annual employee amounts. It excludes future investment returns and future employer matching; the starting balance may already contain past employer contributions and returns. The Employee column shows only that year’s new employee contribution.",
            "The opening balance earns the entered annual return first, then employee and employer contributions are added at year end. All projected years use 2026 limits with age-based catch-up; future limit increases and total employer/employee compensation caps are not projected. Calculations retain full precision; displayed annual amounts are rounded.",
          ],
        };
      },
    },
    {
      id: "early",
      title: "Early Withdrawal Cost",
      fields: [
        num("withdrawal", "Withdrawal amount", 10000, "$"),
        num("federal", "Federal marginal tax", 22, "%"),
        num("state", "State marginal tax", 5, "%"),
        num("local", "Local marginal tax", 0, "%"),
        select("exception", "Early withdrawal penalty exception applies?", [
          "No",
          "Yes",
        ]),
      ],
      description:
        "Estimate income tax and the additional early-distribution penalty.",
      formula:
        "Net withdrawal = gross − marginal income tax − applicable 10% additional tax.",
      calculate: (v) => {
        const amount = n(v, "withdrawal"),
          tax =
            amount * (pct(v, "federal") + pct(v, "state") + pct(v, "local")),
          penalty = v.exception === "Yes" ? 0 : amount * 0.1;
        return {
          metrics: [
            money("Net amount received", amount - tax - penalty),
            money("Estimated income tax", tax),
            money("Additional early withdrawal tax", penalty),
          ],
          notes: [
            "Exception eligibility is selected explicitly. The marginal-rate model does not recalculate a complete annual tax return.",
          ],
        };
      },
    },
    {
      id: "match",
      title: "Maximize Employer Match",
      fields: [
        num("age", "Age", 35, "years"),
        num("salary", "Annual salary", 80000, "$"),
        num("match1", "First-tier match", 100, "%"),
        num(
          "limit1",
          "First-tier employee contribution band",
          3,
          "% of salary",
        ),
        num("match2", "Second-tier match", 50, "%"),
        num(
          "limit2",
          "Additional second-tier contribution band",
          2,
          "% of salary",
        ),
      ],
      description:
        "Calculate employee saving and employer matching across two contribution bands.",
      formula:
        "Employer match = first band × first match rate + additional band × second match rate.",
      calculate: (v) => {
        const salary = n(v, "salary"),
          required = Math.min(
            salary * (pct(v, "limit1") + pct(v, "limit2")),
            limit401(n(v, "age")),
          ),
          first = Math.min(required, salary * pct(v, "limit1")),
          second = Math.max(0, required - first),
          match = first * pct(v, "match1") + second * pct(v, "match2");
        return {
          metrics: [
            money("Annual contribution to maximize match", required),
            money("Contribution per month", required / 12),
            money("Employer annual match", match),
            money("Total annual additions", required + match),
          ],
          notes: [
            "Second tier is the additional band after tier one, not a cumulative upper threshold.",
          ],
        };
      },
    },
  ],
  "Project 401(k) saving, compare early withdrawal costs, and maximize matching contributions.",
);
function benefitPV(
  monthlyBenefit: number,
  years: number,
  r: number,
  cola: number,
  delay = 0,
): number {
  if (years <= 0) return 0;
  const count = Math.floor(years * 12);
  if (count > 2400) throw new Error("Benefit horizon exceeds 200 years.");
  return sum(
    Array.from(
      { length: count },
      (_, i) =>
        (monthlyBenefit * (1 + cola) ** Math.floor(i / 12)) /
        (1 + r) ** (delay + (i + 1) / 12),
    ),
  );
}
const pension = tool(
  "pension",
  [
    {
      id: "lump",
      title: "Lump Sum vs. Monthly Pension",
      fields: [
        num("age", "Retirement age", 65, "years"),
        num("life", "Life expectancy", 90, "years"),
        num("lump", "Lump sum offered", 300000, "$"),
        num("monthly", "Monthly pension", 2000, "$"),
        num("return", "Annual discount / investment return", 5, "%", -99),
        num("cola", "Annual pension COLA", 0, "%", -99),
      ],
      description: "Compare the discounted pension stream to a lump sum.",
      formula:
        "Pension value = present value of monthly pension benefits, adjusted for COLA.",
      calculate: (v) => {
        const years = positive(n(v, "life") - n(v, "age"), "Years of benefits"),
          pv = benefitPV(
            n(v, "monthly"),
            years,
            pct(v, "return"),
            pct(v, "cola"),
          );
        return {
          metrics: [
            money("Present value of pension", pv),
            money("Lump sum", n(v, "lump")),
            money("Pension value advantage", pv - n(v, "lump")),
            metric(
              "Undiscounted break-even years",
              n(v, "lump") / positive(n(v, "monthly") * 12, "Annual pension"),
            ),
          ],
        };
      },
    },
    {
      id: "survivor",
      title: "Single Life vs. Joint Survivor",
      fields: [
        num("age", "Your retirement age", 65, "years"),
        num("life", "Your life expectancy", 85, "years"),
        num("spouse", "Spouse age at your retirement", 62, "years"),
        num("spouse_life", "Spouse life expectancy", 90, "years"),
        num("single", "Single-life monthly pension", 2500, "$"),
        num("joint", "Joint-survivor monthly pension", 2100, "$"),
        num("survivor", "Survivor benefit", 100, "% of joint pension"),
        num("return", "Annual discount rate", 5, "%", -99),
        num("cola", "Annual COLA", 0, "%", -99),
      ],
      description:
        "Compare household pension benefits through the entered lifespans.",
      formula:
        "Discount single-life benefits, joint benefits during your life, and the survivor benefit thereafter.",
      calculate: (v) => {
        const your = positive(n(v, "life") - n(v, "age"), "Your benefit years"),
          spouse = positive(
            n(v, "spouse_life") - n(v, "spouse"),
            "Spouse benefit years",
          ),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          single = benefitPV(n(v, "single"), your, r, cola),
          joint =
            benefitPV(n(v, "joint"), your, r, cola) +
            (spouse > your
              ? benefitPV(
                  n(v, "joint") * (1 + cola) ** your * pct(v, "survivor"),
                  spouse - your,
                  r,
                  cola,
                  your,
                )
              : 0);
        return {
          metrics: [
            money("Single-life present value", single),
            money("Joint-survivor present value", joint),
            money("Joint-survivor value advantage", joint - single),
          ],
          notes: [
            "Uses deterministic entered lifespans, not actuarial mortality probabilities.",
          ],
        };
      },
    },
    {
      id: "longer",
      title: "Work Longer",
      fields: [
        num("age1", "Earlier retirement age", 62, "years"),
        num("payment1", "Earlier monthly pension", 1800, "$"),
        num("age2", "Later retirement age", 67, "years"),
        num("payment2", "Later monthly pension", 2600, "$"),
        num("life", "Life expectancy", 90, "years"),
        num("return", "Annual discount rate", 5, "%", -99),
        num("cola", "Annual COLA", 0, "%", -99),
      ],
      description: "Compare pension streams starting at two retirement ages.",
      formula: "Discount each benefit stream to the earlier retirement age.",
      calculate: (v) => {
        const a = n(v, "age1"),
          b = n(v, "age2");
        if (b <= a)
          throw new Error(
            "Later retirement age must exceed earlier retirement age.",
          );
        const r = pct(v, "return"),
          cola = pct(v, "cola"),
          pv1 = benefitPV(n(v, "payment1"), n(v, "life") - a, r, cola),
          pv2 = benefitPV(n(v, "payment2"), n(v, "life") - b, r, cola, b - a);
        return {
          metrics: [
            money("Earlier pension present value", pv1),
            money("Later pension present value", pv2),
            money("Later pension advantage", pv2 - pv1),
          ],
          notes: [
            "Employment salary and additional retirement contributions while working longer are excluded.",
          ],
        };
      },
    },
  ],
  "Compare pension payment options and retirement timing.",
);
export function fullRetirementAge(birth: number): number {
  if (birth <= 1937) return 65;
  if (birth <= 1942) return 65 + ((birth - 1937) * 2) / 12;
  if (birth <= 1954) return 66;
  if (birth <= 1959) return 66 + ((birth - 1954) * 2) / 12;
  return 67;
}
export function ssFactor(claim: number, birth: number): number {
  const fra = fullRetirementAge(birth),
    delta = Math.round((claim - fra) * 12);
  return delta < 0
    ? 1 -
        (Math.min(-delta, 36) * (5 / 9)) / 100 -
        (Math.max(0, -delta - 36) * (5 / 12)) / 100
    : 1 + (Math.min(delta, (70 - fra) * 12) * (2 / 3)) / 100;
}
const social = tool(
  "social-security",
  [
    {
      id: "ideal",
      title: "Ideal Application Age",
      fields: [
        num("birth", "Birth year", 1964, "", 1943),
        num("life", "Life expectancy", 90, "years", 62),
        num("pia", "Monthly benefit at full retirement age", 2000, "$"),
        num("return", "Annual discount rate", 3, "%", -99),
        num("cola", "Annual COLA", 2, "%"),
      ],
      description:
        "Compare retirement benefits for application ages from 62 through 70.",
      formula:
        "Early claim reductions: 5/9% for first 36 months, 5/12% thereafter; delayed retirement credits: 2/3% per month through age 70.",
      calculate: (v) => {
        const fra = fullRetirementAge(n(v, "birth")),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          life = n(v, "life"),
          rows = Array.from({ length: 9 }, (_, i) => {
            const age = i + 62,
              benefit = n(v, "pia") * ssFactor(age, n(v, "birth")),
              pv = benefitPV(benefit, life - age, r, cola, age - 62);
            return [age, benefit, pv];
          }),
          best = rows.reduce((a, b) => (b[2] > a[2] ? b : a));
        return {
          metrics: [
            metric("Highest present-value application age", best[0]),
            money("Initial monthly benefit at selected age", best[1]),
            metric("Full retirement age", fra),
          ],
          columns: [
            "Claim age",
            "Initial monthly benefit",
            "Present value at age 62",
          ],
          rows,
          notes: [
            "Retirement benefit only: excludes earnings-test withholding, spousal/survivor coordination, taxation, and future benefit-law changes. Delayed credit model applies to birth years 1943 and later.",
          ],
        };
      },
    },
    {
      id: "compare",
      title: "Compare Application Ages",
      fields: [
        num("age1", "First application age", 62, "years", 62),
        num("monthly1", "First monthly benefit", 1400, "$"),
        num("age2", "Second application age", 70, "years", 62),
        num("monthly2", "Second monthly benefit", 2480, "$"),
        num("life", "Life expectancy", 90, "years", 62),
        num("return", "Annual discount rate", 3, "%", -99),
        num("cola", "Annual COLA", 2, "%"),
      ],
      description:
        "Compare two quoted benefit options using their starting ages and amounts.",
      formula: "Discount each benefit stream to the earlier application age.",
      calculate: (v) => {
        const a = n(v, "age1"),
          b = n(v, "age2"),
          base = Math.min(a, b),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          one = benefitPV(
            n(v, "monthly1"),
            n(v, "life") - a,
            r,
            cola,
            a - base,
          ),
          two = benefitPV(
            n(v, "monthly2"),
            n(v, "life") - b,
            r,
            cola,
            b - base,
          );
        return {
          metrics: [
            money("First option present value", one),
            money("Second option present value", two),
            money("Second option advantage", two - one),
          ],
        };
      },
    },
  ],
  "Compare Social Security claiming ages and the present value of retirement benefits.",
);
const annuity = tool(
  "annuity",
  [
    {
      id: "growth",
      title: "Annuity Accumulation",
      fields: [
        num("principal", "Starting principal", 100000, "$"),
        num("annual", "Annual addition", 1000, "$"),
        num("monthly", "Monthly addition", 100, "$"),
        timingField(),
        num("rate", "Annual growth rate", 5, "%", -99),
        num("years", "Accumulation length", 20, "years", 0.01),
      ],
      description:
        "Accumulate a starting balance with monthly and annual contributions.",
      formula:
        "Monthly and annual annuity accumulation factors use their respective periodic rates.",
      calculate: (v) => {
        const r = pct(v, "rate"),
          years = n(v, "years"),
          p = n(v, "principal"),
          fv =
            future(p, n(v, "monthly"), monthly(r), years * 12, timing(v)) +
            future(0, n(v, "annual"), r, years, timing(v)),
          contributions =
            p + n(v, "monthly") * years * 12 + n(v, "annual") * years;
        return {
          metrics: [
            money("Annuity future value", fv),
            money("Total contributions", contributions),
            money("Growth", fv - contributions),
          ],
        };
      },
    },
  ],
  "Estimate annuity accumulation before withdrawals begin.",
);
const annuityPayout = tool(
  "annuity-payout",
  ["length", "payment"].map((id): Mode => ({
    id,
    title: id === "length" ? "Fix Length" : "Fix Payment",
    fields: [
      num("principal", "Annuity principal", 300000, "$"),
      num("rate", "Annual return", 5, "%", -99),
      select("frequency", "Payout frequency", [
        "Monthly",
        "Quarterly",
        "Annually",
      ]),
      ...(id === "length"
        ? [num("years", "Payout length", 20, "years", 0.01)]
        : [num("payment", "Payment each period", 2000, "$")]),
    ],
    description:
      "Solve a fixed payout amount or how long a fixed payment can last.",
    formula: "Payout = principal / annuity present-value factor.",
    calculate: (v) => {
      const f =
          v.frequency === "Monthly" ? 12 : v.frequency === "Quarterly" ? 4 : 1,
        r = Math.expm1(Math.log1p(pct(v, "rate")) / f),
        p = n(v, "principal");
      if (id === "length") {
        const N = n(v, "years") * f,
          a = payment(p, r, N);
        return {
          metrics: [
            money("Payment each period", a),
            money("Total payments", a * N),
            money("Total investment earnings", a * N - p),
          ],
        };
      }
      const a = n(v, "payment");
      if (r > 0 && a <= p * r)
        return {
          metrics: [money("Interest per period", p * r)],
          notes: [
            "Balance is not exhausted under the constant return assumption.",
          ],
        };
      const N = duration(p, a, r);
      return {
        metrics: [
          metric("Payout duration in years", N / f),
          metric("Number of payments", N),
          money("Total payouts", N * a),
        ],
      };
    },
  })),
  "Calculate annuity income for a fixed term or the duration of a chosen payout.",
);
const iraFields = () => [
  num("age", "Current age", 35, "years"),
  num("retire", "Retirement age", 67, "years"),
  num("balance", "Current balance", 50000, "$"),
  num("contribution", "Annual contribution", 7000, "$"),
  select("max", "Use annual maximum contribution?", ["No", "Yes"]),
  num("return", "Annual return", 6, "%", -99),
  num("tax", "Current marginal tax rate", 22, "%"),
  num("retire_tax", "Retirement tax rate", 22, "%"),
];
function iraProjection(v: Values, roth: boolean, preTaxInputs = false) {
  const years = positive(
    n(v, "retire") - n(v, "age"),
    "Years until retirement",
  );
  if (years > 100) throw new Error("Projection cannot exceed 100 years.");
  const afterTaxFactor = preTaxInputs ? 1 - pct(v, "tax") : 1;
  let retirement = n(v, "balance") * afterTaxFactor,
    taxable = n(v, "balance") * (roth ? afterTaxFactor : 1 - pct(v, "tax")),
    contributions = 0;
  const rows: (number | string)[][] = [];
  for (let i = 0; i < Math.ceil(years); i++) {
    const limit =
        rules.retirement_contributions.ira_limit +
        (n(v, "age") + i >= 50
          ? rules.retirement_contributions.ira_catch_up_50plus
          : 0),
      c =
        (v.max === "Yes" ? limit : Math.min(n(v, "contribution"), limit)) *
        afterTaxFactor;
    retirement = retirement * (1 + pct(v, "return")) + c;
    const comparable = roth ? c : c * (1 - pct(v, "tax"));
    taxable =
      taxable *
        (1 + pct(v, "return") - Math.max(0, pct(v, "return")) * pct(v, "tax")) +
      comparable;
    contributions += c;
    rows.push([n(v, "age") + i + 1, c, retirement, taxable]);
  }
  return {
    metrics: [
      money(
        roth ? "Roth IRA balance" : "Traditional IRA pre-tax balance",
        retirement,
      ),
      money(
        roth ? "Roth after-tax value" : "Traditional IRA after-tax value",
        roth ? retirement : retirement * (1 - pct(v, "retire_tax")),
      ),
      money("Comparable taxable investment balance", taxable),
      money("Total contributions", contributions),
    ],
    columns: ["Age", "Annual contribution", "IRA balance", "Taxable balance"],
    rows,
    notes: [
      "Uses published 2026 IRA limits for all future years. Assumes eligible contributions and qualified Roth distributions; income phaseouts and deductibility eligibility are not inferred. Taxable positive returns are taxed annually at the entered marginal rate. In the Traditional/Roth/taxable comparison, initial balances and contributions are entered pre-tax and converted to an equivalent after-tax basis for Roth/taxable saving.",
    ],
  };
}
const roth = tool(
  "roth-ira",
  [
    {
      id: "comparison",
      title: "Roth IRA vs. Taxable Savings",
      fields: iraFields().filter((f) => f.key !== "retire_tax"),
      description:
        "Compare a qualified Roth IRA balance with equivalent after-tax saving in a taxable account.",
      formula:
        "Roth earnings compound tax-free; taxable earnings are reduced by annual tax.",
      calculate: (v) => iraProjection(v, true),
    },
  ],
  "Compare Roth IRA growth and taxable investment saving.",
);
const iraTool = tool(
  "ira",
  [
    {
      id: "comparison",
      title: "Traditional, Roth, and Taxable",
      fields: iraFields(),
      description:
        "Compare after-tax retirement wealth under contribution and tax assumptions.",
      formula:
        "Traditional after-tax balance = pre-tax account × (1 − retirement tax); Roth uses after-tax contributions.",
      calculate: (v) => {
        const result = iraProjection(v, false),
          roth = iraProjection(v, true, true);
        result.metrics.push(
          money(
            "Roth balance with equivalent after-tax contribution",
            roth.metrics[0].value,
          ),
        );
        return result;
      },
    },
  ],
  "Compare traditional IRA, Roth IRA, and taxable savings under explicit tax assumptions.",
);
const divisors: Record<string, number> = rules.rmd_uniform_lifetime.divisors;
const rmd = tool(
  "rmd",
  [
    {
      id: "annual",
      title: "Required Minimum Distribution",
      fields: [
        num("birth", "Birth year", 1951, "", 1900),
        num("year", "Distribution year", 2026, "", 2020),
        num("balance", "Previous December 31 balance", 500000, "$"),
        select(
          "spouse",
          "Sole beneficiary spouse more than 10 years younger?",
          ["No", "Yes"],
        ),
        num("spouse_birth", "Spouse birth year", 1964, "", 1900),
        num("return", "Future annual return", 5, "%", -99),
        num("projection", "Projection years", 10, "years", 1),
      ],
      description:
        "Calculate RMD from a prior year-end balance and applicable IRS life expectancy factor.",
      formula:
        "RMD = previous year-end balance / applicable IRS distribution period.",
      calculate: (v) => {
        const age = n(v, "year") - n(v, "birth"),
          start = n(v, "birth") >= 1960 ? 75 : n(v, "birth") >= 1951 ? 73 : 72,
          joint = v.spouse === "Yes";
        if (age < start)
          return {
            metrics: [
              metric("Age in distribution year", age),
              metric("Required starting age", start),
              money("Required minimum distribution", 0),
            ],
            notes: [
              "No age-based owner RMD is required yet under the selected birth-year rule. Inherited-account rules are separate.",
            ],
          };
        let b = n(v, "balance");
        const years = Math.min(100, Math.round(n(v, "projection"))),
          rows: (number | string)[][] = [];
        for (let i = 0; i < years; i++) {
          const a = age + i;
          if (a < 72) throw new Error("Unsupported owner age.");
          const spouseAge = n(v, "year") + i - n(v, "spouse_birth");
          if (joint && (spouseAge < 20 || a - spouseAge <= 10))
            throw new Error(
              "Joint table requires a sole-beneficiary spouse more than 10 years younger, at least age 20 in the selected year.",
            );
          const jointFactors: Record<
            string,
            Record<string, number>
          > = jointTable.factors;
          const factor = joint
            ? jointFactors[String(Math.min(a, 120))]?.[
                String(Math.min(spouseAge, 120))
              ]
            : divisors[String(Math.min(a, 120))];
          if (!factor) throw new Error("No verified IRS factor for this age.");
          const distribution = b / factor;
          rows.push([n(v, "year") + i, a, b, factor, distribution]);
          b = b * (1 + pct(v, "return")) - distribution;
        }
        return {
          metrics: [
            metric("Age in distribution year", age),
            metric("Distribution period", Number(rows[0][3])),
            money("Annual RMD", Number(rows[0][4])),
          ],
          columns: [
            "Year",
            "Age",
            "Prior year-end balance",
            "Distribution period",
            "RMD",
          ],
          rows,
          notes: [
            joint
              ? "Uses IRS Publication 590-B Table II joint-life factors, with both spouses aging each year. Published table covers ages 20–120 and over; younger-spouse entries under age 20 are unsupported."
              : "Uses IRS Publication 590-B Table III (2025 accessible edition). Owner accounts only; employer-plan deferral and inherited-account exceptions are not modeled.",
          ],
        };
      },
    },
  ],
  "Calculate owner-account RMDs and project future distributions using IRS life expectancy factors.",
);
export const retirementCalculators = [
  retirement,
  k401,
  pension,
  social,
  annuity,
  annuityPayout,
  roth,
  iraTool,
  rmd,
];
