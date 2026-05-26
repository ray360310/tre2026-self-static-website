const tabs = ["我的行程", "衝突分析", "TRE2026 活動"] as const;

export default function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ef_0,_#f5f1ea_55%,_#efe7dd_100%)] px-5 py-8 text-slate-800">
      <section className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-[2rem] bg-white/70 p-6 shadow-[0_20px_60px_rgba(120,74,24,0.12)] backdrop-blur">
        <header className="flex flex-col gap-1">
          <p className="m-0 text-sm font-bold uppercase tracking-[0.08em] text-amber-700">
            TRE2026
          </p>
          <h1 className="m-0 text-3xl font-semibold text-slate-900">
            Mobile Planner
          </h1>
        </header>
        <nav aria-label="Primary" className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <span
              key={tab}
              className="rounded-full border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              {tab}
            </span>
          ))}
        </nav>
      </section>
    </main>
  );
}
