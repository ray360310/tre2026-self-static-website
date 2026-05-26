import type { EventRecord } from "../../types/data";

interface CatalogFiltersProps {
  dates: string[];
  people: Array<{ id: string; name: string }>;
  types: EventRecord["type"][];
  selectedDate: string;
  selectedPersonId: string;
  selectedType: EventRecord["type"] | "";
  onDateChange: (value: string) => void;
  onPersonChange: (value: string) => void;
  onTypeChange: (value: EventRecord["type"] | "") => void;
}

export function CatalogFilters({
  dates,
  people,
  types,
  selectedDate,
  selectedPersonId,
  selectedType,
  onDateChange,
  onPersonChange,
  onTypeChange
}: CatalogFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">日期篩選</span>
        <select
          aria-label="日期篩選"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部日期</option>
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">人物篩選</span>
        <select
          aria-label="人物篩選"
          value={selectedPersonId}
          onChange={(event) => onPersonChange(event.target.value)}
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部人物</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-900">活動類型</span>
        <select
          aria-label="活動類型"
          value={selectedType}
          onChange={(event) =>
            onTypeChange(event.target.value as EventRecord["type"] | "")
          }
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
        >
          <option value="">全部類型</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
