import jointTable from "../joint-rmd-table.json";
import rules from "../official-rules.json";
import { tool } from "./helpers";
import { num, select, number as n, money, metric, type Values, type Mode } from "../types";
const pct = (v: Values, k: string) => n(v, k) / 100;
const divisors: Record<string, number> = rules.rmd_uniform_lifetime.divisors;
export const rmdCalculator = tool(
  "rmd",
  [
    {
      id: "annual",
      title: "Required Minimum Distribution",
      fields: [
        num("birth", "Birth year", 1951, "", 1900),
        num("year", "Distribution year", 2026, "", 2022),
        {...num("balance", "Previous December 31 balance", 500000, "$"), hint: "Traditional IRA or other eligible non-Roth owner account. Excludes inherited accounts and Roth IRA owner balances; designated Roth plan accounts also have no owner lifetime RMD for 2024 onward."},
        {...num("taken", "Gross distributions already credited to this year’s RMD", 0, "$"), optional:true, hint:"Eligible gross amounts before withholding, for this account and distribution year only. Exclude a delayed prior-year RMD paid this calendar year; confirm credit with the custodian."},
        select(
          "spouse",
          "Sole beneficiary spouse more than 10 years younger?",
          ["No", "Yes"],
        ),
        num("spouse_birth", "Spouse birth year", 1964, "", 1900),
        num("return", "Future annual return", 5, "%", -99),
        {...num("projection", "Projection years", 10, "years", 1),max:100,step:1},
      ],
      description:
        "Calculate RMD from a prior year-end balance and applicable IRS life expectancy factor.",
      formula:
        "RMD = previous year-end balance / applicable IRS distribution period.",
      calculate: (v) => {
        const age = n(v, "year") - n(v, "birth"),
          start = n(v, "birth") >= 1960 ? 75 : n(v, "birth") >= 1951 ? 73 : 72,
          joint = v.spouse === "Yes";
        const birth=n(v,'birth'),year=n(v,'year'),projection=n(v,'projection'),taken=v.taken===undefined||v.taken===''?0:n(v,'taken');
        if(!Number.isInteger(birth)||!Number.isInteger(year)||!Number.isInteger(n(v,'spouse_birth'))||!Number.isInteger(projection)||projection<1||projection>100||year<2022||birth>year||taken<0)throw new Error('Use valid whole birth/distribution years from 2022 onward, 1–100 whole projection years and nonnegative credited distributions.');
        if (age < start)
          return {
            metrics: [
              metric("Age in distribution year", age),
              metric("Required starting age", start),
              money("Required minimum distribution", 0),
              money("Annual RMD",0),money("Remaining RMD for selected year",0),
              money("Monthly budgeting equivalent of annual RMD",0),
              money("Gross distributions entered for selected year",taken),
            ],
            notes: [
              "No age-based owner RMD is required yet under the selected birth-year rule. Inherited-account rules are separate. Future projections are not generated until the selected distribution year reaches the applicable owner starting age; ordinary withdrawals are not an RMD credit for later years.",
            ],
          };
        let b = n(v, "balance");
        const years = projection,
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
          const actualWithdrawal=i===0?Math.max(distribution,taken):distribution;
          const afterGrowth = b * (1 + pct(v, "return"));
          if (actualWithdrawal > afterGrowth + 1e-8)
            throw new Error(
              "The assumed return leaves insufficient funds for the year-end RMD. Adjust the return or projection length; a negative account balance is not projected.",
            );
          const closing=Math.max(0, afterGrowth-actualWithdrawal);
          rows.push([year+i,a,b,factor,distribution,actualWithdrawal,closing]);
          b = closing;
        }
        return {
          metrics: [
            metric("Age in distribution year", age),
            metric("Distribution period", Number(rows[0][3])),
            money("Annual RMD", Number(rows[0][4])),
            money("Remaining RMD for selected year",Math.max(0,Number(rows[0][4])-taken)),
            money("Monthly budgeting equivalent of annual RMD",Number(rows[0][4])/12),
            metric("RMD percentage of prior year-end balance",100/Number(rows[0][3]),"percent"),
            money("Gross distributions entered for selected year",taken),
            money("Amount entered above selected year’s RMD",Math.max(0,taken-Number(rows[0][4]))),
          ],
          columns: [
            "Year",
            "Age",
            "Prior year-end balance",
            "Distribution period",
            "RMD",
            "Modeled gross withdrawal",
            "Modeled year-end balance",
          ],
          rows,
          notes: [
            `The selected ${year} RMD uses the December 31, ${year-1} balance and age at the end of ${year}. Annual RMD is gross, before tax withholding. Remaining RMD subtracts only the distributions you entered as credited to this distribution year. The monthly figure is annual RMD divided by 12 for budgeting, not a monthly IRS requirement.`,
            "Projection applies annual return to the opening balance, then models withdrawals at year-end. In the first year the modeled gross withdrawal is the greater of the annual RMD and the amount already credited; it does not add both. Later years withdraw only the projected RMD. Actual intrayear timing and additional withdrawals can change future balances. Excess distributions are not carried forward as a future-year RMD credit.",
            "For traditional IRA and other eligible non-Roth owner accounts. Roth IRA owners have no lifetime RMD; designated Roth plan accounts have no owner lifetime RMD for 2024 onward. Do not enter a Roth balance in this model. Inherited-account rules and still-working employer-plan deferrals require separate review.",
            joint
              ? "Uses IRS Publication 590-B Table II joint-life factors, with both spouses aging each year. Published table covers ages 20–120 and over; younger-spouse entries under age 20 are unsupported."
              : "Uses IRS Publication 590-B Table III (2025 accessible edition), effective for distribution years 2022 onward. Earlier years require historical tables and relief rules and are unsupported. Owner accounts only; employer-plan deferral and inherited-account exceptions are not modeled.",
          ],
        };
      },
    },
  ],
  "Use this RMD calculator for 2026 or another supported year to estimate an owner-account minimum, remaining distribution and future withdrawals using IRS life expectancy factors.",
);
