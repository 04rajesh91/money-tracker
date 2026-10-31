import { describe, expect, it } from "vitest";
import { generateDue } from "./recurring";
import type { RecurringRule } from "./types";

const salary: RecurringRule = {
  id: "r1",
  type: "income",
  amount: 80000,
  category: "Salary",
  note: "Monthly salary",
  dayOfMonth: 1,
  startMonth: "2026-08",
  active: true,
};

describe("generateDue", () => {
  it("adds one entry per month from the start month up to today", () => {
    const { added, rules } = generateDue([salary], new Date(2026, 9, 31));
    expect(added.map((t) => t.date)).toEqual([
      "2026-08-01",
      "2026-09-01",
      "2026-10-01",
    ]);
    expect(added.every((t) => t.recurringId === "r1")).toBe(true);
    expect(rules[0].lastAddedMonth).toBe("2026-10");
  });

  it("never adds the same month twice", () => {
    const first = generateDue([salary], new Date(2026, 9, 31));
    const second = generateDue(first.rules, new Date(2026, 9, 31));
    expect(second.added).toHaveLength(0);
  });

  it("waits until the chosen day in the current month", () => {
    const rent = { ...salary, dayOfMonth: 15, startMonth: "2026-10" };
    expect(generateDue([rent], new Date(2026, 9, 14)).added).toHaveLength(0);
    expect(generateDue([rent], new Date(2026, 9, 15)).added).toHaveLength(1);
  });

  it("skips paused rules", () => {
    const paused = { ...salary, active: false };
    expect(generateDue([paused], new Date(2026, 9, 31)).added).toHaveLength(0);
  });

  it("does nothing for a start month in the future", () => {
    const future = { ...salary, startMonth: "2026-12" };
    expect(generateDue([future], new Date(2026, 9, 31)).added).toHaveLength(0);
  });

  it("never adds months before the start month", () => {
    const moved = { ...salary, startMonth: "2026-10", lastAddedMonth: "2026-07" };
    const { added } = generateDue([moved], new Date(2026, 9, 31));
    expect(added.map((t) => t.date)).toEqual(["2026-10-01"]);
  });

  it("rolls over from December to January", () => {
    const dec = { ...salary, startMonth: "2026-12" };
    const { added } = generateDue([dec], new Date(2027, 0, 5));
    expect(added.map((t) => t.date)).toEqual(["2026-12-01", "2027-01-01"]);
  });
});
