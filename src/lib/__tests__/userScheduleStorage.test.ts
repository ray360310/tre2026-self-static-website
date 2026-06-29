import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  createEmptyUserSchedule,
  loadUserSchedule,
  saveUserSchedule,
  togglePurchasedEntry
} from "../userScheduleStorage";
import type { PurchasedScheduleEntry } from "../../types/userSchedule";

function createEntry(overrides: Partial<PurchasedScheduleEntry> = {}): PurchasedScheduleEntry {
  return {
    id: "entry-act-hinano-20260703-1330",
    sourceType: "official",
    officialEventId: "jkface-event-315",
    officialEventTitle: "ACT 激情水鑽感謝祭",
    selectionLabel: "雛乃花音 第四場",
    date: "2026/07/03",
    start: "13:30",
    end: "14:10",
    vendorName: "ACT",
    peopleNames: ["雛乃花音"],
    notes: null,
    sourceUrl: "https://jkface.net/events/315",
    ...overrides
  };
}

describe("userScheduleStorage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      clear: () => {
        store.clear();
      }
    });

    localStorage.clear();
  });

  test("returns an empty schedule when local storage has no data", () => {
    expect(loadUserSchedule()).toEqual(createEmptyUserSchedule());
  });

  test("loads a previously saved schedule", () => {
    const schedule = {
      version: 1 as const,
      purchasedEntries: [createEntry()],
      updatedAt: "2026-06-30T12:00:00.000Z"
    };

    saveUserSchedule(schedule);

    expect(loadUserSchedule()).toEqual(schedule);
  });

  test("falls back to an empty schedule when local storage is corrupted", () => {
    localStorage.setItem("tre2026-user-schedule", "{not-json");

    expect(loadUserSchedule()).toEqual(createEmptyUserSchedule());
  });

  test("adds and removes purchased entries by id", () => {
    const entry = createEntry();
    const added = togglePurchasedEntry(createEmptyUserSchedule(), entry);

    expect(added.purchasedEntries).toEqual([entry]);

    const removed = togglePurchasedEntry(added, entry);

    expect(removed.purchasedEntries).toEqual([]);
  });
});
