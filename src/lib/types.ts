export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  recurringId?: string; // set when auto-added by a recurring rule
}

export type Budgets = Record<string, number>; // category -> monthly limit

// A transaction that is added automatically once a month (salary, rent, bills...)
export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  dayOfMonth: number; // 1-28, so it exists in every month
  startMonth: string; // yyyy-mm, first month to add it
  active: boolean;
  lastAddedMonth?: string; // yyyy-mm of the most recent auto-added entry
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Other Income"] as const;

export const ALL_EXPENSE_CATS = [...EXPENSE_CATEGORIES];
export const ALL_INCOME_CATS = [...INCOME_CATEGORIES];

export function categoriesForType(type: TransactionType): string[] {
  return type === "income" ? [...INCOME_CATEGORIES] : [...EXPENSE_CATEGORIES];
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316",
  Rent: "#ef4444",
  Transport: "#3b82f6",
  Bills: "#eab308",
  Shopping: "#ec4899",
  Health: "#10b981",
  Other: "#8b5cf6",
  Salary: "#22c55e",
  "Other Income": "#14b8a6",
};
