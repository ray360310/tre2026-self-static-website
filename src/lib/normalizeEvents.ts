import type { EventRecord } from "../types/data";
import type { NormalizedScheduleEvent } from "../types/domain";

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return hours * 60 + minutes;
}

export function normalizeEvent(event: EventRecord): NormalizedScheduleEvent {
  const startMinutes = event.start ? parseTimeToMinutes(event.start) : null;
  const endMinutes = event.end ? parseTimeToMinutes(event.end) : null;

  if ((startMinutes === null) !== (endMinutes === null)) {
    throw new Error(`Timed event ${event.id} must provide both start and end times`);
  }

  if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
    throw new Error(`Invalid time window for event ${event.id}`);
  }

  return {
    id: event.id,
    title: event.title,
    date: event.date,
    type: event.type,
    peopleIds: event.peopleIds,
    start: event.start,
    end: event.end,
    startMinutes,
    endMinutes
  };
}

export function normalizeEvents(events: EventRecord[]): NormalizedScheduleEvent[] {
  return events.map(normalizeEvent);
}

export function eventsOverlap(
  left: NormalizedScheduleEvent,
  right: NormalizedScheduleEvent
): boolean {
  if (left.date !== right.date) {
    return false;
  }

  if (
    left.startMinutes === null ||
    left.endMinutes === null ||
    right.startMinutes === null ||
    right.endMinutes === null
  ) {
    return false;
  }

  return left.startMinutes < right.endMinutes && left.endMinutes > right.startMinutes;
}
