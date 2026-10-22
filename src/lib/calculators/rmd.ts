import jointTable from "../joint-rmd-table.json";
import rules from "../official-rules.json";
import { tool } from "./helpers";
import { num, select, number as n, money, metric, type Values, type Mode } from "../types";
import { positive } from "../finance";
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
          const afterGrowth = b * (1 + pct(v, "return"));
          if (distribution > afterGrowth + 1e-8)
            throw new Error(
              "The assumed return leaves insufficient funds for the year-end RMD. Adjust the return or projection length; a negative account balance is not projected.",
            );
          b = Math.max(0, afterGrowth - distribution);
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
              : "Uses IRS Publication 590-B Table III (2025 accessible edition), effective for distribution years 2022 onward. Earlier years require historical tables and relief rules and are unsupported. Owner accounts only; employer-plan deferral and inherited-account exceptions are not modeled.",
          ],
        };
      },
    },
  ],
  "Calculate owner-account RMDs and project future distributions using IRS life expectancy factors.",
);
