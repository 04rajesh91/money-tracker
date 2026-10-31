import { useEffect, useMemo, useRef, useState } from "react";
import { Check, IndianRupee } from "lucide-react";
import type { Store } from "../hooks/useStore";
import {
  categoriesForType,
  type Transaction,
  type TransactionType,
} from "../lib/types";
import { todayISO } from "../lib/periods";
import { TopNav } from "../components/TopNav";

interface Props {
  store: Store;
  editingId?: string | null;
  onNavigate: (tab: "dashboard" | "add" | "budgets") => void;
  onDoneEditing: () => void;
}

export function AddTransaction({
  store,
  editingId,
  onNavigate,
  onDoneEditing,
}: Props) {
  const editing = useMemo(
    () => (editingId ? store.getTransaction(editingId) : undefined),
    [editingId, store]
  );

  const [type, setType] = useState<TransactionType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState<string>(
    editing ? String(editing.amount) : ""
  );
  const [category, setCategory] = useState<string>(
    editing?.category ?? categoriesForType("expense")[0]
  );
  const [date, setDate] = useState<string>(editing?.date ?? todayISO());
  const [note, setNote] = useState<string>(editing?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  // Guards against double submits (a ref updates synchronously, unlike state)
  const submittedRef = useRef(false);
  const redirectTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  const cats = categoriesForType(type);

  // When type changes, reset category to a valid one for that type
  const onTypeChange = (t: TransactionType) => {
    setType(t);
    if (!categoriesForType(t).includes(category)) {
      setCategory(categoriesForType(t)[0]);
    }
  };

  const amountNum = Number(amount);
  const valid = amount.trim() !== "" && !isNaN(amountNum) && amountNum > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    if (!valid) {
      setError("Please enter an amount greater than zero.");
      return;
    }
    const payload: Omit<Transaction, "id"> = {
      type,
      amount: Math.round(amountNum * 100) / 100,
      category,
      date,
      note: note.trim() || undefined,
    };
    submittedRef.current = true;
    if (editing) {
      store.updateTransaction(editing.id, payload);
      onDoneEditing();
      onNavigate("dashboard");
    } else {
      store.addTransaction(payload);
      setFlash(true);
      redirectTimer.current = window.setTimeout(
        () => onNavigate("dashboard"),
        700
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav active="add" onNavigate={onNavigate} />
      <main className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-slate-800 mb-4">
          {editing ? "Edit Transaction" : "Add Transaction"}
        </h1>

        {flash && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">
              Transaction saved. Returning to dashboard…
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5"
        >
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTypeChange(t)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-colors ${
                    type === t
                      ? t === "expense"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Amount
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category quick-select chips */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === c
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Note <span className="text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Groceries for the week"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={flash}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {editing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
