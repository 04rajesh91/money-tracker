import { ArrowDownCircle, ArrowUpCircle, PiggyBank } from "lucide-react";
import { formatINR } from "../lib/format";

interface Props {
  income: number;
  expense: number;
  savings: number;
}

export function SummaryCards({ income, expense, savings }: Props) {
  const cards = [
    {
      label: "Total Income",
      value: income,
      icon: ArrowDownCircle,
      tint: "from-emerald-500 to-teal-600",
      ring: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Total Expense",
      value: expense,
      icon: ArrowUpCircle,
      tint: "from-rose-500 to-red-600",
      ring: "bg-rose-50",
      text: "text-rose-700",
    },
    {
      label: "Savings",
      value: savings,
      icon: PiggyBank,
      tint: "from-blue-500 to-indigo-600",
      ring: "bg-blue-50",
      text: "text-blue-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isNeg = c.value < 0;
        return (
          <div
            key={c.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {c.label}
              </span>
              <div
                className={`w-9 h-9 rounded-full ${c.ring} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${c.text}`} />
              </div>
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isNeg ? "text-rose-600" : "text-slate-800"
              }`}
            >
              {formatINR(c.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
