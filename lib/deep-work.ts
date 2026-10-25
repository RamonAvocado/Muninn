import { normalizeIds } from "@/lib/repeat-days";

const pick = <T extends string>(options: readonly T[], v: unknown) => (options.includes(v as T) ? (v as T) : null);
const score = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as number) : null);
const time = (v: unknown) => (v ? new Date(v as string) : null);

// the deep-work session fields present in a request body, validated; absent ones are left out
export function deepWorkFields(body: Record<string, unknown>) {
  const parsers = {
    todoIds: normalizeIds,
    goal: (v: unknown) => (typeof v === "string" && v.trim()) || null,
    location: (v: unknown) => (typeof v === "string" && v.trim()) || null,
    startedAt: time,
    stoppedAt: time,
    goalAchieved: (v: unknown) => pick(["yes", "partial", "no"] as const, v),
    music: (v: unknown) => pick(["none", "instrumental", "lyrics", "ambient"] as const, v),
    focus: score,
    energy: score,
    interruptions: (v: unknown) => Math.max(0, Math.floor(Number(v)) || 0),
  };
  return Object.fromEntries(
    Object.entries(parsers).filter(([k]) => body[k] !== undefined).map(([k, parse]) => [k, parse(body[k])]),
  ) as { [K in keyof typeof parsers]?: ReturnType<(typeof parsers)[K]> };
}
