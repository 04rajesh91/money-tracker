import { Wallet } from "lucide-react";

interface Props {
  active: "dashboard" | "add" | "budgets";
  onNavigate: (tab: "dashboard" | "add" | "budgets") => void;
}

const TABS: { id: Props["active"]; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add Transaction" },
  { id: "budgets", label: "Budgets" },
];

export function TopNav({ active, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Money Tracker
            </span>
          </div>
        </div>
        <nav className="flex -mb-px overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === t.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
