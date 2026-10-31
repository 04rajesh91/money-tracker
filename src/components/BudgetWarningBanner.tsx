import { AlertTriangle } from "lucide-react";

interface Warning {
  category: string;
  percent: number;
}

interface Props {
  warnings: Warning[];
}

export function BudgetWarningBanner({ warnings }: Props) {
  if (warnings.length === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-sm text-amber-800">
        <p className="font-semibold mb-1">Budget alert</p>
        <ul className="space-y-0.5">
          {warnings.map((w) => (
            <li key={w.category}>
              <span className="font-medium">{w.category}</span> is at{" "}
              <span className="font-semibold">{w.percent}%</span> of its monthly
              budget.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
