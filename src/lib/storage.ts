import type { Budgets, Transaction } from "./types";

const TX_KEY = "mt_transactions";
const BUDGET_KEY = "mt_budgets";

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Transaction[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTransactions(tx: Transaction[]): void {
  localStorage.setItem(TX_KEY, JSON.stringify(tx));
}

export function loadBudgets(): Budgets {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Budgets;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveBudgets(b: Budgets): void {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(b));
}

export function clearAllStorage(): void {
  localStorage.removeItem(TX_KEY);
  localStorage.removeItem(BUDGET_KEY);
}
