import type { Budgets, Transaction } from "./types";

export interface BudgetCrossing {
  category: string;
  threshold: 80 | 100;
  percent: number;
}

/**
 * Checks whether saving `tx` pushes its category's spending for that month
 * past 80% or 100% of the budget. `replacingId` is the id of a transaction
 * being edited, so its old amount isn't counted twice.
 */
export function checkBudgetCrossing(
  transactions: Transaction[],
  budgets: Budgets,
  tx: Omit<Transaction, "id">,
  replacingId?: string
): BudgetCrossing | null {
  if (tx.type !== "expense") return null;
  const limit = budgets[tx.category] ?? 0;
  if (limit <= 0) return null;

  const month = tx.date.slice(0, 7);
  const before = transactions
    .filter(
      (t) =>
        t.id !== replacingId &&
        t.type === "expense" &&
        t.category === tx.category &&
        t.date.slice(0, 7) === month
    )
    .reduce((s, t) => s + t.amount, 0);
  const after = before + tx.amount;

  const pctBefore = (before / limit) * 100;
  const pctAfter = (after / limit) * 100;
  const percent = Math.round(pctAfter);
  if (pctBefore < 100 && pctAfter >= 100)
    return { category: tx.category, threshold: 100, percent };
  if (pctBefore < 80 && pctAfter >= 80)
    return { category: tx.category, threshold: 80, percent };
  return null;
}

export function crossingMessage(c: BudgetCrossing): string {
  return c.threshold === 100
    ? `You've gone over your ${c.category} budget (${c.percent}% used).`
    : `Heads up: ${c.category} is at ${c.percent}% of its monthly budget.`;
}

/** Shows a system notification if the user has allowed them. */
export function notify(title: string, body: string): void {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    // Some browsers (e.g. Android Chrome) only allow notifications from a
    // service worker; the in-app alert still shows.
  }
}
