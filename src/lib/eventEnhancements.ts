import enhancementRecords from "../data/event-enhancements.json";
import type {
  EventEnhancementPlan,
  EventEnhancementProfile,
  EventEnhancementRecord
} from "../types/eventEnhancements";

const enhancements = enhancementRecords as EventEnhancementRecord[];

export function getEventEnhancementById(eventId: string): EventEnhancementRecord | null {
  return enhancements.find((record) => record.officialEventId === eventId) ?? null;
}

export function getEnhancementProfiles(eventId: string): EventEnhancementProfile[] {
  return getEventEnhancementById(eventId)?.profiles ?? [];
}

export function getEnhancementPlanOptions(
  eventId: string,
  personName: string
): EventEnhancementPlan[] {
  return (
    getEnhancementProfiles(eventId).find((profile) => profile.personName === personName)?.plans ??
    []
  );
}
