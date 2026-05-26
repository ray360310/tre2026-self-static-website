import { ConflictBadge } from "./ConflictBadge";
import type { AppData, EventRecord } from "../types/data";

interface EventCardProps {
  data: AppData;
  event: EventRecord;
  badges?: Array<{ label: string; tone?: "neutral" | "warning" | "danger" }>;
}

const eventTypeLabels: Record<EventRecord["type"], string> = {
  purchased: "已購",
  candidate: "候補",
  official: "官方",
  "card-benefit": "卡福利"
};

const eventStatusLabels: Record<EventRecord["status"], string> = {
  confirmed: "已確認",
  planned: "規劃中",
  unreleased: "未上架"
};

function formatTimeRange(event: EventRecord): string {
  if (event.start && event.end) {
    return `${event.date} ${event.start}-${event.end}`;
  }

  return event.date;
}

export function EventCard({ data, event, badges = [] }: EventCardProps) {
  const people = event.peopleIds
    .map((personId) => data.peopleById[personId]?.name ?? personId)
    .join("、");

  return (
    <article className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            {eventTypeLabels[event.type]}
          </p>
          <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
          <p className="text-sm text-slate-600">{formatTimeRange(event)}</p>
          {people ? <p className="text-sm text-slate-500">{people}</p> : null}
        </div>
        <ConflictBadge label={eventStatusLabels[event.status]} />
      </div>
      {event.description ? <p className="mt-3 text-sm text-slate-600">{event.description}</p> : null}
      {event.notes ? <p className="mt-3 text-sm text-amber-800">{event.notes}</p> : null}
      {badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <ConflictBadge key={`${event.id}-${badge.label}`} label={badge.label} tone={badge.tone} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
