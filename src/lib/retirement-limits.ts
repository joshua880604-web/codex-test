import rules from "./official-rules.json";

export function employee401kLimit(age: number): number {
  return rules.retirement_contributions.employee_401k_limit +
    (age >= 60 && age <= 63 ? rules.retirement_contributions.catch_up_60_to_63 :
      age >= 50 ? rules.retirement_contributions.catch_up_50plus : 0);
}
