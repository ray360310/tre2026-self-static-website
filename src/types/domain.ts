import type { EventRecord, EventType } from "./data";

export interface NormalizedScheduleEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  peopleIds: EventRecord["peopleIds"];
  start: string | null;
  end: string | null;
  startMinutes: number | null;
  endMinutes: number | null;
}

export interface CandidateConflictAnalysis {
  candidateEventId: string;
  conflictingEventIds: string[];
  purchasedConflictCount: number;
  affectsGoldCard: boolean;
  affectsSilverCard: boolean;
  hasConflict: boolean;
}
