// "1, 3,1,9,x" -> "1,3": unique weekdays 0-6, sorted; null when empty
export function normalizeRepeatDays(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const days = [...new Set(value.split(",").map((d) => d.trim()))]
    .filter((d) => /^[0-6]$/.test(d))
    .sort();
  return days.join(",") || null;
}

// "2026-10-16,bad,2026-10-16" -> "2026-10-16": unique YYYY-MM-DD days, sorted; null when empty
export function normalizeSkipDates(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const days = [...new Set(value.split(",").map((d) => d.trim()))]
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  return days.join(",") || null;
}

// the local calendar day of a date, as "YYYY-MM-DD"
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Occurrences of a repeating event that overlap [from, to). The stored start/end is the
// first occurrence: it anchors the series and sets the time of day and the length.
export function occurrences(
  series: { start: string | Date; end: string | Date; repeatDays: string; skipDates: string | null },
  from: Date,
  to: Date,
): { start: Date; end: Date; day: string }[] {
  const anchor = new Date(series.start);
  const length = +new Date(series.end) - +anchor;
  const weekdays = new Set(series.repeatDays.split(",").map(Number));
  const skipped = new Set(series.skipDates?.split(",") ?? []);

  const day = new Date(Math.max(+anchor, +from - length)); // step back so overnight spill-ins show
  day.setHours(0, 0, 0, 0);
  const out = [];
  for (; day < to; day.setDate(day.getDate() + 1)) {
    if (!weekdays.has(day.getDay()) || skipped.has(dayKey(day))) continue;
    const start = new Date(day);
    start.setHours(anchor.getHours(), anchor.getMinutes(), 0, 0);
    const end = new Date(+start + length);
    if (end > from && start >= anchor) out.push({ start, end, day: dayKey(day) });
  }
  return out;
}
