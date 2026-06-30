import type { UserScheduleEntry, UserScheduleRecord } from "../types/userSchedule";

const STORAGE_KEY = "tre2026-user-schedule";

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export function createEmptyUserSchedule(): UserScheduleRecord {
  return {
    version: 1,
    purchasedEntries: [],
    candidateEntries: [],
    updatedAt: null
  };
}

function isScheduleEntry(value: unknown): value is UserScheduleEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    record.sourceType === "official" &&
    typeof record.officialEventId === "string" &&
    typeof record.officialEventTitle === "string" &&
    typeof record.selectionLabel === "string" &&
    typeof record.date === "string" &&
    typeof record.start === "string" &&
    typeof record.end === "string" &&
    (typeof record.vendorName === "string" || record.vendorName === null) &&
    Array.isArray(record.peopleNames) &&
    record.peopleNames.every((value) => typeof value === "string") &&
    (typeof record.notes === "string" || record.notes === null) &&
    typeof record.sourceUrl === "string"
  );
}

function parseSchedule(value: unknown): UserScheduleRecord {
  if (typeof value !== "object" || value === null) {
    return createEmptyUserSchedule();
  }

  const record = value as Record<string, unknown>;

  return {
    version: 1,
    purchasedEntries: Array.isArray(record.purchasedEntries)
      ? record.purchasedEntries.filter(isScheduleEntry)
      : [],
    candidateEntries: Array.isArray(record.candidateEntries)
      ? record.candidateEntries.filter(isScheduleEntry)
      : [],
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null
  };
}

function getStorage(): StorageLike | null {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  const candidate = globalThis.localStorage as Partial<StorageLike> | undefined;

  if (
    !candidate ||
    typeof candidate.getItem !== "function" ||
    typeof candidate.setItem !== "function"
  ) {
    return null;
  }

  return candidate as StorageLike;
}

export function loadUserSchedule(): UserScheduleRecord {
  const storage = getStorage();

  if (!storage) {
    return createEmptyUserSchedule();
  }

  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) {
    return createEmptyUserSchedule();
  }

  try {
    return parseSchedule(JSON.parse(raw));
  } catch {
    return createEmptyUserSchedule();
  }
}

export function saveUserSchedule(schedule: UserScheduleRecord): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export function togglePurchasedEntry(
  schedule: UserScheduleRecord,
  entry: UserScheduleEntry
): UserScheduleRecord {
  const hasEntry = schedule.purchasedEntries.some((item) => item.id === entry.id);

  return {
    version: 1,
    purchasedEntries: hasEntry
      ? schedule.purchasedEntries.filter((item) => item.id !== entry.id)
      : [...schedule.purchasedEntries, entry],
    candidateEntries: schedule.candidateEntries,
    updatedAt: new Date().toISOString()
  };
}

export function addPurchasedEntry(
  schedule: UserScheduleRecord,
  entry: UserScheduleEntry
): UserScheduleRecord {
  if (schedule.purchasedEntries.some((item) => item.id === entry.id)) {
    return schedule;
  }

  return {
    version: 1,
    purchasedEntries: [...schedule.purchasedEntries, entry],
    candidateEntries: schedule.candidateEntries,
    updatedAt: new Date().toISOString()
  };
}

export function removePurchasedEntry(
  schedule: UserScheduleRecord,
  entryId: string
): UserScheduleRecord {
  return {
    version: 1,
    purchasedEntries: schedule.purchasedEntries.filter((item) => item.id !== entryId),
    candidateEntries: schedule.candidateEntries,
    updatedAt: new Date().toISOString()
  };
}

export function addCandidateEntry(
  schedule: UserScheduleRecord,
  entry: UserScheduleEntry
): UserScheduleRecord {
  if (schedule.candidateEntries.some((item) => item.id === entry.id)) {
    return schedule;
  }

  return {
    version: 1,
    purchasedEntries: schedule.purchasedEntries,
    candidateEntries: [...schedule.candidateEntries, entry],
    updatedAt: new Date().toISOString()
  };
}

export function removeCandidateEntry(
  schedule: UserScheduleRecord,
  entryId: string
): UserScheduleRecord {
  return {
    version: 1,
    purchasedEntries: schedule.purchasedEntries,
    candidateEntries: schedule.candidateEntries.filter((item) => item.id !== entryId),
    updatedAt: new Date().toISOString()
  };
}
