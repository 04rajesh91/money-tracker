import { Pencil, Repeat, Trash2 } from "lucide-react";
import { CATEGORY_COLORS, type Transaction } from "../lib/types";
import { formatINR } from "../lib/format";

interface Props {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RecentTransactions({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-400">
          No transactions in this period yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">
          Recent Transactions
        </h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {transactions.map((t) => {
          const isIncome = t.type === "income";
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[t.category] ?? "#94a3b8",
                }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800 min-w-0">
                  <span className="truncate">{t.category}</span>
                  {t.recurringId && (
                    <Repeat
                      className="w-3.5 h-3.5 text-sky-500 shrink-0"
                      aria-label="Added automatically by a recurring entry"
                    />
                  )}
                </div>
                <span className="block text-xs text-slate-400 truncate">
                  {formatDate(t.date)}
                  {t.note ? ` · ${t.note}` : ""}
                </span>
              </div>
              <span
                className={`text-sm font-semibold shrink-0 ${
                  isIncome ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatINR(t.amount).replace("-", "")}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(t.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
