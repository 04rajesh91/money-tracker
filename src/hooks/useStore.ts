import { useCallback, useEffect, useMemo, useState } from "react";
import type { Budgets, RecurringRule, Transaction } from "../lib/types";
import {
  clearAllStorage,
  loadBudgets,
  loadRecurring,
  loadTransactions,
  saveBudgets,
  saveRecurring,
  saveTransactions,
} from "../lib/storage";
import { generateDue, monthKey, prevMonth } from "../lib/recurring";

export type NewRecurringRule = Omit<RecurringRule, "id" | "lastAddedMonth">;

export interface Store {
  transactions: Transaction[];
  budgets: Budgets;
  recurring: RecurringRule[];
  /** How many recurring entries were auto-added when the app opened */
  autoAddedOnLoad: number;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  setBudgets: (b: Budgets) => void;
  addRecurring: (rule: NewRecurringRule) => number;
  updateRecurring: (id: string, rule: NewRecurringRule) => number;
  deleteRecurring: (id: string) => void;
  loadDemo: () => void;
  clearAll: () => void;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function withIds(txs: Omit<Transaction, "id">[]): Transaction[] {
  return txs.map((t) => ({ ...t, id: uid() }));
}

// Load saved data and add any recurring entries that became due since the
// last visit. Runs once, synchronously, so it can never add duplicates.
function loadInitial() {
  const { added, rules } = generateDue(loadRecurring());
  return {
    transactions: [...withIds(added), ...loadTransactions()],
    recurring: rules,
    autoAdded: added.length,
  };
}

export function useStore(): Store {
  const [initial] = useState(loadInitial);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initial.transactions
  );
  const [budgets, setBudgetsState] = useState<Budgets>(() => loadBudgets());
  const [recurring, setRecurring] = useState<RecurringRule[]>(initial.recurring);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveRecurring(recurring);
  }, [recurring]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...tx, id: uid() }, ...prev]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, tx: Omit<Transaction, "id">) => {
      setTransactions((prev) =>
        prev.map((p) => (p.id === id ? { ...tx, id } : p))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getTransaction = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions]
  );

  const setBudgets = useCallback((b: Budgets) => {
    setBudgetsState(b);
  }, []);

  // Saves a rule and immediately adds any entries already due for it.
  // Returns how many entries were added.
  const saveRule = useCallback((rule: RecurringRule, isNew: boolean) => {
    const { added, rules } = generateDue([rule]);
    const saved = rules[0];
    setRecurring((prev) =>
      isNew ? [...prev, saved] : prev.map((r) => (r.id === saved.id ? saved : r))
    );
    if (added.length > 0) {
      const newTx = withIds(added);
      setTransactions((prev) => [...newTx, ...prev]);
    }
    return added.length;
  }, []);

  const addRecurring = useCallback(
    (rule: NewRecurringRule) => saveRule({ ...rule, id: uid() }, true),
    [saveRule]
  );

  const updateRecurring = useCallback(
    (id: string, rule: NewRecurringRule) => {
      const existing = recurring.find((r) => r.id === id);
      let lastAddedMonth = existing?.lastAddedMonth;
      // Resuming a paused rule skips the months it was paused for
      if (existing && !existing.active && rule.active) {
        const skipTo = prevMonth(monthKey(new Date()));
        if (!lastAddedMonth || lastAddedMonth < skipTo) lastAddedMonth = skipTo;
      }
      return saveRule({ ...rule, id, lastAddedMonth }, false);
    },
    [recurring, saveRule]
  );

  // Past entries the rule already added are kept as normal transactions
  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const loadDemo = useCallback(() => {
    // import lazily to keep this hook small
    import("../lib/demo").then(({ makeDemoTransactions, makeDemoBudgets }) => {
      setTransactions(makeDemoTransactions());
      setBudgetsState(makeDemoBudgets());
    });
  }, []);

  const clearAll = useCallback(() => {
    clearAllStorage();
    setTransactions([]);
    setBudgetsState({});
    setRecurring([]);
  }, []);

  return useMemo(
    () => ({
      transactions,
      budgets,
      recurring,
      autoAddedOnLoad: initial.autoAdded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      setBudgets,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      loadDemo,
      clearAll,
    }),
    [
      transactions,
      budgets,
      recurring,
      initial.autoAdded,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      setBudgets,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      loadDemo,
      clearAll,
    ]
  );
}
