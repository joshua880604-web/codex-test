/** Actual-days first fiscal period, inclusive service and fiscal end dates.
 * Uses the preceding fiscal year's end to define a complete accounting year.
 */
export function firstFiscalFraction(service: string, end: string): number {
  const start = new Date(service + "T00:00:00Z"),
    finish = new Date(end + "T00:00:00Z");
  for (const [date, value] of [
    [start, service],
    [finish, end],
  ] as const) {
    if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value)
      throw new Error("Enter valid service and accounting year-end dates.");
  }
  const previousYear = finish.getUTCFullYear() - 1,
    month = finish.getUTCMonth();
  const day = Math.min(
    finish.getUTCDate(),
    new Date(Date.UTC(previousYear, month + 1, 0)).getUTCDate(),
  );
  const previous = new Date(Date.UTC(previousYear, month, day));
  if (start <= previous || start > finish)
    throw new Error("Service date must be within the first accounting year.");
  return (+finish - +start + 86400000) / (+finish - +previous);
}
