import { describe, expect, test } from "vitest";

import { safeParseAppData } from "../loadData";

describe("safeParseAppData", () => {
  test("returns readable errors for invalid data", () => {
    const result = safeParseAppData({
      events: [
        {
          id: "broken-event",
          title: "Broken Event",
          date: "2026/99/99",
          start: "18:00",
          end: "17:00",
          type: "candidate",
          peopleIds: [],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        }
      ],
      myPlan: {
        ownedCards: { gold: 1, silver: 1 },
        purchasedEventIds: [],
        candidateEventIds: ["broken-event"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes("date"))).toBe(true);
    }
  });
});
