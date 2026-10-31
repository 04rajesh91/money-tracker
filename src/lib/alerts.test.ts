import { describe, expect, it } from "vitest";
import { checkBudgetCrossing } from "./alerts";
import type { Transaction } from "./types";

const food = (id: string, amount: number, date = "2026-10-10"): Transaction => ({
  id,
  type: "expense",
  amount,
  category: "Food",
  date,
});

const budgets = { Food: 1000 };

describe("checkBudgetCrossing", () => {
  it("alerts when spending crosses 80%", () => {
    const r = checkBudgetCrossing([food("a", 700)], budgets, food("x", 150));
    expect(r).toEqual({ category: "Food", threshold: 80, percent: 85 });
  });

  it("alerts when spending crosses 100%", () => {
    const r = checkBudgetCrossing([food("a", 900)], budgets, food("x", 200));
    expect(r?.threshold).toBe(100);
  });

  it("does not alert again once already past the threshold", () => {
    expect(
      checkBudgetCrossing([food("a", 850)], budgets, food("x", 50))
    ).toBeNull();
  });

  it("only counts the same month", () => {
    const lastMonth = food("a", 900, "2026-09-10");
    expect(checkBudgetCrossing([lastMonth], budgets, food("x", 100))).toBeNull();
  });

  it("does not double count a transaction being edited", () => {
    // Editing "a" from 700 to 750: 75%, below the 80% line
    expect(
      checkBudgetCrossing([food("a", 700)], budgets, food("a", 750), "a")
    ).toBeNull();
  });

  it("ignores income and categories without a budget", () => {
    const salary = { ...food("x", 5000), type: "income" as const };
    expect(checkBudgetCrossing([], budgets, salary)).toBeNull();
    expect(
      checkBudgetCrossing([], budgets, { ...food("x", 5000), category: "Rent" })
    ).toBeNull();
  });
});
