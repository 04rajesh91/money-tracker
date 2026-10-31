import { useCallback, useEffect, useMemo, useState } from "react";
import type { Budgets, Transaction } from "../lib/types";
import {
  clearAllStorage,
  loadBudgets,
  loadTransactions,
  saveBudgets,
  saveTransactions,
} from "../lib/storage";

export interface Store {
  transactions: Transaction[];
  budgets: Budgets;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  setBudgets: (b: Budgets) => void;
  loadDemo: () => void;
  clearAll: () => void;
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useStore(): Store {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadTransactions()
  );
  const [budgets, setBudgetsState] = useState<Budgets>(() => loadBudgets());

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

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
  }, []);

  return useMemo(
    () => ({
      transactions,
      budgets,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      setBudgets,
      loadDemo,
      clearAll,
    }),
    [
      transactions,
      budgets,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransaction,
      setBudgets,
      loadDemo,
      clearAll,
    ]
  );
}
