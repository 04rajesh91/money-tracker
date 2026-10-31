import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CATEGORY_COLORS, type Transaction } from "../lib/types";
import { formatINR } from "../lib/format";
import { EmptyChart } from "./EmptyChart";

interface Props {
  transactions: Transaction[]; // already filtered to period + expense type
}

export function ExpenseDonut({ transactions }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return <EmptyChart message="No expenses in this period to chart." />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Expenses by Category
      </h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-1/2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={CATEGORY_COLORS[d.name] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatINR(Number(v))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
              Total
            </span>
            <span className="text-base font-bold text-slate-800">
              {formatINR(total)}
            </span>
          </div>
        </div>
        <ul className="flex-1 w-full space-y-2">
          {data.map((d) => (
            <li
              key={d.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[d.name] ?? "#94a3b8",
                  }}
                />
                {d.name}
              </span>
              <span className="font-medium text-slate-800">
                {formatINR(d.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
