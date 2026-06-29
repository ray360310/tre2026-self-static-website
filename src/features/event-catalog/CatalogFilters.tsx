interface CatalogFiltersProps {
  vendors: string[];
  actresses: string[];
  priceTags: string[];
  selectedVendor: string;
  selectedActress: string;
  selectedPriceTag: string;
  onVendorChange: (value: string) => void;
  onActressChange: (value: string) => void;
  onPriceTagChange: (value: string) => void;
  onReset: () => void;
}

export function CatalogFilters({
  vendors,
  actresses,
  priceTags,
  selectedVendor,
  selectedActress,
  selectedPriceTag,
  onVendorChange,
  onActressChange,
  onPriceTagChange,
  onReset
}: CatalogFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(255,247,239,0.96)_100%)] px-4 py-4 shadow-[0_18px_40px_rgba(148,84,24,0.08)] ring-1 ring-amber-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            Filter
          </p>
          <h2 className="text-base font-semibold text-slate-950">快速篩選官方活動</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
        >
          清除條件
        </button>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">廠商篩選</span>
        <select
          aria-label="廠商篩選"
          value={selectedVendor}
          onChange={(event) => onVendorChange(event.target.value)}
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部廠商</option>
          {vendors.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">女優篩選</span>
        <select
          aria-label="女優篩選"
          value={selectedActress}
          onChange={(event) => onActressChange(event.target.value)}
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部女優</option>
          {actresses.map((actress) => (
            <option key={actress} value={actress}>
              {actress}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">票種篩選</span>
        <select
          aria-label="票種篩選"
          value={selectedPriceTag}
          onChange={(event) => onPriceTagChange(event.target.value)}
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部票種</option>
          {priceTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
