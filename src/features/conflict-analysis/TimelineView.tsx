import type { ThreeDayCalendarModel } from "./calendarViewModel";

interface TimelineViewProps {
  calendar: ThreeDayCalendarModel;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
}

const PIXELS_PER_HOUR = 80;

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function blockStyle(startMinutes: number, endMinutes: number, minHour: number) {
  const top = ((startMinutes - minHour * 60) / 60) * PIXELS_PER_HOUR;
  const height = ((endMinutes - startMinutes) / 60) * PIXELS_PER_HOUR;

  return {
    top: `${top}px`,
    height: `${Math.max(height, 44)}px`
  };
}

export function TimelineView({ calendar, selectedBlockId, onSelectBlock }: TimelineViewProps) {
  const hours = Array.from(
    { length: Math.max(calendar.maxHour - calendar.minHour, 1) + 1 },
    (_, index) => calendar.minHour + index
  );
  const gridHeight = Math.max((calendar.maxHour - calendar.minHour) * PIXELS_PER_HOUR, PIXELS_PER_HOUR);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[62rem] gap-3">
        {calendar.days.map((day) => (
          <section
            key={day.isoDate}
            data-testid={`calendar-day-${day.isoDate}`}
            className="min-w-[19rem] flex-1 rounded-[1.5rem] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"
          >
            <h3 className="text-base font-semibold text-slate-950">{day.label}</h3>
            <div
              className="relative mt-3 rounded-[1.25rem] bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]"
              style={{ height: `${gridHeight}px` }}
            >
              {hours.slice(0, -1).map((hour) => (
                <div
                  key={`${day.isoDate}-${hour}`}
                  className="absolute inset-x-0 border-t border-dashed border-slate-200"
                  style={{ top: `${(hour - calendar.minHour) * PIXELS_PER_HOUR}px` }}
                >
                  <span className="absolute left-2 top-[-0.65rem] bg-white px-1 text-[11px] font-medium text-slate-400">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}

              {day.blocks.map((block) => {
                const isSelected = block.id === selectedBlockId;

                return (
                  <button
                    key={block.id}
                    type="button"
                    aria-label={`查看 ${block.title} 詳情`}
                    onClick={() => onSelectBlock(block.id)}
                    className={`absolute left-14 right-2 overflow-hidden rounded-2xl border px-3 py-2 text-left shadow-sm transition ${
                      block.kind === "purchased"
                        ? block.conflictLabels.length > 0
                          ? "border-rose-400 bg-rose-50 text-rose-950"
                          : "border-slate-900 bg-slate-900 text-white"
                        : block.kind === "candidate"
                          ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-950"
                          : block.cardType === "gold"
                            ? "border-amber-300 bg-amber-50 text-amber-950"
                            : "border-cyan-300 bg-cyan-50 text-cyan-950"
                    } ${isSelected ? "ring-2 ring-offset-1 ring-slate-900" : ""}`}
                    style={blockStyle(block.startMinutes, block.endMinutes, calendar.minHour)}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-80">
                      {block.subtitle}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-5">{block.title}</h4>
                    <p className="mt-1 text-xs font-medium">
                      {block.start}-{block.end}
                    </p>
                    {block.conflictLabels.map((label) => (
                      <p key={`${block.id}-${label}`} className="mt-1 text-xs font-semibold">
                        {label}
                      </p>
                    ))}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
