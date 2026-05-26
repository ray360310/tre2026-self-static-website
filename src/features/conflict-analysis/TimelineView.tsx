import { EventCard } from "../../components/EventCard";
import type { AppData, EventRecord } from "../../types/data";

interface TimelineViewProps {
  data: AppData;
  events: EventRecord[];
  selectedEventId?: string;
}

export function TimelineView({ data, events, selectedEventId }: TimelineViewProps) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="relative pl-4">
          <span className="absolute left-0 top-6 h-full w-px bg-amber-200" aria-hidden="true" />
          <span
            className={`absolute left-[-0.2rem] top-5 h-2.5 w-2.5 rounded-full ${
              event.id === selectedEventId ? "bg-rose-500" : "bg-amber-500"
            }`}
            aria-hidden="true"
          />
          <EventCard
            data={data}
            event={event}
            badges={event.id === selectedEventId ? [{ label: "目前比對中", tone: "warning" }] : []}
          />
        </div>
      ))}
    </div>
  );
}
