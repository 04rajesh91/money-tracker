import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Database, Plus, Repeat, Trash2, X } from "lucide-react";
import type { Store } from "../hooks/useStore";
import { getMonthRange, inMonth } from "../lib/periods";
import { TopNav, type Tab } from "../components/TopNav";
import { SummaryCards } from "../components/SummaryCards";
import { ExpenseDonut } from "../components/ExpenseDonut";
import { BudgetVsActualChart } from "../components/BudgetVsActualChart";
import { RecentTransactions } from "../components/RecentTransactions";
import { BudgetWarningBanner } from "../components/BudgetWarningBanner";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface Props {
  store: Store;
  onNavigate: (tab: Tab) => void;
  onEditTransaction: (id: string) => void;
}

export function Dashboard({ store, onNavigate, onEditTransaction }: Props) {
  const [refDate, setRefDate] = useState<Date>(() => new Date());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAutoAdded, setShowAutoAdded] = useState(store.autoAddedOnLoad > 0);

  const range = useMemo(() => getMonthRange(refDate), [refDate]);

  const monthTx = useMemo(
    () => store.transactions.filter((t) => inMonth(t, range)),
    [store.transactions, range]
  );

  const income = useMemo(
    () =>
      monthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const expense = useMemo(
    () =>
      monthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [monthTx]
  );
  const savings = income - expense;

  // Warnings: based on the selected month's spend vs monthly budgets
  const warnings = useMemo(() => {
    const spent = new Map<string, number>();
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      spent.set(t.category, (spent.get(t.category) ?? 0) + t.amount);
    }
    const out: { category: string; percent: number }[] = [];
    for (const [cat, limit] of Object.entries(store.budgets)) {
      if (!limit || limit <= 0) continue;
      const s = spent.get(cat) ?? 0;
      const pct = (s / limit) * 100;
      if (pct >= 80) out.push({ category: cat, percent: Math.round(pct) });
    }
    return out.sort((a, b) => b.percent - a.percent);
  }, [monthTx, store.budgets]);

  const recent = useMemo(
    () =>
      [...monthTx]
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
        .slice(0, 10),
    [monthTx]
  );

  const hasData = store.transactions.length > 0;

  const confirmDelete = () => {
    if (confirmDeleteId) store.deleteTransaction(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const goPrev = () => {
    const d = new Date(refDate);
    d.setMonth(d.getMonth() - 1);
    setRefDate(d);
  };
  const goNext = () => {
    const d = new Date(refDate);
    d.setMonth(d.getMonth() + 1);
    setRefDate(d);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav active="dashboard" onNavigate={onNavigate} />

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-800">
            {range.label}
          </span>
          <button
            onClick={goNext}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {showAutoAdded && (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <Repeat className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
            <p className="text-sm text-sky-800 flex-1">
              <span className="font-semibold">Automation:</span>{" "}
              {store.autoAddedOnLoad} recurring{" "}
              {store.autoAddedOnLoad === 1 ? "entry was" : "entries were"} added
              automatically since your last visit.
            </p>
            <button
              onClick={() => setShowAutoAdded(false)}
              className="p-1 rounded-lg text-sky-500 hover:bg-sky-100"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {warnings.length > 0 && <BudgetWarningBanner warnings={warnings} />}

        {!hasData ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <Database className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Welcome to Money Tracker
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You don't have any transactions yet. Add your first one, or load
              demo data to explore the dashboard.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => onNavigate("add")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Transaction
              </button>
              <button
                onClick={store.loadDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Database className="w-4 h-4" /> Load demo data
              </button>
            </div>
          </div>
        ) : (
          <>
            <SummaryCards income={income} expense={expense} savings={savings} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpenseDonut transactions={monthTx} />
              <BudgetVsActualChart
                transactions={monthTx}
                budgets={store.budgets}
              />
            </div>

            <RecentTransactions
              transactions={recent}
              onEdit={onEditTransaction}
              onDelete={(id) => setConfirmDeleteId(id)}
            />

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all data
              </button>
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete transaction?"
        message="This transaction will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        message="All transactions, budgets and recurring entries will be permanently deleted."
        confirmLabel="Clear all"
        onConfirm={() => {
          store.clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
