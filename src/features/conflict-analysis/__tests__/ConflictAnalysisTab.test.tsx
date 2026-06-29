import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { parseAppData } from "../../../lib/loadData";
import type { OfficialEventData } from "../../../types/officialData";
import type { UserScheduleRecord } from "../../../types/userSchedule";
import { ConflictAnalysisTab } from "../ConflictAnalysisTab";

function buildSchedule(
  overrides: Partial<UserScheduleRecord> = {}
): UserScheduleRecord {
  return {
    version: 1,
    updatedAt: "2026-06-30T12:00:00.000Z",
    purchasedEntries: [],
    ...overrides
  };
}

function buildOfficialData(
  overrides: Partial<OfficialEventData> = {}
): OfficialEventData {
  return {
    events: [],
    people: [],
    peopleById: {},
    ...overrides
  };
}

describe("ConflictAnalysisTab", () => {
  test("renders three fixed calendar days", () => {
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule()}
        officialData={buildOfficialData()}
      />
    );

    expect(screen.getByRole("heading", { name: "7/3 Fri" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7/4 Sat" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7/5 Sun" })).toBeInTheDocument();
  });

  test("shows purchased entries in the matching day column", () => {
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule({
          purchasedEntries: [
            {
              id: "act-kanon",
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
              sourceUrl: "https://jkface.net/events/315"
            }
          ]
        })}
        officialData={buildOfficialData()}
      />
    );

    const july3Column = screen.getByTestId("calendar-day-2026-07-03");

    expect(within(july3Column).getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(within(july3Column).getByText("雛乃花音 第四場")).toBeInTheDocument();
  });

  test("shows gold and silver card benefit blocks", () => {
    const data = parseAppData({
      people: [
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
          id: "silver-benefit",
          title: "招財女神祝福儀式",
          date: "2026/07/04",
          start: "16:00",
          end: "16:30",
          type: "card-benefit",
          peopleIds: ["special-hostess"],
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule()}
        officialData={buildOfficialData()}
      />
    );

    expect(screen.getByText("金卡權益")).toBeInTheDocument();
    expect(screen.getByText("白銀卡權益")).toBeInTheDocument();
    expect(screen.getByText("女優親密接觸")).toBeInTheDocument();
    expect(screen.getByText("招財女神祝福儀式")).toBeInTheDocument();
  });

  test("marks purchased entries that overlap card benefit windows", () => {
    const data = parseAppData({
      people: [
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule({
          purchasedEntries: [
            {
              id: "act-kanon",
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
              sourceUrl: "https://jkface.net/events/315"
            }
          ]
        })}
        officialData={buildOfficialData()}
      />
    );

    expect(screen.getByText("撞到金卡")).toBeInTheDocument();
    expect(screen.getAllByText("衝突 1 場").length).toBeGreaterThan(0);
  });

  test("shows purchased entry details after selecting a calendar block", async () => {
    const user = userEvent.setup();
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule({
          purchasedEntries: [
            {
              id: "act-kanon",
              sourceType: "official",
              officialEventId: "jkface-event-315",
              officialEventTitle: "ACT 激情水鑽感謝祭",
              selectionLabel: "雛乃花音 第四場",
              date: "2026/07/03",
              start: "13:30",
              end: "14:10",
              vendorName: "ACT",
              peopleNames: ["雛乃花音"],
              notes: "提前 30 分鐘報到",
              sourceUrl: "https://jkface.net/events/315"
            }
          ]
        })}
        officialData={buildOfficialData({
          events: [
            {
              id: "jkface-event-315",
              title: "ACT 激情水鑽感謝祭",
              bannerImageUrl: null,
              detailImageUrls: [],
              sourceUrl: "https://jkface.net/events/315",
              vendorName: "ACT",
              actressNames: ["雛乃花音"],
              priceTags: [],
              fullContent: "官方全文節錄"
            }
          ]
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: "查看 ACT 激情水鑽感謝祭 詳情" }));

    const detailPanel = screen.getByLabelText("活動詳情面板");

    expect(within(detailPanel).getByRole("heading", { name: "活動詳情" })).toBeInTheDocument();
    expect(within(detailPanel).getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(within(detailPanel).getByText("雛乃花音 第四場")).toBeInTheDocument();
    expect(within(detailPanel).getByText("提前 30 分鐘報到")).toBeInTheDocument();
    expect(within(detailPanel).getByText("官方全文節錄")).toBeInTheDocument();
    expect(within(detailPanel).getByRole("link", { name: "查看官方頁面" })).toHaveAttribute(
      "href",
      "https://jkface.net/events/315"
    );
  });

  test("shows benefit block details after selecting a benefit block", async () => {
    const user = userEvent.setup();
    const data = parseAppData({
      people: [
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
          id: "gold-benefit",
          title: "女優親密接觸",
          date: "2026/07/03",
          start: "13:50",
          end: "14:20",
          type: "card-benefit",
          peopleIds: ["special-hostess"],
          description: "金卡專屬互動時段",
          location: "主舞台",
          source: "test",
          status: "planned",
          notes: "請提前集合"
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

    render(
      <ConflictAnalysisTab
        data={data}
        schedule={buildSchedule()}
        officialData={buildOfficialData()}
      />
    );

    await user.click(screen.getByRole("button", { name: "查看 女優親密接觸 詳情" }));

    const detailPanel = screen.getByLabelText("活動詳情面板");

    expect(within(detailPanel).getAllByText("金卡權益").length).toBeGreaterThan(0);
    expect(within(detailPanel).getByText("金卡專屬互動時段")).toBeInTheDocument();
    expect(within(detailPanel).getByText("主舞台")).toBeInTheDocument();
    expect(within(detailPanel).getByText("請提前集合")).toBeInTheDocument();
  });
});
