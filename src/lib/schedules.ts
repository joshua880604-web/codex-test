import type { Result } from "./types";

/** Aggregate completed payment periods into loan years, preserving balances. */
export function yearlySchedule(
  rows: (string | number)[][],
  periodsPerYear: number,
  sumColumns: number[],
  lastColumns: number[],
): (string | number)[][] {
  if (!Number.isInteger(periodsPerYear) || periodsPerYear < 1)
    throw new Error("Invalid payment frequency.");
  const output: (string | number)[][] = [];
  for (let start = 0; start < rows.length; start += periodsPerYear) {
    const group = rows.slice(start, start + periodsPerYear);
    const row: (string | number)[] = Array(group[0].length).fill("");
    row[0] = output.length + 1;
    for (const column of sumColumns)
      row[column] = group.reduce(
        (total, payment) => total + Number(payment[column]),
        0,
      );
    for (const column of lastColumns) row[column] = group.at(-1)![column];
    output.push(row);
  }
  return output;
}

/** Only known repayment table schemas are eligible; investment tables are untouched. */
export function addYearlySchedule(result: Result, periodsPerYear = 12): Result {
  const schema = result.columns?.join("|");
  let sums: number[], lasts: number[];
  if (
    [
      "Period|Payment|Interest|Principal|Balance",
      "Month|Payment|Interest|Principal|Balance",
      "Payment #|Payment|Interest|Principal|Balance",
    ].includes(schema ?? "")
  ) {
    sums = [1, 2, 3];
    lasts = [4];
  } else if (schema === "Month|Date|Payment|Interest|Principal|Balance") {
    sums = [2, 3, 4];
    lasts = [1, 5];
  } else if (
    schema ===
    "Month|Date|Payment|Interest|Principal|Balance|Taxes & costs|Total"
  ) {
    sums = [2, 3, 4, 6, 7];
    lasts = [1, 5];
  } else return result;
  if (!result.rows?.length) return result;
  return {
    ...result,
    schedulePeriod: periodsPerYear === 12 ? "Monthly" : "Per payment",
    annualColumns: result.columns!.map((label, i) =>
      i === 0
        ? "Loan year"
        : label === "Date"
          ? "Last payment date"
          : label === "Balance"
            ? "Ending balance"
            : label,
    ),
    annualRows: yearlySchedule(result.rows, periodsPerYear, sums, lasts),
  };
}
