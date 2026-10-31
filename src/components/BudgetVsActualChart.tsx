import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EXPENSE_CATEGORIES,
  type Budgets,
  type Transaction,
} from "../lib/types";
import { formatINR, formatINRCompact } from "../lib/format";
import { EmptyChart } from "./EmptyChart";

interface Props {
  transactions: Transaction[]; // filtered to selected month
  budgets: Budgets;
}

export function BudgetVsActualChart({ transactions, budgets }: Props) {
  const data = useMemo(() => {
    const spent = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      spent.set(t.category, (spent.get(t.category) ?? 0) + t.amount);
    }
    return EXPENSE_CATEGORIES.map((cat) => ({
      name: cat,
      Spent: Math.round((spent.get(cat) ?? 0) * 100) / 100,
      Budget: Math.round((budgets[cat] ?? 0) * 100) / 100,
    })).filter((d) => d.Spent > 0 || d.Budget > 0);
  }, [transactions, budgets]);

  if (data.length === 0) {
    return (
      <EmptyChart message="No spending to compare in this month." />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Budget vs Actual
      </h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              interval={0}
              angle={-40}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(v) => formatINRCompact(Number(v))}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              formatter={(v) => formatINR(Number(v))}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Bar
              dataKey="Budget"
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            />
            <Bar
              dataKey="Spent"
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            >
              {data.map((d) => {
                const pct =
                  d.Budget > 0 ? (d.Spent / d.Budget) * 100 : 0;
                const color =
                  d.Budget === 0
                    ? "#94a3b8"
                    : pct >= 100
                    ? "#ef4444"
                    : pct >= 80
                    ? "#f59e0b"
                    : "#22c55e";
                return <Cell key={d.name} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-300" /> Budget
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Under 80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-500" /> 80–99%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-rose-500" /> 100%+
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-400" /> No budget
        </span>
      </div>
    </div>
  );
}
