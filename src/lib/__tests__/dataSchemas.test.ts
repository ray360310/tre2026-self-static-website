import { describe, expect, test } from "vitest";
import { parseAppData } from "../loadData";

describe("parseAppData", () => {
  test("loads the seeded purchased events", () => {
    const data = parseAppData();

    expect(data.purchasedEvents).toHaveLength(2);
    expect(data.purchasedEvents).toMatchObject([
      {
        title: "ACT 激情水鑽感謝祭",
        date: "2026/07/03",
        start: "13:30",
        end: "14:10",
        peopleIds: ["hinano-kanon"]
      },
      {
        title: "夢想企画感謝祭",
        date: "2026/07/03",
        start: "15:45",
        end: "16:35",
        peopleIds: ["kohana-dan"],
        notes: "白金互動"
      }
    ]);
  });

  test("throws when my plan references an unknown event", () => {
    expect(() =>
      parseAppData({
        myPlan: {
          ownedCards: { gold: 1, silver: 1 },
          purchasedEventIds: ["missing-event-id"],
          candidateEventIds: [],
          pendingCardBenefitPreferences: [],
          preferredPeopleIds: [],
          preferredTimeSlotNotes: []
        }
      })
    ).toThrow(/unknown event id/i);
  });

  test("throws when an event references an unknown person", () => {
    expect(() =>
      parseAppData({
        events: [
          {
            id: "bad-event",
            title: "Broken Event",
            date: "2026/07/03",
            start: "10:00",
            end: "10:30",
            type: "candidate",
            peopleIds: ["missing-person"],
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
          candidateEventIds: ["bad-event"],
          pendingCardBenefitPreferences: [],
          preferredPeopleIds: [],
          preferredTimeSlotNotes: []
        }
      })
    ).toThrow(/unknown person id/i);
  });

  test("throws when duplicate event ids are provided", () => {
    expect(() =>
      parseAppData({
        events: [
          {
            id: "duplicate-event",
            title: "First Event",
            date: "2026/07/03",
            start: "09:00",
            end: "09:30",
            type: "candidate",
            peopleIds: [],
            description: null,
            location: null,
            source: "test",
            status: "planned",
            notes: null
          },
          {
            id: "duplicate-event",
            title: "Second Event",
            date: "2026/07/03",
            start: "10:00",
            end: "10:30",
            type: "candidate",
            peopleIds: [],
            description: null,
            location: null,
            source: "test",
            status: "planned",
            notes: null
          }
        ]
      })
    ).toThrow(/duplicate event id/i);
  });

  test("throws when my plan contains duplicate event ids", () => {
    expect(() =>
      parseAppData({
        myPlan: {
          ownedCards: { gold: 1, silver: 1 },
          purchasedEventIds: [
            "2026-07-03-hinano-act-thanks",
            "2026-07-03-hinano-act-thanks"
          ],
          candidateEventIds: [],
          pendingCardBenefitPreferences: [],
          preferredPeopleIds: [],
          preferredTimeSlotNotes: []
        }
      })
    ).toThrow(/duplicate my plan purchasedeventids id/i);
  });

  test("throws when event time values are malformed or reversed", () => {
    expect(() =>
      parseAppData({
        events: [
          {
            id: "bad-time-event",
            title: "Broken Time Event",
            date: "2026/07/03",
            start: "25:99",
            end: "10:00",
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
          candidateEventIds: ["bad-time-event"],
          pendingCardBenefitPreferences: [],
          preferredPeopleIds: [],
          preferredTimeSlotNotes: []
        }
      })
    ).toThrow(/hh:mm/i);

    expect(() =>
      parseAppData({
        events: [
          {
            id: "reversed-time-event",
            title: "Reversed Time Event",
            date: "2026/07/03",
            start: "14:00",
            end: "13:00",
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
          candidateEventIds: ["reversed-time-event"],
          pendingCardBenefitPreferences: [],
          preferredPeopleIds: [],
          preferredTimeSlotNotes: []
        }
      })
    ).toThrow(/end time must be after start time/i);
  });
});
