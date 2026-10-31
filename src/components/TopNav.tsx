import { Wallet } from "lucide-react";

export type Tab = "dashboard" | "add" | "budgets" | "recurring";

interface Props {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

// `short` is shown on phones so all four tabs fit without scrolling
const TABS: { id: Tab; label: string; short?: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add Transaction", short: "Add" },
  { id: "budgets", label: "Budgets" },
  { id: "recurring", label: "Recurring" },
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
              aria-label={t.label}
              className={`px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active === t.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {t.short ? (
                <>
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </>
              ) : (
                t.label
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
