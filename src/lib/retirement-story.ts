import { employee401kLimit } from "./retirement-limits";
import type { Result, Values } from "./types";

export type RetirementPlan = { values: Values; result: Result };
export type RetirementScenario = { id: string; label: string; detail: string; values: Values; disabledReason?: string };
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
const percent = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n) + "%";

export function retirementStory(values: Values, result: Result) {
  const metric = (label: string) => result.metrics.find(m => m.label === label)?.value;
  const balance = metric("Projected 401(k) balance"), starting = metric("Starting 401(k) balance"),
    employee = metric("Employee contributions"), employer = metric("Employer contributions"),
    monthly = metric("Initial monthly retirement withdrawal"), todayMonthly = metric("Initial withdrawal in today’s dollars");
  if ([balance, starting, employee, employer, monthly, todayMonthly].some(n => n === undefined || !Number.isFinite(n))) return null;
  const years = Number(values.retire) - Number(values.age), inflation = Number(values.inflation) / 100;
  const discount = (1 + inflation) ** years;
  const rawGrowth = balance! - starting! - employee! - employer!;
  const growth = Math.abs(rawGrowth) < 0.005 ? 0 : rawGrowth;
  return {
    balance: balance!, monthly: monthly!, todayMonthly: todayMonthly!, retire: Number(values.retire), life: Number(values.life),
    parts: [
      { id: "starting", label: "Existing savings", value: starting! },
      { id: "employee", label: "Your future contributions", value: employee! },
      { id: "employer", label: "Future employer match", value: employer! },
      { id: "growth", label: growth < 0 ? "Projected investment loss" : "Projected investment growth", value: growth },
    ],
    fourPercentMonthly: balance! * 0.04 / 12,
    fourPercentToday: balance! * 0.04 / 12 / discount,
    cardInterpretation: `At age ${values.retire}, the model starts withdrawals at ${money(monthly!)} per month (${money(todayMonthly!)} in today’s dollars). Withdrawals rise with inflation and target depletion at age ${values.life}.`,
    interpretation: `Under your assumptions, this could fund an initial withdrawal of ${money(monthly!)} per month at age ${values.retire}, equivalent to ${money(todayMonthly!)} in today’s purchasing power. The model raises withdrawals with inflation and plans to use the balance by age ${values.life}.`,
  };
}

export function retirementScenarios(plan: RetirementPlan): RetirementScenario[] {
  const v = plan.values, age = Number(v.age), retire = Number(v.retire), life = Number(v.life), salary = Number(v.salary),
    rate = Number(v.contribution), annual = Math.min(salary * rate / 100, employee401kLimit(age), salary),
    room = Math.max(0, Math.min(employee401kLimit(age), salary) - annual), extra = Math.min(1200, room);
  const contributionReason = retire <= age ? "There is no remaining saving period." : salary <= 0 ? "Enter a positive annual salary to compare extra contributions." : extra < 0.005 ? "Your starting-year contribution already reaches the modeled limit or your salary." : undefined;
  const contributionRate = salary > 0 ? Math.min(100, (annual + extra) / salary * 100) : rate;
  const lowerReturn = Number(v.return) - 1;
  const laterAge = Math.min(retire + 2, life - 1, age + 100);
  return [
    {
      id: "save-more", label: extra > 0 && extra < 1199.995 ? "Use remaining contribution room" : "Add $100/month now",
      detail: `Raises your starting contribution rate from ${percent(rate)} to ${percent(contributionRate)}, adding ${money(extra)} to first-year employee contributions. Future contributions follow your salary and the modeled annual limits.`,
      values: { ...v, contribution: Number(contributionRate.toPrecision(15)).toString() }, disabledReason: contributionReason,
    },
    {
      id: "lower-return", label: "Return 1 point lower",
      detail: `Changes annual return from ${percent(Number(v.return))} to ${percent(lowerReturn)} during both saving and retirement.`,
      values: { ...v, return: String(lowerReturn) }, disabledReason: lowerReturn < -99 ? "The lower return would be outside this calculator’s supported range." : undefined,
    },
    {
      id: "retire-later", label: `Retire at ${laterAge}`,
      detail: `Changes retirement age from ${retire} to ${laterAge}. With life expectancy still ${life}, the modeled withdrawal period becomes ${life - laterAge} years.`,
      values: { ...v, retire: String(laterAge) }, disabledReason: laterAge <= retire ? "There is no later retirement age within this projection’s supported horizon." : undefined,
    },
  ];
}
