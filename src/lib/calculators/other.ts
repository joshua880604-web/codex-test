// Server/build registry. Client calculations load the core or the required data tool.
import { otherCoreCalculators } from "./other-core";
import { currencyCalculator } from "./currency";
import { inflationCalculator } from "./inflation";
export { parseDebts, debtSchedule, type Debt } from "./other-core";
export const otherCalculators = [
  ...otherCoreCalculators.slice(0, 2),
  currencyCalculator,
  inflationCalculator,
  ...otherCoreCalculators.slice(2),
];
