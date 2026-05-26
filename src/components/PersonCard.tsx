import type { PersonRecord } from "../types/data";

interface PersonCardProps {
  person: PersonRecord;
}

export function PersonCard({ person }: PersonCardProps) {
  return (
    <article className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">{person.name}</p>
      {person.group ? <p className="mt-1 text-xs text-slate-500">{person.group}</p> : null}
      {person.notes ? <p className="mt-2 text-xs text-slate-600">{person.notes}</p> : null}
    </article>
  );
}
