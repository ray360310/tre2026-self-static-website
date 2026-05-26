import { describe, expect, test } from "vitest";

import { analyzeCandidateConflict } from "../conflicts";
import { parseAppData } from "../loadData";

describe("analyzeCandidateConflict", () => {
  test("marks overlap with purchased and card benefit events", () => {
    const data = parseAppData({
      people: [
        {
          id: "hinano-kanon",
          name: "雛乃花音",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        },
        {
          id: "special-hostess",
          name: "招待女優",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "purchased-hinano",
          title: "ACT 激情水鑽感謝祭",
          date: "2026/07/03",
          start: "13:30",
          end: "14:10",
          type: "purchased",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "confirmed",
          notes: null
        },
        {
          id: "gold-benefit",
          title: "女優親密接觸",
          date: "2026/07/03",
          start: "13:50",
          end: "14:20",
          type: "card-benefit",
          peopleIds: ["special-hostess"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        },
        {
          id: "candidate-overlap",
          title: "想搶的新活動",
          date: "2026/07/03",
          start: "13:40",
          end: "14:00",
          type: "candidate",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        }
      ],
      myPlan: {
        ownedCards: { gold: 1, silver: 1 },
        purchasedEventIds: ["purchased-hinano"],
        candidateEventIds: ["candidate-overlap"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      },
      rules: {
        overlapRequiresSameDate: true,
        overlapRequiresTimeWindowIntersection: true,
        goldCardConflictEventIds: ["gold-benefit"],
        silverCardConflictEventIds: []
      }
    });

    const result = analyzeCandidateConflict(data, "candidate-overlap");

    expect(result.hasConflict).toBe(true);
    expect(result.purchasedConflictCount).toBe(1);
    expect(result.affectsGoldCard).toBe(true);
    expect(result.affectsSilverCard).toBe(false);
    expect(result.conflictingEventIds).toEqual(["gold-benefit", "purchased-hinano"]);
  });

  test("deduplicates conflicting event ids across conflict buckets", () => {
    const data = parseAppData({
      people: [
        {
          id: "hinano-kanon",
          name: "雛乃花音",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "purchased-hinano",
          title: "ACT 激情水鑽感謝祭",
          date: "2026/07/03",
          start: "13:30",
          end: "14:10",
          type: "purchased",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "confirmed",
          notes: null
        },
        {
          id: "candidate-overlap",
          title: "想搶的新活動",
          date: "2026/07/03",
          start: "13:40",
          end: "14:00",
          type: "candidate",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        }
      ],
      myPlan: {
        ownedCards: { gold: 1, silver: 1 },
        purchasedEventIds: ["purchased-hinano"],
        candidateEventIds: ["candidate-overlap"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      },
      rules: {
        overlapRequiresSameDate: true,
        overlapRequiresTimeWindowIntersection: true,
        goldCardConflictEventIds: ["purchased-hinano"],
        silverCardConflictEventIds: []
      }
    });

    const result = analyzeCandidateConflict(data, "candidate-overlap");

    expect(result.conflictingEventIds).toEqual(["purchased-hinano"]);
    expect(result.hasConflict).toBe(true);
    expect(result.purchasedConflictCount).toBe(1);
    expect(result.affectsGoldCard).toBe(true);
    expect(result.affectsSilverCard).toBe(false);
  });

  test("throws when conflict rule ids reference missing events", () => {
    const data = parseAppData();

    data.rules.goldCardConflictEventIds = ["missing-event-id"];

    expect(() =>
      analyzeCandidateConflict(data, "2026-07-03-hinano-act-thanks")
    ).toThrow(/unknown event id/i);
  });
});
