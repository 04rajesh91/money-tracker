import { useState } from "react";
import { useStore } from "./hooks/useStore";
import { Dashboard } from "./screens/Dashboard";
import { AddTransaction } from "./screens/AddTransaction";
import { Budgets } from "./screens/Budgets";
import { Recurring } from "./screens/Recurring";
import type { Tab } from "./components/TopNav";

function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = (t: Tab) => {
    if (t !== "add") setEditingId(null);
    setTab(t);
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setTab("add");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1">
        {tab === "dashboard" && (
          <Dashboard
            store={store}
            onNavigate={navigate}
            onEditTransaction={startEdit}
          />
        )}
        {tab === "add" && (
          <AddTransaction
            store={store}
            editingId={editingId}
            onNavigate={navigate}
            onDoneEditing={() => setEditingId(null)}
          />
        )}
        {tab === "budgets" && <Budgets store={store} onNavigate={navigate} />}
        {tab === "recurring" && (
          <Recurring store={store} onNavigate={navigate} />
        )}
      </div>
      <footer className="border-t border-slate-200 bg-white">
        <p className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
          Money Tracker – built for the Outskill AI Accelerator Hackathon
        </p>
      </footer>
    </div>
  );
}

export default App;
