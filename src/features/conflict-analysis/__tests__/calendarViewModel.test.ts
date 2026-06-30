import { describe, expect, test } from "vitest";

import { parseAppData } from "../../../lib/loadData";
import type { OfficialEventData } from "../../../types/officialData";
import type { UserScheduleRecord } from "../../../types/userSchedule";
import { buildThreeDayCalendar } from "../calendarViewModel";

function buildSchedule(
  overrides: Partial<UserScheduleRecord> = {}
): UserScheduleRecord {
  return {
    version: 1,
    updatedAt: "2026-06-30T12:00:00.000Z",
    purchasedEntries: [],
    candidateEntries: [],
    ...overrides
  };
}

function buildOfficialData(): OfficialEventData {
  return {
    events: [
      {
        id: "event-3",
        title: "7/3 活動",
        bannerImageUrl: null,
        detailImageUrls: [],
        sourceUrl: "https://example.com/3",
        vendorName: "ACT",
        actressNames: ["雛乃花音"],
        priceTags: [],
        fullContent: "7/3 官方內容"
      },
      {
        id: "event-5",
        title: "7/5 活動",
        bannerImageUrl: null,
        detailImageUrls: [],
        sourceUrl: "https://example.com/5",
        vendorName: "ACT",
        actressNames: ["小花暖"],
        priceTags: [],
        fullContent: "7/5 官方內容"
      }
    ],
    people: [],
    peopleById: {}
  };
}

describe("buildThreeDayCalendar", () => {
  test("buckets purchased entries into the three calendar days", () => {
    const data = parseAppData({
      people: [],
      events: [],
      myPlan: {
        ownedCards: { gold: 1, silver: 1 },
        purchasedEventIds: [],
        candidateEventIds: [],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    const calendar = buildThreeDayCalendar(
      data,
      buildSchedule({
          purchasedEntries: [
          {
            id: "july-3",
            sourceType: "official",
            officialEventId: "event-3",
            officialEventTitle: "7/3 活動",
            selectionLabel: "A 場",
            date: "2026/07/03",
            start: "13:30",
            end: "14:10",
            vendorName: "ACT",
            peopleNames: ["雛乃花音"],
            notes: null,
            sourceUrl: "https://example.com/3"
          },
          {
            id: "july-5",
            sourceType: "official",
            officialEventId: "event-5",
            officialEventTitle: "7/5 活動",
            selectionLabel: "B 場",
            date: "2026/07/05",
            start: "18:00",
            end: "18:30",
            vendorName: "ACT",
            peopleNames: ["小花暖"],
            notes: null,
            sourceUrl: "https://example.com/5"
          }
        ]
      }),
      buildOfficialData()
    );

    expect(calendar.days[0].blocks.map((block) => block.title)).toContain("7/3 活動");
    expect(calendar.days[1].blocks).toHaveLength(0);
    expect(calendar.days[2].blocks.map((block) => block.title)).toContain("7/5 活動");
  });

  test("includes gold and silver card benefit blocks", () => {
    const data = parseAppData({
      people: [
        {
          id: "hostess",
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
          id: "gold-benefit",
          title: "女優親密接觸",
          date: "2026/07/03",
          start: "13:50",
          end: "14:20",
          type: "card-benefit",
          peopleIds: ["hostess"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        },
        {
          id: "silver-benefit",
          title: "招財女神祝福儀式",
          date: "2026/07/04",
          start: "16:00",
          end: "16:30",
          type: "card-benefit",
          peopleIds: ["hostess"],
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
        candidateEventIds: [],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      },
      rules: {
        overlapRequiresSameDate: true,
        overlapRequiresTimeWindowIntersection: true,
        goldCardConflictEventIds: ["gold-benefit"],
        silverCardConflictEventIds: ["silver-benefit"]
      }
    });

    const calendar = buildThreeDayCalendar(data, buildSchedule(), buildOfficialData());

    expect(calendar.days[0].blocks.find((block) => block.cardType === "gold")?.title).toBe(
      "女優親密接觸"
    );
    expect(calendar.days[1].blocks.find((block) => block.cardType === "silver")?.title).toBe(
      "招財女神祝福儀式"
    );
  });

  test("marks purchased entries that overlap benefit windows", () => {
    const data = parseAppData({
      people: [
        {
          id: "hostess",
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
          id: "gold-benefit",
          title: "女優親密接觸",
          date: "2026/07/03",
          start: "13:50",
          end: "14:20",
          type: "card-benefit",
          peopleIds: ["hostess"],
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
        candidateEventIds: [],
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

    const calendar = buildThreeDayCalendar(
      data,
      buildSchedule({
          purchasedEntries: [
          {
            id: "act-kanon",
            sourceType: "official",
            officialEventId: "event-3",
            officialEventTitle: "ACT 激情水鑽感謝祭",
            selectionLabel: "雛乃花音 第四場",
            date: "2026/07/03",
            start: "13:30",
            end: "14:10",
            vendorName: "ACT",
            peopleNames: ["雛乃花音"],
            notes: null,
            sourceUrl: "https://example.com/3"
          }
        ]
      }),
      buildOfficialData()
    );

    const purchasedBlock = calendar.days[0].blocks.find((block) => block.kind === "purchased");

    expect(purchasedBlock?.conflictLabels).toContain("撞到金卡");
    expect(calendar.conflictCount).toBe(1);
  });

  test("renders candidate entries and marks overlaps with purchased and benefit windows", () => {
    const data = parseAppData({
      people: [
        {
          id: "hostess",
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
          id: "gold-benefit",
          title: "女優親密接觸",
          date: "2026/07/03",
          start: "13:50",
          end: "14:20",
          type: "card-benefit",
          peopleIds: ["hostess"],
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
        candidateEventIds: [],
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

    const calendar = buildThreeDayCalendar(
      data,
      buildSchedule({
        purchasedEntries: [
          {
            id: "act-kanon",
            sourceType: "official",
            officialEventId: "event-3",
            officialEventTitle: "ACT 激情水鑽感謝祭",
            selectionLabel: "雛乃花音 第四場",
            date: "2026/07/03",
            start: "13:30",
            end: "14:10",
            vendorName: "ACT",
            peopleNames: ["雛乃花音"],
            notes: null,
            sourceUrl: "https://example.com/3"
          }
        ],
        candidateEntries: [
          {
            id: "candidate-kohana",
            sourceType: "official",
            officialEventId: "event-5",
            officialEventTitle: "7/5 活動",
            selectionLabel: "小花暖 預選方案",
            date: "2026/07/03",
            start: "13:40",
            end: "14:00",
            vendorName: "ACT",
            peopleNames: ["小花暖"],
            notes: "想看能不能趕上",
            sourceUrl: "https://example.com/5"
          }
        ]
      }),
      buildOfficialData()
    );

    const candidateBlock = calendar.days[0].blocks.find((block) => block.kind === "candidate");

    expect(candidateBlock?.title).toBe("7/5 活動");
    expect(candidateBlock?.conflictLabels).toContain("撞到已購");
    expect(candidateBlock?.conflictLabels).toContain("撞到金卡");
    expect(calendar.candidateCount).toBe(1);
    expect(calendar.conflictCount).toBe(2);
  });
});
