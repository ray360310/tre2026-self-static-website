export type EnhancementSourceType = "copy" | "image" | "mixed";

export interface EventEnhancementSession {
  sessionId: string;
  date: string;
  start: string;
  end: string;
  label: string;
  outfit: string | null;
  notes: string | null;
  sourceType: EnhancementSourceType;
}

export interface EventEnhancementPlan {
  planCode: string;
  planName: string;
  priceLabel: string | null;
  summary: string | null;
  outfit: string | null;
  sessions: EventEnhancementSession[];
}

export interface EventEnhancementProfile {
  personName: string;
  plans: EventEnhancementPlan[];
}

export interface EventEnhancementRecord {
  officialEventId: string;
  profiles: EventEnhancementProfile[];
}
