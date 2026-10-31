import { useState } from "react";
import { Check, IndianRupee, Pause, Pencil, Play, Repeat, Trash2 } from "lucide-react";
import type { NewRecurringRule, Store } from "../hooks/useStore";
import {
  CATEGORY_COLORS,
  categoriesForType,
  type RecurringRule,
  type TransactionType,
} from "../lib/types";
import { clampDay, monthKey } from "../lib/recurring";
import { formatINR } from "../lib/format";
import { TopNav, type Tab } from "../components/TopNav";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface Props {
  store: Store;
  onNavigate: (tab: Tab) => void;
}

interface FormState {
  type: TransactionType;
  amount: string;
  category: string;
  dayOfMonth: string;
  startMonth: string;
  note: string;
}

function emptyForm(): FormState {
  return {
    type: "expense",
    amount: "",
    category: categoriesForType("expense")[0],
    dayOfMonth: "1",
    startMonth: monthKey(new Date()),
    note: "",
  };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function Recurring({ store, onNavigate }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const cats = categoriesForType(form.type);
  const set = (patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setError(null);
  };

  const onTypeChange = (t: TransactionType) => {
    set({
      type: t,
      category: categoriesForType(t).includes(form.category)
        ? form.category
        : categoriesForType(t)[0],
    });
  };

  const startEdit = (r: RecurringRule) => {
    setEditingId(r.id);
    setForm({
      type: r.type,
      amount: String(r.amount),
      category: r.category,
      dayOfMonth: String(r.dayOfMonth),
      startMonth: r.startMonth,
      note: r.note ?? "",
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.amount.trim() || isNaN(amount) || amount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(form.startMonth)) {
      setError("Please choose a start month.");
      return;
    }
    const existing = editingId
      ? store.recurring.find((r) => r.id === editingId)
      : undefined;
    const rule: NewRecurringRule = {
      type: form.type,
      amount: Math.round(amount * 100) / 100,
      category: form.category,
      dayOfMonth: clampDay(Number(form.dayOfMonth)),
      startMonth: form.startMonth,
      note: form.note.trim() || undefined,
      active: existing?.active ?? true,
    };
    const added = editingId
      ? store.updateRecurring(editingId, rule)
      : store.addRecurring(rule);
    setMessage(
      `${editingId ? "Recurring entry updated." : "Recurring entry saved."}${
        added > 0
          ? ` ${added} ${added === 1 ? "entry was" : "entries were"} already due and added to your transactions.`
          : ""
      }`
    );
    resetForm();
  };

  const toggleActive = (r: RecurringRule) => {
    const { id, lastAddedMonth: _last, ...rest } = r;
    void _last;
    const added = store.updateRecurring(id, { ...rest, active: !r.active });
    setMessage(
      r.active
        ? `Paused "${r.note || r.category}".`
        : `Resumed "${r.note || r.category}".${added > 0 ? " This month's entry was added." : ""}`
    );
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      store.deleteRecurring(confirmDeleteId);
      if (confirmDeleteId === editingId) resetForm();
      setMessage("Recurring entry deleted. Entries it already added were kept.");
    }
    setConfirmDeleteId(null);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";
  const labelClass =
    "block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2";

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav active="recurring" onNavigate={onNavigate} />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Recurring Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Set up salary, rent and bills once. They are added to your
            transactions automatically every month on the chosen day.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="text-sm text-emerald-700">{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              {editingId ? "Edit recurring entry" : "New recurring entry"}
            </h2>
            {editingId && (
              <p className="text-xs text-slate-400 mt-1">
                Changes apply to future months. Entries already added stay as
                they are; edit them from the Dashboard if needed.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-colors ${
                  form.type === t
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

          <div>
            <label className={labelClass}>Amount</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set({ amount: e.target.value })}
                placeholder="0"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set({ category: c })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.category === c
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Day of month</label>
              <select
                value={form.dayOfMonth}
                onChange={(e) => set({ dayOfMonth: e.target.value })}
                className={inputClass}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {ordinal(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Starting from</label>
              <input
                type="month"
                value={form.startMonth}
                onChange={(e) => set({ startMonth: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Note <span className="text-slate-400 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="e.g. Monthly salary"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {editingId ? "Save Changes" : "Add Recurring Entry"}
            </button>
          </div>
        </form>

        {store.recurring.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <Repeat className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              No recurring entries yet. Add your salary or rent above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">
                Your recurring entries
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {store.recurring.map((r) => {
                const isIncome = r.type === "income";
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${
                      r.active ? "" : "opacity-60"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: CATEGORY_COLORS[r.category] ?? "#94a3b8",
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {r.note || r.category}
                      </div>
                      <span className="block text-xs text-slate-400 truncate">
                        {r.category} · every {ordinal(r.dayOfMonth)}
                        {r.active ? "" : " · paused"}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold shrink-0 ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatINR(r.amount)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(r)}
                        className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        aria-label={r.active ? "Pause" : "Resume"}
                        title={r.active ? "Pause" : "Resume"}
                      >
                        {r.active ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(r)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete recurring entry?"
        message="It will stop being added in future months. Entries it already added stay in your transactions."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
