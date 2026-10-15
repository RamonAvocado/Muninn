import { expect, test } from "bun:test";
import { normalizeRepeatDays } from "./repeat-days";

test("normalizeRepeatDays", () => {
  expect(normalizeRepeatDays("1, 3,1,9,x")).toBe("1,3");
  expect(normalizeRepeatDays("6,0")).toBe("0,6");
  expect(normalizeRepeatDays("")).toBeNull();
  expect(normalizeRepeatDays(null)).toBeNull();
});
