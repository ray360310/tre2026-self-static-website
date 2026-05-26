import type { AppData, EventRecord } from "../types/data";
import type { CandidateConflictAnalysis } from "../types/domain";
import { eventsOverlap, normalizeEvent } from "./normalizeEvents";

function resolveEventsByIds(data: AppData, eventIds: string[]): EventRecord[] {
  return eventIds.map((eventId) => {
    const event = data.eventsById[eventId];

    if (!event) {
      throw new Error(`Unknown event id in conflict rules: ${eventId}`);
    }

    return event;
  });
}

function sortEventIds(eventIds: Iterable<string>): string[] {
  return [...new Set(eventIds)].sort((left, right) => left.localeCompare(right));
}

export function analyzeCandidateConflict(
  data: AppData,
  candidateEventId: string
): CandidateConflictAnalysis {
  const candidateEvent = data.eventsById[candidateEventId];

  if (!candidateEvent) {
    throw new Error(`Unknown candidate event id: ${candidateEventId}`);
  }

  const candidate = normalizeEvent(candidateEvent);
  const purchasedEvents = data.purchasedEvents.map(normalizeEvent);
  const goldCardEvents = resolveEventsByIds(data, data.rules.goldCardConflictEventIds).map(
    normalizeEvent
  );
  const silverCardEvents = resolveEventsByIds(data, data.rules.silverCardConflictEventIds).map(
    normalizeEvent
  );

  const purchasedConflictIds = purchasedEvents
    .filter((event) => event.id !== candidate.id && eventsOverlap(candidate, event))
    .map((event) => event.id);
  const goldConflictIds = goldCardEvents
    .filter((event) => event.id !== candidate.id && eventsOverlap(candidate, event))
    .map((event) => event.id);
  const silverConflictIds = silverCardEvents
    .filter((event) => event.id !== candidate.id && eventsOverlap(candidate, event))
    .map((event) => event.id);

  const conflictingEventIds = sortEventIds([
    ...purchasedConflictIds,
    ...goldConflictIds,
    ...silverConflictIds
  ]);

  return {
    candidateEventId,
    conflictingEventIds,
    purchasedConflictCount: purchasedConflictIds.length,
    affectsGoldCard: goldConflictIds.length > 0,
    affectsSilverCard: silverConflictIds.length > 0,
    hasConflict: conflictingEventIds.length > 0
  };
}
