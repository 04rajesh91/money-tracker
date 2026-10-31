import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { Store } from "../hooks/useStore";
import { EXPENSE_CATEGORIES } from "../lib/types";
import { getMonthRange, inMonth } from "../lib/periods";
import { formatINR } from "../lib/format";
import { TopNav } from "../components/TopNav";

interface Props {
  store: Store;
  onNavigate: (tab: "dashboard" | "add" | "budgets") => void;
}

interface RowState {
  limit: string;
}

function barColor(pct: number): string {
  if (pct >= 100) return "bg-rose-500";
  if (pct >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function Budgets({ store, onNavigate }: Props) {
  const monthRange = useMemo(() => getMonthRange(new Date()), []);
  const spent = useMemo(() => {
    const map = new Map<string, number>();
    const monthTx = store.transactions.filter((t) => inMonth(t, monthRange));
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return map;
  }, [store.transactions, monthRange]);

  const [draft, setDraft] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    for (const c of EXPENSE_CATEGORIES) {
      init[c] = { limit: String(store.budgets[c] ?? "") };
    }
    return init;
  });
  // Save on every change so edits are never lost when leaving the page
  const updateLimit = (cat: string, value: string) => {
    const nextDraft = { ...draft, [cat]: { limit: value } };
    setDraft(nextDraft);
    const next: Record<string, number> = {};
    for (const c of EXPENSE_CATEGORIES) {
      const v = Number(nextDraft[c].limit);
      next[c] = isNaN(v) || v < 0 ? 0 : Math.round(v * 100) / 100;
    }
    store.setBudgets(next);
  };

  const totalBudget = useMemo(
    () =>
      EXPENSE_CATEGORIES.reduce(
        (s, c) => s + (Number(draft[c].limit) || 0),
        0
      ),
    [draft]
  );
  const totalSpent = useMemo(
    () => EXPENSE_CATEGORIES.reduce((s, c) => s + (spent.get(c) ?? 0), 0),
    [spent]
  );
  // Only compare against categories that actually have a budget
  const budgetedSpent = useMemo(
    () =>
      EXPENSE_CATEGORIES.reduce(
        (s, c) => s + ((Number(draft[c].limit) || 0) > 0 ? spent.get(c) ?? 0 : 0),
        0
      ),
    [draft, spent]
  );
  const totalRemaining = totalBudget - budgetedSpent;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav active="budgets" onNavigate={onNavigate} />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Monthly Budgets</h1>
          <p className="text-xs text-slate-400">{monthRange.label}</p>
        </div>

        {/* Totals strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-sm">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">
              Total Budget
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {formatINR(totalBudget)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-sm">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">
              Spent
            </p>
            <p className="text-sm font-bold text-rose-600 mt-1">
              {formatINR(totalSpent)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-sm">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide">
              Remaining
            </p>
            <p
              className={`text-sm font-bold mt-1 ${
                totalBudget === 0
                  ? "text-slate-400"
                  : totalRemaining < 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {totalBudget === 0 ? "—" : formatINR(totalRemaining)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {EXPENSE_CATEGORIES.map((c) => {
            const limit = Number(draft[c].limit) || 0;
            const s = spent.get(c) ?? 0;
            const pct = limit > 0 ? (s / limit) * 100 : 0;
            const remaining = limit - s;
            return (
              <div
                key={c}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    {c}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft[c].limit}
                      onChange={(e) => updateLimit(c, e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1.5 text-sm rounded-lg border border-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-400">/month</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(
                      pct
                    )}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>
                    Spent{" "}
                    <span className="font-medium text-slate-700">
                      {formatINR(s)}
                    </span>
                  </span>
                  <span>
                    {limit > 0 ? (
                      <>
                        Remaining{" "}
                        <span
                          className={`font-medium ${
                            remaining < 0 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {formatINR(remaining)}
                        </span>{" "}
                        ({Math.round(pct)}%)
                      </>
                    ) : (
                      <span className="text-slate-400">No budget set</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Check className="w-3.5 h-3.5" /> Changes are saved automatically.
        </p>
      </main>
    </div>
  );
}
