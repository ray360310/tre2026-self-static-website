interface DataErrorStateProps {
  errors: string[];
}

export function DataErrorState({ errors }: DataErrorStateProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8ef_0,_#f5f1ea_55%,_#efe7dd_100%)] px-4 py-6 text-slate-800">
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-[2rem] bg-white/90 p-5 shadow-[0_20px_60px_rgba(120,74,24,0.12)]">
        <header className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
            TRE2026
          </p>
          <h1 className="text-xl font-semibold text-slate-950">資料讀取失敗</h1>
        </header>
        <p className="text-sm text-slate-600">
          請檢查本地 JSON 內容，修正後再重新 build。
        </p>
        <ul className="space-y-2 rounded-[1.25rem] bg-rose-50 px-4 py-4 text-sm text-rose-900 ring-1 ring-rose-200">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
