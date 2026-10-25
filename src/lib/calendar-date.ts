// Date.parse alone normalizes impossible days such as February 30.
export function calendarDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1)
    throw new Error("Enter a valid YYYY-MM-DD calendar date.");
  const time = Date.parse(value + "T00:00:00Z");
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value)
    throw new Error("Enter a valid YYYY-MM-DD calendar date.");
  return time;
}
