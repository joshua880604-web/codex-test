import { autoTaxBase, autoTaxStates } from "../auto-tax";
import {
  tool,
  baseLoanFields,
  extraFields,
  loanResult,
  compoundField,
  freq,
  frequencies,
} from "./helpers";
import {
  num,
  select,
  area,
  date,
  number as n,
  money,
  metric,
  type Values,
  type Mode,
  type Result,
} from "../types";
import {
  amortize,
  payment,
  future,
  present,
  annuityPV,
  periodic,
  duration,
  irr,
  sum,
  positive,
  bisect,
  solveRate,
  type Extra,
} from "../finance";
const pct = (v: Values, k: string) => n(v, k) / 100;
const yes = (v: Values, k: string) => v[k] === "Yes";
const term = (v: Values) => n(v, "years") * 12 + n(v, "months");
function extra(v: Values): Extra {
  const e: Extra = {
    monthly: n(v, "extra_monthly"),
    yearly: n(v, "extra_yearly"),
    once: n(v, "extra_once"),
    onceMonth: n(v, "extra_once_month"),
  };
  if (v.extra_start) e.monthlyStart = n(v, "extra_start");
  if (v.dated) {
    const d: Record<number, number> = {};
    for (const row of v.dated.split("\n").filter((s) => s.trim())) {
      const [month, amount] = row.split(",").map(Number);
      if (
        !Number.isInteger(month) ||
        month < 1 ||
        !Number.isFinite(amount) ||
        amount < 0
      )
        throw new Error(
          "Extra payments must be month number, nonnegative amount.",
        );
      d[month] = (d[month] ?? 0) + amount;
    }
    e.dated = d;
  }
  return e;
}
const datedExtraFields = () => [
  ...extraFields(),
  num("extra_start", "Monthly extra starts in month", 1, "", 1),
  area(
    "dated",
    "Additional one-time payments",
    "",
    "Optional: month number, amount; one payment per line.",
  ),
];
const costs = () => [
  num("tax", "Annual property tax", 4800),
  select("tax_unit", "Property tax unit", ["Dollars", "Percent of home value"]),
  num("insurance", "Annual home insurance", 1500),
  select("insurance_unit", "Home insurance unit", [
    "Dollars",
    "Percent of home value",
  ]),
  num("pmi", "Annual mortgage insurance", 0),
  select("pmi_unit", "Mortgage insurance unit", ["Dollars", "Percent of loan"]),
  num("pmi_years", "Mortgage insurance duration", 11, "years"),
  select("pmi_policy", "Mortgage insurance cancellation", [
    "Fixed duration",
    "Cancel at 80% original LTV",
  ]),
  num("hoa", "Annual HOA fee", 0),
  select("hoa_unit", "HOA fee unit", ["Dollars", "Percent of home value"]),
  num("other", "Annual other costs", 0),
  select("other_unit", "Other costs unit", [
    "Dollars",
    "Percent of home value",
  ]),
  num("tax_growth", "Annual property tax increase", 0, "%"),
  num("insurance_growth", "Annual insurance increase", 0, "%"),
  num("hoa_growth", "Annual HOA increase", 0, "%"),
  num("other_growth", "Annual other-cost increase", 0, "%"),
];
const houseFields = () => [
  num("price", "Home price", 400000, "$"),
  num("down", "Down payment", 20),
  select("down_unit", "Down payment unit", ["Percent", "Dollars"]),
  num("years", "Loan term", 30, "years", 0.01),
  num("months", "Additional months", 0, "months"),
  num("rate", "Interest rate", 6, "%"),
  date("start", "Start date", "2026-10-01"),
  ...costs(),
  ...datedExtraFields(),
];
function downValue(v: Values): number {
  const d =
    v.down_unit === "Percent" ? n(v, "price") * pct(v, "down") : n(v, "down");
  if (d > n(v, "price"))
    throw new Error("Down payment cannot exceed the home price.");
  return d;
}
function mortgageCalc(v: Values, kind = "conventional"): Result {
  const down = downValue(v),
    base = n(v, "price") - down;
  let fee = 0,
    pmi = v.pmi_unit === "Percent of loan" ? base * pct(v, "pmi") : n(v, "pmi"),
    pmiYears = n(v, "pmi_years");
  if (kind === "fha") {
    fee = base * pct(v, "upfront");
    pmi = base * pct(v, "annual_mip");
    pmiYears = n(v, "mip_years");
  }
  if (kind === "va") {
    const exempt = v.exempt === "Yes",
      d = down / positive(n(v, "price"), "Home price");
    const rate = exempt
      ? 0
      : d >= 0.1
        ? 0.0125
        : d >= 0.05
          ? 0.015
          : v.repeat === "Yes"
            ? 0.033
            : 0.0215;
    fee = base * rate;
    pmi = 0;
  }
  const financed =
      kind === "fha" || (kind === "va" && v.fee_treatment === "Finance fee"),
    p = base + (financed ? fee : 0),
    r = pct(v, "rate") / 12,
    N = term(v),
    standard = payment(p, r, N),
    result = loanResult(p, r, N, extra(v));
  const expense = (k: string, year: number) =>
    (v[k + "_unit"] === "Percent of home value"
      ? n(v, "price") * pct(v, k)
      : n(v, k)) *
    (1 + pct(v, k + "_growth")) ** year;
  let runningCosts = 0;
  const start = new Date(v.start + "T00:00:00Z");
  start.setUTCDate(1);
  if (!Number.isFinite(+start)) throw new Error("Choose a valid start date.");
  const rows = result.rows!.map((row, i) => {
    const cost =
      (sum(
        ["tax", "insurance", "hoa", "other"].map((k) =>
          expense(k, Math.floor(i / 12)),
        ),
      ) +
        ((
          kind === "conventional" &&
          v.pmi_policy === "Cancel at 80% original LTV"
            ? (i === 0 ? p : Number(result.rows![i - 1][4])) >
              n(v, "price") * 0.8
            : i < Math.round(pmiYears * 12)
        )
          ? pmi
          : 0)) /
      12;
    runningCosts += cost;
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + i);
    return [
      i + 1,
      d.toISOString().slice(0, 7),
      ...row.slice(1),
      cost,
      Number(row[1]) + cost,
    ];
  });
  const firstCost =
    (sum(["tax", "insurance", "hoa", "other"].map((k) => expense(k, 0))) +
      ((
        kind === "conventional" && v.pmi_policy === "Cancel at 80% original LTV"
          ? p > n(v, "price") * 0.8
          : pmiYears > 0
      )
        ? pmi
        : 0)) /
    12;
  result.metrics = [
    money("Monthly principal & interest", standard),
    money(
      "Initial monthly total",
      rows.length ? Number(rows[0][7]) : firstCost,
    ),
    money("Down payment", down),
    money("Financed loan amount", p),
    money("Upfront fee", fee),
    ...result.metrics.filter((x) => x.label !== "Payment per period"),
    money("Total taxes and other costs", runningCosts),
    money(
      "Total out of pocket",
      down + (financed ? 0 : fee) + sum(rows.map((x) => Number(x[7]))),
    ),
  ];
  result.columns = [
    "Month",
    "Date",
    "Payment",
    "Interest",
    "Principal",
    "Balance",
    "Taxes & costs",
    "Total",
  ];
  result.rows = rows;
  result.notes = [
    "Each tax and cost grows annually at its own rate. Conventional PMI follows the selected duration or original-value LTV policy. FHA MIP uses the base loan and explicit MIP duration; property appreciation is not used for cancellation.",
  ];
  return result;
}
const mortgageMode = (
  id: string,
  title: string,
  kind: string,
  extraFieldsForKind: ReturnType<typeof houseFields> = [],
): Mode => ({
  id,
  title,
  fields: [...houseFields(), ...extraFieldsForKind],
  description:
    "Calculate monthly payments, annual expenses, and dated extra principal payments.",
  formula:
    "Payment = P × i / (1 − (1+i)^−N), with a period-by-period balance schedule.",
  calculate: (v) => {
    if (id === "biweekly") {
      const monthly = mortgageCalc(v, kind),
        p = monthly.metrics.find(
          (x) => x.label === "Financed loan amount",
        )!.value,
        a = monthly.metrics[0].value;
      const extras = extra(v),
        dated: Record<number, number> = {};
      for (let month = 1; month <= Math.ceil(term(v)); month++) {
        const value =
          (month >= (extras.monthlyStart ?? 1) ? (extras.monthly ?? 0) : 0) +
          (month % 12 === 0 ? (extras.yearly ?? 0) : 0) +
          (month === (extras.onceMonth ?? 1) ? (extras.once ?? 0) : 0) +
          (extras.dated?.[month] ?? 0);
        if (value) dated[Math.ceil((month * 26) / 12)] = value;
      }
      const rows = amortize(
        p,
        pct(v, "rate") / 26,
        Math.ceil((term(v) / 12) * 26),
        { dated },
        a / 2,
      );
      return {
        metrics: [
          money("Biweekly payment", a / 2),
          money("Total interest", sum(rows.map((x) => x.interest))),
          metric("Payments", rows.length),
          metric("Years to payoff", rows.length / 26),
        ],
        columns: ["Payment #", "Payment", "Interest", "Principal", "Balance"],
        rows: rows.map((x) => [
          x.period,
          x.payment,
          x.interest,
          x.principal,
          x.balance,
        ]),
        notes: [
          "Biweekly model accrues annual nominal interest over 26 equal periods and pays half the standard monthly amount. Financed mortgage fees are included in principal. Monthly, annual, and one-time extra payments are mapped to the end of their corresponding month. Property taxes and other ownership expenses are excluded from the interest-only payoff comparison.",
        ],
      };
    }
    return mortgageCalc(v, kind);
  },
});
const mortgage = tool(
  "mortgage",
  [
    mortgageMode("monthly", "Monthly Mortgage", "conventional"),
    mortgageMode("biweekly", "Biweekly Comparison", "conventional"),
  ],
  "Estimate mortgage payments, ownership costs, and the effect of extra payments.",
);
const amortization = tool(
  "amortization",
  [
    {
      id: "schedule",
      title: "Amortization Schedule",
      fields: [
        ...baseLoanFields(),
        date("start", "Start date", "2026-10-01"),
        ...datedExtraFields(),
      ],
      description:
        "Build an amortization schedule with extra principal repayments.",
      formula:
        "Interest = opening balance × monthly rate; principal = payment − interest.",
      calculate: (v) => {
        const result = loanResult(
          n(v, "principal"),
          pct(v, "rate") / 12,
          term(v),
          extra(v),
        );
        const start = new Date(v.start + "T00:00:00Z");
        start.setUTCDate(1);
        result.columns = [
          "Month",
          "Date",
          "Payment",
          "Interest",
          "Principal",
          "Balance",
        ];
        result.rows = result.rows!.map((row, i) => {
          const d = new Date(start);
          d.setUTCMonth(d.getUTCMonth() + i);
          return [row[0], d.toISOString().slice(0, 7), ...row.slice(1)];
        });
        return result;
      },
    },
  ],
  "View the principal and interest breakdown for every loan payment.",
);
const payoffModes = ["remaining", "known"].flatMap((info) =>
  ["extra", "normal", "biweekly", "all"].map((method): Mode => ({
    id: info + "-" + method,
    title: `${info === "known" ? "Original loan" : "Current balance"} · ${method === "extra" ? "Extra payments" : method === "normal" ? "Normal repayment" : method === "all" ? "Pay off now" : "Biweekly"}`,
    fields: [
      ...(info === "known"
        ? [
            ...baseLoanFields(),
            num("elapsed", "Payments already made", 60, "months"),
          ]
        : [
            num("principal", "Current balance", 250000, "$"),
            num("payment", "Current monthly payment", 1800, "$"),
            num("rate", "Annual interest rate", 6, "%"),
          ]),
      ...extraFields(),
    ],
    description:
      "Compare remaining normal repayment with an accelerated payoff strategy.",
    formula:
      "Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.",
    calculate: (v) => {
      const rate = pct(v, "rate") / 12,
        original = n(v, "principal");
      let p = original,
        a: number,
        N: number;
      if (info === "known") {
        const elapsed = n(v, "elapsed");
        N = term(v) - elapsed;
        if (N <= 0)
          throw new Error("Elapsed payments must be below the loan term.");
        a = payment(original, rate, term(v));
        p = -future(-original, a, rate, elapsed);
      } else {
        a = n(v, "payment");
        N = duration(p, a, rate);
      }
      const normal = amortize(p, rate, N, {}, a),
        normalInterest = sum(normal.map((x) => x.interest));
      if (method === "all")
        return {
          metrics: [
            money("Payoff balance", p),
            money("Future interest avoided", normalInterest),
          ],
          notes: [
            "Any lender payoff fee and interest accrued since the last payment are not included.",
          ],
        };
      const r = method === "biweekly" ? pct(v, "rate") / 26 : rate,
        pay = method === "biweekly" ? a / 2 : a,
        extras = method === "extra" ? extra(v) : {},
        rows = amortize(p, r, N, extras, pay),
        interest = sum(rows.map((x) => x.interest));
      return {
        metrics: [
          money("Current principal balance", p),
          money("Interest with strategy", interest),
          money("Interest saved", normalInterest - interest),
          metric(
            "Years to payoff",
            rows.length / (method === "biweekly" ? 26 : 12),
          ),
        ],
        columns: ["Period", "Payment", "Interest", "Principal", "Balance"],
        rows: rows.map((x) => [
          x.period,
          x.payment,
          x.interest,
          x.principal,
          x.balance,
        ]),
      };
    },
  })),
);
const payoff = tool(
  "mortgage-payoff",
  payoffModes,
  "Compare normal, extra, biweekly, and immediate mortgage payoff strategies.",
);
const affordability = tool(
  "house-affordability",
  ["income", "budget"].map((id): Mode => ({
    id,
    title: id === "income" ? "Based on Income" : "Based on Monthly Budget",
    fields: [
      ...(id === "income"
        ? [
            num("income", "Annual household income", 100000, "$"),
            num("debt", "Monthly non-housing debt", 500, "$"),
            num("front", "Housing-to-income limit", 28, "%"),
            num("back", "Total debt-to-income limit", 36, "%"),
          ]
        : [num("budget", "Monthly housing budget", 2500, "$")]),
      num("down", "Down payment", 20, "%"),
      num("rate", "Mortgage interest", 6, "%"),
      num("years", "Loan term", 30, "years", 0.01),
      num("tax_rate", "Annual property tax", 1.2, "% of home value"),
      num("insurance", "Annual insurance", 1500, "$"),
      num("hoa", "Monthly HOA and other expenses", 0, "$"),
    ],
    description:
      "Solve a home price from a housing payment budget including taxes and insurance.",
    formula:
      "Budget = mortgage payment + annual property tax/12 + monthly insurance and HOA.",
    calculate: (v) => {
      const budget =
          id === "income"
            ? Math.min(
                (n(v, "income") / 12) * pct(v, "front"),
                (n(v, "income") / 12) * pct(v, "back") - n(v, "debt"),
              )
            : n(v, "budget"),
        fixed = n(v, "insurance") / 12 + n(v, "hoa"),
        factor =
          payment(1 - pct(v, "down"), pct(v, "rate") / 12, n(v, "years") * 12) +
          pct(v, "tax_rate") / 12,
        price = (budget - fixed) / positive(factor, "Payment factor");
      if (price <= 0)
        throw new Error(
          "Housing budget is insufficient after debt and expenses.",
        );
      return {
        metrics: [
          money("Estimated home price", price),
          money("Down payment", price * pct(v, "down")),
          money("Loan amount", price * (1 - pct(v, "down"))),
          money("Monthly housing budget", budget),
        ],
        notes: [
          "Affordability is based on the explicit ratios entered, not a lender approval. Mortgage insurance and maintenance are excluded unless included in the other-expense budget.",
        ],
      };
    },
  })),
  "Estimate a home price using income ratios or a fixed housing budget.",
);
const rent = tool(
  "rent",
  [
    {
      id: "affordability",
      title: "Affordable Rent",
      fields: [
        num("income", "Gross income", 60000, "$"),
        select("frequency", "Income frequency", [
          "Annually",
          "Monthly",
          "Biweekly",
          "Weekly",
        ]),
        num("debts", "Monthly debt payments", 500, "$"),
        num("housing_ratio", "Maximum rent-to-income ratio", 30, "%"),
        num("debt_ratio", "Maximum total debt ratio", 36, "%"),
      ],
      description: "Calculate a rent budget from income and total-debt limits.",
      formula:
        "Rent budget = min(gross monthly income × housing ratio, gross income × debt ratio − other debts).",
      calculate: (v) => {
        const monthly = (n(v, "income") * freq(v.frequency)) / 12,
          b = Math.max(
            0,
            Math.min(
              monthly * pct(v, "housing_ratio"),
              monthly * pct(v, "debt_ratio") - n(v, "debts"),
            ),
          );
        return {
          metrics: [
            money("Monthly rent budget", b),
            money("Gross monthly income", monthly),
          ],
          notes: [
            "Uses your selected housing and total-debt ratios as planning assumptions.",
          ],
        };
      },
    },
  ],
  "Estimate a monthly rent budget based on income and existing debts.",
);
const dtiFields = [
  "Salary",
  "Pension and Social Security",
  "Investment income",
  "Other income",
  "Rent",
  "Mortgage",
  "Real estate tax",
  "HOA",
  "Home insurance",
  "Credit card payments",
  "Student loans",
  "Auto loans",
  "Other liabilities",
];
const dti = tool(
  "debt-to-income-ratio",
  [
    {
      id: "ratio",
      title: "Debt-to-Income Ratio",
      fields: dtiFields.flatMap((label, i) => [
        num("v" + i, label, i === 0 ? 6000 : i === 4 ? 1500 : 0, "$"),
        select(
          "f" + i,
          label + " frequency",
          ["Monthly", "Annually", "Biweekly", "Weekly"],
          "Monthly",
        ),
      ]),
      description:
        "Convert income and liabilities to a common monthly period before computing debt ratios.",
      formula: "DTI = monthly debt payments / gross monthly income × 100%.",
      calculate: (v) => {
        const a = dtiFields.map(
            (_, i) => (n(v, "v" + i) * freq(v["f" + i])) / 12,
          ),
          income = positive(sum(a.slice(0, 4)), "Gross income"),
          debt = sum(a.slice(4)),
          housing = sum(a.slice(4, 9));
        return {
          metrics: [
            metric(
              "Total debt-to-income ratio",
              (debt / income) * 100,
              "percent",
            ),
            metric(
              "Housing-to-income ratio",
              (housing / income) * 100,
              "percent",
            ),
            money("Gross monthly income", income),
            money("Monthly debt payments", debt),
          ],
        };
      },
    },
  ],
  "Calculate housing and total debt as a share of gross income.",
);
const realEstate = {
  ...tool(
    "real-estate",
    [],
    "Browse mortgage, affordability, rental property, and home ownership calculators.",
  ),
  directory: true,
};
const refinance = tool(
  "refinance",
  ["balance", "original"].map((id): Mode => ({
    id,
    title:
      id === "balance"
        ? "Current Balance and Payment"
        : "Original Loan Information",
    fields: [
      ...(id === "balance"
        ? [
            num("principal", "Current balance", 250000, "$"),
            num("payment", "Current monthly payment", 1800, "$"),
          ]
        : [
            ...baseLoanFields(),
            num("elapsed", "Payments already made", 60, "months"),
          ]),
      ...(id === "balance" ? [num("rate", "Current annual rate", 6, "%")] : []),
      num("new_rate", "New annual rate", 5, "%"),
      num("new_years", "New term", 20, "years", 0.01),
      num("cashout", "Cash out", 0, "$"),
      num("points", "Discount points", 0, "%"),
      num("fees", "Other closing costs", 3000, "$"),
      select("finance", "Finance closing costs?", ["No", "Yes"]),
    ],
    description:
      "Compare future payments on the current mortgage with a refinanced loan.",
    formula:
      "New principal = balance + cash out + financed costs; compare amortization cash flows.",
    calculate: (v) => {
      const r = pct(v, "rate") / 12;
      let balance = n(v, "principal"),
        a: number,
        N: number;
      if (id === "original") {
        a = payment(balance, r, term(v));
        N = term(v) - n(v, "elapsed");
        positive(N, "Remaining loan term");
        balance = -future(-balance, a, r, n(v, "elapsed"));
      } else {
        a = n(v, "payment");
        N = duration(balance, a, r);
      }
      const costs =
          n(v, "fees") + (balance + n(v, "cashout")) * pct(v, "points"),
        p = balance + n(v, "cashout") + (yes(v, "finance") ? costs : 0),
        rows = amortize(p, pct(v, "new_rate") / 12, n(v, "new_years") * 12),
        old = amortize(balance, r, N, {}, a),
        monthly = payment(p, pct(v, "new_rate") / 12, n(v, "new_years") * 12),
        save = a - monthly;
      return {
        metrics: [
          money("New monthly payment", monthly),
          money("Current monthly payment", a),
          money("Monthly payment reduction", save),
          money("Closing costs", costs),
          ...(save > 0
            ? [metric("Simple closing-cost break-even (months)", costs / save)]
            : []),
          money("Current future interest", sum(old.map((x) => x.interest))),
          money("New total interest", sum(rows.map((x) => x.interest))),
        ],
        columns: ["Month", "Payment", "Interest", "Principal", "Balance"],
        rows: rows.map((x) => [
          x.period,
          x.payment,
          x.interest,
          x.principal,
          x.balance,
        ]),
        notes: [
          "Simple break-even divides costs by payment reduction. It does not treat cash-out proceeds as savings or account for different remaining balances.",
        ],
      };
    },
  })),
  "Compare mortgage refinancing costs, payments, interest, and simple break-even time.",
);
const apr = tool(
  "apr",
  ["loan", "mortgage"].map((id): Mode => ({
    id,
    title: id === "loan" ? "General Loan APR" : "Mortgage APR",
    fields: [
      ...baseLoanFields(),
      compoundField(),
      select(
        "pay",
        "Payback frequency",
        frequencies.filter((x) => x !== "Continuously"),
        "Monthly",
      ),
      num("financed", "Financed fees", 1000, "$"),
      num("upfront", "Upfront fees", 500, "$"),
      ...(id === "mortgage"
        ? [
            num("pmi", "Annual mortgage insurance", 1200, "$"),
            num("pmi_years", "Mortgage insurance duration", 11, "years"),
            num("points", "Discount points", 0, "%"),
          ]
        : []),
    ],
    description:
      "Find the annualized periodic rate that equates net loan proceeds with borrower payments.",
    formula: "Net proceeds = Σ paymentₜ/(1+APR/f)^t.",
    calculate: (v) => {
      const p = n(v, "principal"),
        fees = n(v, "financed"),
        up = n(v, "upfront") + (id === "mortgage" ? p * pct(v, "points") : 0),
        net = positive(p - up, "Net loan proceeds"),
        f = freq(v.pay),
        N = Math.round((term(v) / 12) * f),
        a = payment(p + fees, periodic(n(v, "rate"), freq(v.compound), f), N),
        flows = [
          -net,
          ...Array.from(
            { length: N },
            (_, i) =>
              a +
              (id === "mortgage" && i < n(v, "pmi_years") * f
                ? n(v, "pmi") / f
                : 0),
          ),
        ],
        roots = irr(flows);
      return {
        metrics: [
          metric("Nominal APR", roots[0] * f * 100, "percent"),
          metric(
            "Effective annual APR",
            (Math.pow(1 + roots[0], f) - 1) * 100,
            "percent",
          ),
          money("Periodic loan payment", a),
          money("Net proceeds", net),
          money("Total payments and upfront fees", sum(flows.slice(1)) + up),
        ],
        notes: [
          "APR is the nominal annualized cash-flow yield; effective annual APR is also shown. Insurance duration is entered explicitly.",
        ],
      };
    },
  })),
  "Calculate fee-adjusted annual percentage rates for general loans and mortgages.",
);
const fhaKindFields = [
  num("upfront", "Upfront MIP", 1.75, "% of base loan"),
  num("annual_mip", "Annual MIP", 0.55, "% of base loan"),
  num("mip_years", "MIP duration", 30, "years"),
];
const fha = tool(
  "fha-loan",
  [
    mortgageMode("monthly", "FHA Mortgage", "fha", fhaKindFields),
    mortgageMode("biweekly", "Biweekly Comparison", "fha", fhaKindFields),
  ],
  "Calculate an FHA mortgage with financed upfront MIP and annual mortgage insurance.",
);
const vaKindFields = [
  select("repeat", "Previously used a VA loan?", ["No", "Yes"]),
  select("exempt", "Funding fee exemption applies?", ["No", "Yes"]),
  select("fee_treatment", "Funding fee treatment", [
    "Finance fee",
    "Pay upfront",
  ]),
];
const va = tool(
  "va-mortgage",
  [
    mortgageMode("monthly", "VA Mortgage", "va", vaKindFields),
    mortgageMode("biweekly", "Biweekly Comparison", "va", vaKindFields),
  ],
  "Estimate a VA mortgage using down-payment tiers and funding-fee exemption.",
);
const equity = tool(
  "home-equity-loan",
  [
    {
      id: "loan",
      title: "Home Equity Loan",
      fields: [
        ...baseLoanFields(),
        num("closing", "Closing costs", 1000, "$"),
        select("treatment", "Fee treatment", [
          "Paid upfront",
          "Deducted from proceeds",
          "Financed",
        ]),
      ],
      description:
        "Calculate fixed home equity loan payments and fee-adjusted APR.",
      formula:
        "Amortize the financed balance; solve APR from net proceeds and loan payments.",
      calculate: (v) => {
        const p = n(v, "principal"),
          fee = n(v, "closing"),
          financed = p + (v.treatment === "Financed" ? fee : 0),
          net = positive(
            p - (v.treatment === "Financed" ? 0 : fee),
            "Net proceeds",
          ),
          N = term(v),
          result = loanResult(financed, pct(v, "rate") / 12, N),
          a = payment(financed, pct(v, "rate") / 12, N),
          r = solveRate(net, a, N);
        result.metrics.push(
          money("Net proceeds", net),
          metric("Nominal APR", r * 1200, "percent"),
        );
        return result;
      },
    },
  ],
  "Estimate monthly payments, closing costs, and APR on a home equity loan.",
);
const heloc = tool(
  "heloc",
  [
    {
      id: "draw-repay",
      title: "Draw and Repayment Periods",
      fields: [
        num("principal", "Outstanding balance", 50000, "$"),
        num("rate", "Annual interest rate", 8, "%"),
        num("draw", "Draw period", 10, "years", 0),
        num("years", "Repayment period", 20, "years", 0.01),
        num("closing", "Upfront closing costs", 0, "$"),
        {...num("charge", "Annual fee", 0, "$"), hint: "Yearly account-maintenance fee during the draw period only. Enter 0 for a no-annual-fee HELOC. The model divides it by 12 for average monthly costs; actual lender billing may be annual."},
      ],
      description:
        "Model an interest-only draw period followed by fully amortizing repayment.",
      formula:
        "Average draw payment = balance × monthly interest + annual fee/12 during draw only; repayment amortizes the balance without the annual fee.",
      calculate: (v) => {
        const p = n(v, "principal"),
          r = pct(v, "rate") / 12,
          draw = Math.round(n(v, "draw") * 12),
          N = n(v, "years") * 12,
          repay = amortize(p, r, N),
          charge = n(v, "charge") / 12,
          drawRows = Array.from({ length: draw }, (_, i) => [
            i + 1,
            p * r + charge,
            p * r,
            0,
            p,
          ]),
          rows = [
            ...drawRows,
            ...repay.map((x) => [
              x.period + draw,
              x.payment,
              x.interest,
              x.principal,
              x.balance,
            ]),
          ];
        return {
          metrics: [
            money("Monthly draw payment", draw > 0 ? p * r + charge : 0),
            money("Monthly repayment", payment(p, r, N)),
            money(
              "Total interest",
              draw * p * r + sum(repay.map((x) => x.interest)),
            ),
            money(
              "Fees and annual charges",
              n(v, "closing") + draw * charge,
            ),
            money("Annual fees during draw", draw * charge),
            ...(p > 0
              ? [
                  metric(
                    "Nominal APR including fees",
                    irr([
                      -positive(p - n(v, "closing"), "Net proceeds"),
                      ...rows.map((x) => Number(x[1])),
                    ])[0] * 1200,
                    "percent",
                  ),
                ]
              : []),
          ],
          columns: [
            "Month",
            "Payment incl. allocated fee",
            "Interest",
            "Principal",
            "Balance",
          ],
          rows,
          notes: [
            "Assumes the full outstanding balance exists at the start, stays constant through draw, and the rate stays fixed. The annual fee is a recurring account-maintenance charge during the draw period only; it stops in the repayment period. Enter 0 if your lender has no annual fee. For average monthly draw payments and this estimated APR, the annual fee is spread across 12 draw-period months; partial draw years are prorated. Actual annual billing dates can change cash-flow APR. Closing costs reduce net initial proceeds.",
          ],
        };
      },
    },
  ],
  "Model interest-only HELOC payments and the later repayment period.",
);
const downPayment = tool(
  "down-payment",
  ["price", "cash", "percent"].map((id): Mode => ({
    id,
    title:
      id === "price"
        ? "Home Price from Cash"
        : id === "cash"
          ? "Cash Needed"
          : "Down Payment Percentage",
    fields: [
      ...(id !== "cash" ? [num("cash", "Available cash", 100000, "$")] : []),
      ...(id !== "price" ? [num("price", "Home price", 400000, "$")] : []),
      ...(id !== "percent" ? [num("down", "Down payment", 20, "%")] : []),
      num("closing", "Closing costs", 3),
      select("closing_unit", "Closing cost unit", ["Percent", "Dollars"]),
      num("rate", "Mortgage rate", 6, "%"),
      num("years", "Loan term", 30, "years", 0.01),
    ],
    description:
      "Include both the down payment and closing costs in the cash requirement.",
    formula: "Cash = house price × down payment fraction + closing costs.",
    calculate: (v) => {
      const closing = n(v, "closing"),
        percent = v.closing_unit === "Percent";
      let price =
        id === "price"
          ? (n(v, "cash") - (percent ? 0 : closing)) /
            positive(
              pct(v, "down") + (percent ? closing / 100 : 0),
              "Down payment plus closing fraction",
            )
          : n(v, "price");
      positive(price, "Home price");
      const fee = percent ? (price * closing) / 100 : closing,
        down = id === "percent" ? n(v, "cash") - fee : price * pct(v, "down");
      if (down < 0 || down > price)
        throw new Error(
          "Cash after closing costs must fall between zero and home price.",
        );
      return {
        metrics: [
          money("Home price", price),
          money("Cash needed", down + fee),
          money("Down payment", down),
          metric("Down payment percentage", (down / price) * 100, "percent"),
          money("Closing costs", fee),
          money("Loan amount", price - down),
          money(
            "Monthly mortgage payment",
            payment(price - down, pct(v, "rate") / 12, n(v, "years") * 12),
          ),
        ],
      };
    },
  })),
  "Solve home price, cash required, or down payment percentage including closing costs.",
);
const rental = tool(
  "rental-property",
  [
    {
      id: "projection",
      title: "Rental Property Return",
      fields: [
        num("price", "Purchase price", 300000, "$"),
        select("financed", "Use financing?", ["Yes", "No"]),
        num("down", "Down payment", 25, "%"),
        num("rate", "Interest rate", 6, "%"),
        num("years", "Loan term", 30, "years", 0.01),
        num("closing", "Purchase closing costs", 6000, "$"),
        num("repairs", "Initial repairs", 10000, "$"),
        num(
          "repaired_value",
          "Property value after repairs (0 = purchase price)",
          0,
          "$",
        ),
        num("rent", "Monthly rent", 2500, "$"),
        num("other_income", "Other monthly income", 0, "$"),
        num("vacancy", "Vacancy rate", 5, "%"),
        num("management", "Management fee", 8, "% of income"),
        num("tax", "Annual property tax", 3600, "$"),
        num("insurance", "Annual insurance", 1500, "$"),
        num("hoa", "Annual HOA", 0, "$"),
        num("maintenance", "Annual maintenance", 3000, "$"),
        num("other", "Other annual expenses", 0, "$"),
        num("rent_growth", "Annual rent increase", 2, "%"),
        num("other_income_growth", "Annual other-income increase", 2, "%"),
        num("tax_growth", "Annual property tax increase", 2, "%"),
        num("insurance_growth", "Annual insurance increase", 2, "%"),
        num("hoa_growth", "Annual HOA increase", 2, "%"),
        num("maintenance_growth", "Annual maintenance increase", 2, "%"),
        num("other_growth", "Annual other-expense increase", 2, "%"),
        num("appreciation", "Annual appreciation", 3, "%"),
        num("hold", "Holding period", 10, "years", 1),
        select("sale_known", "Use known sale price?", ["No", "Yes"]),
        num("sale_price", "Known sale price", 400000, "$"),
        num("selling", "Selling cost", 6, "%"),
      ],
      description:
        "Project operating cash flow, debt, sale proceeds, and investment returns year by year.",
      formula:
        "NOI = effective income − operating expenses; equity cash flow = NOI − debt service.",
      calculate: (v) => {
        const price = n(v, "price"),
          debt = yes(v, "financed") ? price * (1 - pct(v, "down")) : 0,
          initial = price - debt + n(v, "closing") + n(v, "repairs"),
          hold = Math.round(n(v, "hold"));
        if (hold > 100)
          throw new Error("Holding period must not exceed 100 years.");
        const loan = debt
          ? amortize(debt, pct(v, "rate") / 12, n(v, "years") * 12)
          : [];
        let balance = debt,
          total = 0;
        const flows = [-initial],
          rows: (string | number)[][] = [];
        for (let y = 1; y <= hold; y++) {
          const income =
              n(v, "rent") *
                12 *
                (1 + pct(v, "rent_growth")) ** (y - 1) *
                (1 - pct(v, "vacancy")) +
              n(v, "other_income") *
                12 *
                (1 + pct(v, "other_income_growth")) ** (y - 1),
            expense =
              sum(
                ["tax", "insurance", "hoa", "maintenance", "other"].map(
                  (k) => n(v, k) * (1 + pct(v, k + "_growth")) ** (y - 1),
                ),
              ) +
              income * pct(v, "management"),
            payments = loan.slice((y - 1) * 12, y * 12),
            debtService = sum(payments.map((x) => x.payment));
          if (payments.length) balance = payments.at(-1)!.balance;
          const cash = income - expense - debtService;
          flows.push(cash);
          total += cash;
          rows.push([
            y,
            income,
            expense,
            income - expense,
            debtService,
            cash,
            balance,
          ]);
        }
        const sale = yes(v, "sale_known")
            ? n(v, "sale_price")
            : (n(v, "repaired_value") || price) *
              (1 + pct(v, "appreciation")) ** hold,
          proceeds = sale * (1 - pct(v, "selling")) - balance;
        flows[hold] += proceeds;
        let roots: number[] = [];
        try {
          roots = irr(flows);
        } catch {}
        const firstNOI = Number(rows[0][3]);
        return {
          metrics: [
            money("Initial cash investment", initial),
            money("First-year cash flow", Number(rows[0][5])),
            metric(
              "Capitalization rate",
              (firstNOI / (n(v, "repaired_value") || price)) * 100,
              "percent",
            ),
            metric(
              "First-year cash-on-cash",
              (Number(rows[0][5]) / positive(initial, "Initial investment")) *
                100,
              "percent",
            ),
            money("Net sale proceeds", proceeds),
            money("Total investment profit", total + proceeds - initial),
            ...roots.map((r, i) =>
              metric("Annual IRR " + (i + 1), r * 100, "percent"),
            ),
          ],
          columns: [
            "Year",
            "Effective income",
            "Expenses",
            "NOI",
            "Debt service",
            "Cash flow",
            "Loan balance",
          ],
          rows,
          notes: [
            "Before income taxes, depreciation deductions, and capital-gains tax. Management fees apply to collected rent plus other income; sale occurs at the end of the holding year.",
          ],
        };
      },
    },
  ],
  "Evaluate financed or cash rental property investments, including vacancy, operating expenses, and resale.",
);
const rentBuy = tool(
  "rent-vs-buy",
  [
    {
      id: "comparison",
      title: "Rent vs. Buy",
      fields: [
        num("price", "Home price", 400000, "$"),
        num("down", "Down payment", 20, "%"),
        num("rate", "Mortgage interest rate", 6, "%"),
        num("years", "Mortgage term", 30, "years", 0.01),
        num("buy_closing", "Purchase closing costs", 3, "%"),
        num("selling", "Sale closing costs", 6, "%"),
        num("tax", "Annual property tax", 4800, "$"),
        num("insurance", "Annual home insurance", 1500, "$"),
        num("hoa", "Annual HOA", 0, "$"),
        num("maintenance", "Annual maintenance", 4000, "$"),
        num("cost_growth", "Annual other-expense increase", 2, "%"),
        num("tax_growth", "Annual property tax increase", 2, "%"),
        num("appreciation", "Home appreciation", 3, "%"),
        num("rent", "Monthly rent", 2200, "$"),
        num("rent_growth", "Annual rent increase", 3, "%"),
        num("renter_insurance", "Annual renter insurance", 200, "$"),
        num("deposit", "Refundable rent deposit", 2200, "$"),
        num("rental_costs", "Upfront rental costs", 0, "$"),
        num("return", "Opportunity investment return", 5, "%", -99),
        num("tax_rate", "Combined marginal tax rate", 0, "%"),
        num("standard", "Annual standard deduction", 16100, "$"),
      ],
      description:
        "Compare the terminal wealth from renting and investing the difference versus buying and selling a home.",
      formula:
        "Compare buyer equity after sale with the renter portfolio, adding monthly cash-flow differences.",
      calculate: (v) => {
        const price = n(v, "price"),
          down = price * pct(v, "down"),
          buyInitial = down + price * pct(v, "buy_closing"),
          rentInitial = n(v, "deposit") + n(v, "rental_costs"),
          loan = amortize(
            price - down,
            pct(v, "rate") / 12,
            n(v, "years") * 12,
          ),
          r = (1 + pct(v, "return")) ** (1 / 12) - 1;
        let portfolio = buyInitial - rentInitial,
          balance = price - down,
          buyPaid = buyInitial,
          rentPaid = rentInitial,
          cross: number | undefined,
          yearInterest = 0;
        const rows: (number | string)[][] = [];
        for (let m = 1; m <= 360; m++) {
          const y = Math.floor((m - 1) / 12),
            rec = loan[m - 1];
          if (rec) {
            balance = rec.balance;
            yearInterest += rec.interest;
          }
          const expense =
              (n(v, "tax") * (1 + pct(v, "tax_growth")) ** y +
                (n(v, "insurance") + n(v, "hoa") + n(v, "maintenance")) *
                  (1 + pct(v, "cost_growth")) ** y) /
              12,
            buy = (rec?.payment ?? 0) + expense,
            rent =
              n(v, "rent") * (1 + pct(v, "rent_growth")) ** y +
              (n(v, "renter_insurance") * (1 + pct(v, "cost_growth")) ** y) /
                12;
          portfolio = portfolio * (1 + r) + buy - rent;
          buyPaid += buy;
          rentPaid += rent;
          if (m % 12 === 0) {
            const deductible = Math.max(
                0,
                yearInterest +
                  n(v, "tax") * (1 + pct(v, "tax_growth")) ** y -
                  n(v, "standard"),
              ),
              taxSaving = deductible * pct(v, "tax_rate");
            portfolio -= taxSaving;
            buyPaid -= taxSaving;
            yearInterest = 0;
            const value = price * (1 + pct(v, "appreciation")) ** (m / 12),
              equity = value * (1 - pct(v, "selling")) - balance,
              rentWealth = portfolio + n(v, "deposit");
            if (cross === undefined && equity >= rentWealth) cross = m / 12;
            rows.push([
              m / 12,
              equity,
              rentWealth,
              equity - rentWealth,
              buyPaid,
              rentPaid,
            ]);
          }
        }
        return {
          metrics: [
            ...(cross !== undefined
              ? [metric("First year buying leads", cross)]
              : []),
            money("Buyer equity after 30 years", Number(rows.at(-1)![1])),
            money(
              "Renter terminal wealth after 30 years",
              Number(rows.at(-1)![2]),
            ),
          ],
          columns: [
            "Year",
            "Buyer equity after sale",
            "Renter portfolio + deposit",
            "Buying advantage",
            "Cumulative buying outlay",
            "Cumulative renting outlay",
          ],
          rows,
          notes: [
            "Tax benefit is an explicit simplified itemized-deduction model above the entered standard deduction; SALT caps, loan limits, capital-gains tax, and filing-specific phaseouts are not applied. Portfolio invests each monthly cash-flow difference.",
          ],
        };
      },
    },
  ],
  "Compare renting and buying over a 30-year horizon, including opportunity cost and sale proceeds.",
);
const autoFields = () => [
  select("tax_state", "Dealer purchase tax treatment", autoTaxStates),
  num("purchase_year", "Purchase year (Michigan cap)", 2026, "year", 2025),
  num("price", "Vehicle price", 35000, "$"),
  num("payment", "Monthly payment budget", 600, "$"),
  num("months", "Loan term", 60, "months", 1),
  num("rate", "Annual interest rate", 6, "%"),
  num("rebate", "Cash incentive / rebate", 0, "$"),
  num("down", "Down payment", 5000, "$"),
  num("trade", "Trade-in value", 0, "$"),
  num("owed", "Amount owed on trade-in", 0, "$"),
  num("tax", "Sales tax rate", 7, "%"),
  num("fees", "Title, registration, and other fees", 500, "$"),
  select("trade_credit", "Trade-in reduces taxable price?", ["Yes", "No"]),
  select("rebate_tax", "Rebate reduces taxable price?", ["No", "Yes"]),
  select("finance_fees", "Finance fees and sales tax?", ["Yes", "No"]),
];
function autoAmount(
  v: Values,
  price: number,
): { p: number; tax: number; up: number } {
  const taxable = autoTaxBase(
      price,
      n(v, "trade"),
      n(v, "rebate"),
      v.tax_state ?? "Manual",
      Number(v.purchase_year ?? 2026),
      yes(v, "trade_credit"),
      yes(v, "rebate_tax"),
    ),
    tax = taxable * pct(v, "tax"),
    base = price - n(v, "rebate") - n(v, "down") - n(v, "trade") + n(v, "owed"),
    fees = tax + n(v, "fees");
  return {
    p: base + (yes(v, "finance_fees") ? fees : 0),
    tax,
    up: n(v, "down") + (yes(v, "finance_fees") ? 0 : fees),
  };
}
function vehicle(id: string) {
  return tool(
    id,
    ["payment", "price"].map((solve): Mode => ({
      id: solve,
      title:
        solve === "payment" ? "Monthly Payment" : "Affordable Vehicle Price",
      fields: autoFields().filter(
        (f) => f.key !== (solve === "payment" ? "payment" : "price"),
      ),
      description:
        "Include down payment, trade equity, sales tax, incentives, and financed fees.",
      formula:
        "Financed amount = vehicle price − incentives − down payment − trade value + trade debt + financed taxes and fees.",
      calculate: (v) => {
        let price: number;
        if (solve === "price") {
          const target = annuityPV(
            n(v, "payment"),
            pct(v, "rate") / 12,
            n(v, "months"),
          );
          price = bisect((x) => autoAmount(v, x).p - target, 0, 1e9);
        } else price = n(v, "price");
        const { p, tax, up } = autoAmount(v, price);
        if (p < 0)
          throw new Error(
            "Down payment and trade-in exceed the financed amount.",
          );
        const result = loanResult(p, pct(v, "rate") / 12, n(v, "months"));
        result.metrics.unshift(
          money("Vehicle price", price),
          money("Sales tax", tax),
          money("Upfront cash", up),
        );
        result.notes = [
          "State treatments assume an eligible licensed-dealer purchase, a qualifying same-transaction trade-in, and an immediate manufacturer rebate. Manual selections apply only in Manual mode. Enter the applicable rate and fees; local surtax caps, taxable dealer fees, registration and special exemptions are not automatically determined. Michigan uses its purchase-year trade credit cap; outstanding trade debt affects financing, not tax credit. Rules reviewed October 19, 2026; complete state coverage and original dropdown parity remain unverified.",
        ];
        return result;
      },
    })),
    "Calculate vehicle financing or solve the purchase price that fits a monthly budget.",
  );
}
const auto = vehicle("auto-loan");
const cashback = tool(
  "cash-back-or-low-interest",
  [
    {
      id: "compare",
      title: "Cash Back vs. Low Interest",
      fields: [
        num("price", "Auto price", 35000, "$"),
        num("down", "Down payment", 5000, "$"),
        num("months", "Loan term", 60, "months", 1),
        num("cashback", "Cash back", 2500, "$"),
        num("standard", "Rate with cash back", 7, "%"),
        num("low", "Promotional low rate", 2.9, "%"),
        ...autoFields()
          .filter((f) =>
            [
              "tax_state",
              "purchase_year",
              "trade",
              "owed",
              "tax",
              "fees",
              "trade_credit",
              "rebate_tax",
              "finance_fees",
            ].includes(f.key),
          )
          .map((f) =>
            ["tax", "fees"].includes(f.key) ? { ...f, value: 0 } : f,
          ),
      ],
      description:
        "Compare the total financing cost of a rebate with a lower-rate offer.",
      formula:
        "Compare total loan payments on the rebate-reduced balance and the promotional-rate balance.",
      calculate: (v) => {
        const N = n(v, "months"),
          cash = autoAmount({ ...v, rebate: v.cashback }, n(v, "price")),
          promo = autoAmount({ ...v, rebate: "0" }, n(v, "price"));
        if (cash.p < 0 || promo.p < 0)
          throw new Error(
            "Down payment, trade-in, or rebate exceeds financing needs.",
          );
        const a = payment(cash.p, pct(v, "standard") / 12, N),
          b = payment(promo.p, pct(v, "low") / 12, N);
        return {
          metrics: [
            money("Monthly payment with cash back", a),
            money("Monthly payment with low rate", b),
            money("Total payments with cash back", a * N),
            money("Total payments with low rate", b * N),
            money("Sales tax with cash back", cash.tax),
            money("Sales tax with low rate", promo.tax),
            money("Cash-back upfront cash", cash.up),
            money("Low-rate upfront cash", promo.up),
            money(
              "Cash-back cost advantage",
              b * N + promo.up - a * N - cash.up,
            ),
          ],
          notes: [
            "Positive advantage favors cash back, including entered tax, fees, trade equity and upfront cash. State treatments use eligible dealer-purchase assumptions; local surtax caps and taxable dealer fees require manual adjustment. Rates and fees default to zero in this comparison until entered.",
          ],
        };
      },
    },
  ],
  "Compare rebate savings against a promotional financing rate.",
);
const autoLease = tool(
  "auto-lease",
  ["payment", "price"].map((id): Mode => ({
    id,
    title: id === "payment" ? "Lease Payment" : "Vehicle Price from Payment",
    fields: [
      ...(id === "payment"
        ? [num("price", "Negotiated vehicle price", 35000, "$")]
        : [num("payment", "Monthly lease payment", 500, "$")]),
      num("residual", "Residual value", 20000, "$"),
      num("down", "Down payment / capital reduction", 3000, "$"),
      num("trade", "Trade-in credit", 0, "$"),
      num("fees", "Capitalized acquisition fees", 700, "$"),
      num("months", "Lease length", 36, "months", 1),
      num("rate", "Lease interest rate / money factor", 5),
      select("rate_unit", "Lease rate unit", ["APR (%)", "Money factor"]),
      num("tax", "Monthly sales tax", 7, "%"),
    ],
    description:
      "Calculate the depreciation charge and rent charge on a vehicle lease.",
    formula:
      "Base payment = (capitalized cost − residual)/months + (capitalized cost + residual) × money factor; money factor = APR/2400.",
    calculate: (v) => {
      const N = n(v, "months"),
        res = n(v, "residual"),
        mf =
          v.rate_unit === "Money factor" ? n(v, "rate") : n(v, "rate") / 2400,
        capital =
          id === "payment"
            ? n(v, "price") - n(v, "down") - n(v, "trade") + n(v, "fees")
            : (n(v, "payment") / (1 + pct(v, "tax")) + res / N - res * mf) /
              (1 / N + mf),
        dep = (capital - res) / N,
        rent = (capital + res) * mf,
        base = dep + rent,
        tax = base * pct(v, "tax");
      if (capital < res)
        throw new Error(
          "Capitalized cost must be at least the residual value.",
        );
      return {
        metrics: [
          money(
            "Vehicle price",
            capital + n(v, "down") + n(v, "trade") - n(v, "fees"),
          ),
          money("Monthly lease payment", base + tax),
          money("Monthly depreciation charge", dep),
          money("Monthly rent charge", rent),
          money("Monthly tax", tax),
          money("Total lease cash outlay", (base + tax) * N + n(v, "down")),
          metric("Money factor", mf),
        ],
      };
    },
  })),
  "Calculate an auto lease payment or solve the negotiated vehicle price.",
);
heloc.modes.push({
  id: "maximum-credit",
  title: "Maximum Credit",
  fields: [
    num("value", "Home value", 500000, "$"),
    num("mortgage", "Outstanding mortgage balance", 210000, "$"),
    num("ltv", "Lender maximum combined LTV", 80, "%"),
  ],
  description:
    "Estimate the maximum additional home equity credit from a lender’s combined loan-to-value ceiling.",
  formula:
    "Maximum credit = home value × maximum LTV − outstanding mortgage balance.",
  calculate: (v) => ({
    metrics: [
      money(
        "Estimated maximum HELOC",
        Math.max(0, n(v, "value") * pct(v, "ltv") - n(v, "mortgage")),
      ),
      money("Maximum total secured debt", n(v, "value") * pct(v, "ltv")),
    ],
  }),
});
export const propertyCalculators = [
  mortgage,
  amortization,
  payoff,
  affordability,
  rent,
  dti,
  realEstate,
  refinance,
  rental,
  apr,
  fha,
  va,
  equity,
  heloc,
  downPayment,
  rentBuy,
  auto,
  cashback,
  autoLease,
];
