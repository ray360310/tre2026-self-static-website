export const EVENT_TYPES = [
  "purchased",
  "candidate",
  "official",
  "card-benefit"
] as const;

export const EVENT_STATUSES = ["confirmed", "planned", "unreleased"] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface PersonRecord {
  id: string;
  name: string;
  group: string | null;
  bio: string | null;
  tags: string[];
  notes: string | null;
  image: string | null;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  start: string | null;
  end: string | null;
  type: EventType;
  peopleIds: string[];
  description: string | null;
  location: string | null;
  source: string | null;
  status: EventStatus;
  notes: string | null;
}

export interface CardOwnership {
  gold: number;
  silver: number;
}

export interface PendingCardBenefitPreference {
  cardType: "gold" | "silver";
  preferredPeopleIds: string[];
  desiredTimeSlots: string[];
  notes: string | null;
}

export interface MyPlanRecord {
  ownedCards: CardOwnership;
  purchasedEventIds: string[];
  candidateEventIds: string[];
  pendingCardBenefitPreferences: PendingCardBenefitPreference[];
  preferredPeopleIds: string[];
  preferredTimeSlotNotes: string[];
}

export interface RulesRecord {
  overlapRequiresSameDate: boolean;
  overlapRequiresTimeWindowIntersection: boolean;
  goldCardConflictEventIds: string[];
  silverCardConflictEventIds: string[];
}

export interface AppData {
  people: PersonRecord[];
  events: EventRecord[];
  myPlan: MyPlanRecord;
  rules: RulesRecord;
  peopleById: Record<string, PersonRecord>;
  eventsById: Record<string, EventRecord>;
  purchasedEvents: EventRecord[];
  candidateEvents: EventRecord[];
}
