import eventsJson from "../data/events.json";
import myPlanJson from "../data/my-plan.json";
import officialEventsJson from "../data/official-events.json";
import officialPeopleJson from "../data/official-people.json";
import peopleJson from "../data/people.json";
import rulesJson from "../data/rules.json";
import { ZodError } from "zod";
import type {
  AppData,
  EventRecord,
  PersonRecord,
  RulesRecord,
  MyPlanRecord
} from "../types/data";
import type {
  OfficialEventData,
  OfficialEventRecord,
  OfficialPersonRecord
} from "../types/officialData";
import { eventsSchema, myPlanSchema, peopleSchema, rulesSchema } from "./dataSchemas";

interface AppDataSources {
  people?: unknown;
  events?: unknown;
  myPlan?: unknown;
  rules?: unknown;
}

type SafeParseSuccess = {
  ok: true;
  data: AppData;
};

type SafeParseFailure = {
  ok: false;
  errors: string[];
};

export type SafeParseAppDataResult = SafeParseSuccess | SafeParseFailure;

function parseOfficialPersonRecord(value: unknown): OfficialPersonRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid official person record");
  }

  const record = value as Record<string, unknown>;

  if (typeof record.id !== "string" || typeof record.name !== "string") {
    throw new Error("Official person record must contain id and name");
  }

  return {
    id: record.id,
    name: record.name,
    image: typeof record.image === "string" ? record.image : null,
    sourceUrl: typeof record.sourceUrl === "string" ? record.sourceUrl : null
  };
}

function parseOfficialEventRecord(value: unknown): OfficialEventRecord {
  if (typeof value !== "object" || value === null) {
    throw new Error("Invalid official event record");
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.sourceUrl !== "string" ||
    typeof record.fullContent !== "string"
  ) {
    throw new Error("Official event record is missing required fields");
  }

  return {
    id: record.id,
    title: record.title,
    bannerImageUrl:
      typeof record.bannerImageUrl === "string" ? record.bannerImageUrl : null,
    sourceUrl: record.sourceUrl,
    vendorName: typeof record.vendorName === "string" ? record.vendorName : null,
    actressNames: Array.isArray(record.actressNames)
      ? record.actressNames.filter((name): name is string => typeof name === "string")
      : [],
    priceTags: Array.isArray(record.priceTags)
      ? record.priceTags.filter((tag): tag is string => typeof tag === "string")
      : [],
    fullContent: record.fullContent
  };
}

function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function assertUniqueIds<T extends { id: string }>(items: T[], label: string): void {
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }

    ids.add(item.id);
  }
}

function assertKnownIds(
  ids: string[],
  knownIds: Set<string>,
  label: string,
  entityLabel: string
): void {
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new Error(`Unknown ${entityLabel} id in ${label}: ${id}`);
    }
  }
}

function assertUniqueValues(values: string[], label: string): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} id: ${value}`);
    }

    seen.add(value);
  }
}

function resolveEventIds(
  eventIds: string[],
  eventsById: Record<string, EventRecord>,
  label: string
): EventRecord[] {
  return eventIds.map((eventId) => {
    const event = eventsById[eventId];

    if (!event) {
      throw new Error(`Unknown event id in ${label}: ${eventId}`);
    }

    return event;
  });
}

function compareEventTimes(left: EventRecord, right: EventRecord): number {
  return [
    left.date.localeCompare(right.date),
    (left.start ?? "").localeCompare(right.start ?? ""),
    (left.end ?? "").localeCompare(right.end ?? ""),
    left.title.localeCompare(right.title)
  ].find((result) => result !== 0) ?? 0;
}

export function parseAppData(overrides: AppDataSources = {}): AppData {
  const people = peopleSchema.parse(overrides.people ?? peopleJson) as PersonRecord[];
  const events = eventsSchema.parse(overrides.events ?? eventsJson) as EventRecord[];
  const myPlan = myPlanSchema.parse(overrides.myPlan ?? myPlanJson) as MyPlanRecord;
  const rules = rulesSchema.parse(overrides.rules ?? rulesJson) as RulesRecord;

  assertUniqueIds(people, "person");
  assertUniqueIds(events, "event");

  const peopleById = indexById(people);
  const eventsById = indexById(events);
  const personIds = new Set(people.map((person) => person.id));
  const eventIds = new Set(events.map((event) => event.id));

  for (const event of events) {
    assertKnownIds(event.peopleIds, personIds, `event ${event.id}`, "person");
  }

  assertUniqueValues(myPlan.purchasedEventIds, "my plan purchasedEventIds");
  assertUniqueValues(myPlan.candidateEventIds, "my plan candidateEventIds");
  assertUniqueValues(myPlan.preferredPeopleIds, "my plan preferredPeopleIds");

  assertKnownIds(myPlan.preferredPeopleIds, personIds, "my plan preferredPeopleIds", "person");

  for (const preference of myPlan.pendingCardBenefitPreferences) {
    assertKnownIds(
      preference.preferredPeopleIds,
      personIds,
      `pending ${preference.cardType} card preference`,
      "person"
    );
  }

  assertKnownIds(
    myPlan.purchasedEventIds,
    eventIds,
    "my plan purchasedEventIds",
    "event"
  );
  assertKnownIds(
    myPlan.candidateEventIds,
    eventIds,
    "my plan candidateEventIds",
    "event"
  );
  assertKnownIds(
    rules.goldCardConflictEventIds,
    eventIds,
    "gold card conflict rules",
    "event"
  );
  assertKnownIds(
    rules.silverCardConflictEventIds,
    eventIds,
    "silver card conflict rules",
    "event"
  );

  const purchasedEvents = resolveEventIds(
    myPlan.purchasedEventIds,
    eventsById,
    "my plan purchasedEventIds"
  ).sort(compareEventTimes);
  const candidateEvents = resolveEventIds(
    myPlan.candidateEventIds,
    eventsById,
    "my plan candidateEventIds"
  ).sort(compareEventTimes);

  return {
    people,
    events,
    myPlan,
    rules,
    peopleById,
    eventsById,
    purchasedEvents,
    candidateEvents
  };
}

function formatError(error: unknown): string[] {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "data";

      return `${path}: ${issue.message}`;
    });
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ["Unknown data error"];
}

export function safeParseAppData(
  overrides: AppDataSources = {}
): SafeParseAppDataResult {
  try {
    return {
      ok: true,
      data: parseAppData(overrides)
    };
  } catch (error) {
    return {
      ok: false,
      errors: formatError(error)
    };
  }
}

export function loadOfficialEventData(): OfficialEventData {
  const events = Array.isArray(officialEventsJson)
    ? officialEventsJson.map(parseOfficialEventRecord)
    : [];
  const people = Array.isArray(officialPeopleJson)
    ? officialPeopleJson.map(parseOfficialPersonRecord)
    : [];

  assertUniqueIds(events, "official event");
  assertUniqueIds(people, "official person");

  return {
    events,
    people,
    peopleById: indexById(people)
  };
}
