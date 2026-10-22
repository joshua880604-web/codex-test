// Server/build registry; the RMD factor table is loaded only by the RMD client tool.
import { retirementCoreCalculators } from "./retirement-core";
import { rmdCalculator } from "./rmd";
export { fullRetirementAge, ssFactor } from "./retirement-core";
export const retirementCalculators = [...retirementCoreCalculators, rmdCalculator];
