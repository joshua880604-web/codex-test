import {money,metric,type Result} from './types';
const sum=(xs:number[])=>xs.reduce((total,value)=>total+value,0);
export type Debt = {
  name: string;
  balance: number;
  minimum: number;
  rate: number;
};
export function parseDebts(raw: string): Debt[] {
  const debts = raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, b, m, r] = line.split(",").map((x) => x.trim());
      const vals = [b, m, r].map(Number);
      if (!name || vals.some((x) => !Number.isFinite(x) || x < 0))
        throw new Error("Each debt needs name, balance, minimum payment, APR.");
      return { name, balance: vals[0], minimum: vals[1], rate: vals[2] / 1200 };
    });
  if (!debts.length || debts.length > 20)
    throw new Error("Enter between 1 and 20 debts.");
  return debts;
}
export function debtSchedule(
  debts: Debt[],
  budget: number,
  rollover: boolean,
  monthlyExtra = 0,
  yearlyExtra = 0,
  once = 0,
  onceMonth = 1,
  strategy: "avalanche" | "snowball" = "avalanche",
  maxMonths = 12000,
): Result {
  const original = sum(debts.map((x) => x.balance)),
    baseline = sum(debts.map((x) => x.minimum));
  if (budget < baseline)
    throw new Error("Monthly budget must cover the sum of minimum payments.");
  let interestTotal = 0;
  const d = debts.map((x) => ({ ...x })),
    rows: (number | string)[][] = [];
  for (
    let month = 1;
    month <= maxMonths && d.some((x) => x.balance > 1e-7);
    month++
  ) {
    const open = d.filter((x) => x.balance > 1e-7);
    let interest = 0;
    const before = sum(d.map((x) => x.balance));
    for (const x of open) {
      const i = x.balance * x.rate;
      x.balance += i;
      interest += i;
    }
    interestTotal += interest;
    let available =
        (rollover
          ? budget
          : sum(open.map((x) => x.minimum)) + (budget - baseline)) +
        monthlyExtra +
        (month % 12 === 0 ? yearlyExtra : 0) +
        (month === onceMonth ? once : 0),
      paid = 0;
    for (const x of open) {
      const a = Math.min(x.balance, x.minimum);
      x.balance -= a;
      available -= a;
      paid += a;
    }
    for (const x of [...open].sort((a, b) => strategy === "snowball" ? a.balance - b.balance || b.rate - a.rate : b.rate - a.rate)) {
      const a = Math.min(x.balance, Math.max(0, available));
      x.balance -= a;
      available -= a;
      paid += a;
    }
    const balance = sum(d.map((x) => Math.max(0, x.balance)));
    if (month > onceMonth && paid <= interest && balance >= before)
      throw new Error("Payments do not cover accrued interest.");
    rows.push([
      month,
      paid,
      interest,
      balance,
      ...d.map((x) => Math.max(0, x.balance)),
    ]);
  }
  if (d.some((x) => x.balance > 1e-5))
    throw new Error(`Debts are not repaid within ${maxMonths.toLocaleString('en-US')} months.`);
  return {
    metrics: [
      metric("Months until debt-free", rows.length),
      money("Total interest", interestTotal),
      money("Total paid", original + interestTotal),
    ],
    columns: [
      "Month",
      "Total payment",
      "Interest",
      "Total balance",
      ...d.map((x) => x.name),
    ],
    rows,
    chart: [
      { label: "Principal", value: original },
      { label: "Interest", value: interestTotal },
    ],
  };
}
