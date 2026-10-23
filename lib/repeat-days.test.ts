import { expect, test } from "bun:test";
import { dayKey, normalizeRepeatDays, normalizeSkipDates, occurrences } from "./repeat-days";

test("normalizeRepeatDays", () => {
  expect(normalizeRepeatDays("1, 3,1,9,x")).toBe("1,3");
  expect(normalizeRepeatDays("6,0")).toBe("0,6");
  expect(normalizeRepeatDays("")).toBeNull();
  expect(normalizeRepeatDays(null)).toBeNull();
});

test("normalizeSkipDates", () => {
  expect(normalizeSkipDates("2026-10-17,bad,2026-10-16,2026-10-17")).toBe("2026-10-16,2026-10-17");
  expect(normalizeSkipDates("")).toBeNull();
});

test("occurrences: every day, overnight, with a skipped day", () => {
  // sleep 23:00-07:00 every day, starting Thu 15 Oct (local time)
  const series = {
    start: new Date(2026, 9, 15, 23),
    end: new Date(2026, 9, 16, 7),
    repeatDays: "0,1,2,3,4,5,6",
    skipDates: "2026-10-17",
  };
  // week of Mon 12 - Mon 19
  const got = occurrences(series, new Date(2026, 9, 12), new Date(2026, 9, 19));
  expect(got.map((o) => o.day)).toEqual(["2026-10-15", "2026-10-16", "2026-10-18"]);
  expect(got[0].start.getHours()).toBe(23);
  expect(+got[0].end - +got[0].start).toBe(8 * 36e5);

  // next week starts with Sunday's night spilling into Monday morning
  const next = occurrences(series, new Date(2026, 9, 19), new Date(2026, 9, 20));
  expect(next.map((o) => o.day)).toEqual(["2026-10-18", "2026-10-19"]);
  expect(dayKey(next[1].start)).toBe("2026-10-19");
});

test("occurrences: weekdays only", () => {
  const series = { start: new Date(2026, 9, 12, 9), end: new Date(2026, 9, 12, 17), repeatDays: "1,2,3,4,5", skipDates: null };
  expect(occurrences(series, new Date(2026, 9, 12), new Date(2026, 9, 19)).length).toBe(5);
});
