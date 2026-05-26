import { useId, useState } from "react";
import type { ReactNode } from "react";

export interface TabDefinition {
  id: string;
  label: string;
  heading: string;
  content: ReactNode;
}

interface TabShellProps {
  tabs: TabDefinition[];
}

export function TabShell({ tabs }: TabShellProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const shellId = useId();
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ef_0,_#f5f1ea_55%,_#efe7dd_100%)] px-4 py-6 text-slate-800">
      <section className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-[2rem] bg-white/85 p-4 shadow-[0_20px_60px_rgba(120,74,24,0.12)] backdrop-blur sm:p-6">
        <header className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">TRE2026</p>
          <h1 className="text-2xl font-semibold text-slate-950">Mobile Planner</h1>
        </header>
        <div
          role="tablist"
          aria-label="主功能頁籤"
          className="grid grid-cols-3 gap-2 rounded-[1.4rem] bg-amber-50 p-1.5"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                id={`${shellId}-${tab.id}-tab`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`${shellId}-${tab.id}-panel`}
                className={`rounded-[1rem] px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <section
          id={`${shellId}-${activeTab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${shellId}-${activeTab.id}-tab`}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-slate-950">{activeTab.heading}</h2>
          {activeTab.content}
        </section>
      </section>
    </main>
  );
}
