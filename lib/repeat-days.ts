// "1, 3,1,9,x" -> "1,3": unique weekdays 0-6, sorted; null when empty
export function normalizeRepeatDays(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const days = [...new Set(value.split(",").map((d) => d.trim()))]
    .filter((d) => /^[0-6]$/.test(d))
    .sort();
  return days.join(",") || null;
}
