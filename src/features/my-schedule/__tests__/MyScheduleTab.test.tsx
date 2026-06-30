import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { OfficialEventData } from "../../../types/officialData";
import type { UserScheduleRecord } from "../../../types/userSchedule";
import { MyScheduleTab } from "../MyScheduleTab";

function buildOfficialData(): OfficialEventData {
  return {
    events: [
      {
        id: "jkface-event-315",
        title: "ACT 激情水鑽感謝祭",
        bannerImageUrl: "https://example.com/act-banner.jpg",
        detailImageUrls: [],
        sourceUrl: "https://jkface.net/events/315",
        vendorName: "ACT",
        actressNames: ["雛乃花音", "音無鈴"],
        priceTags: ["鑽石"],
        fullContent: "ACT 官方全文"
      },
      {
        id: "jkface-event-326",
        title: "夢想企画感謝祭",
        bannerImageUrl: "https://example.com/dream-banner.jpg",
        detailImageUrls: [],
        sourceUrl: "https://jkface.net/events/326",
        vendorName: "夢想企画",
        actressNames: ["小花暖"],
        priceTags: ["鑽石"],
        fullContent: "夢想企画官方全文"
      }
    ],
    people: [],
    peopleById: {}
  };
}

function buildSchedule(overrides: Partial<UserScheduleRecord> = {}): UserScheduleRecord {
  return {
    version: 1,
    updatedAt: "2026-06-30T12:00:00.000Z",
    purchasedEntries: [
      {
        id: "dream-kohana-20260703-1545",
        sourceType: "official",
        officialEventId: "jkface-event-326",
        officialEventTitle: "夢想企画感謝祭",
        selectionLabel: "小花暖 白金互動",
        date: "2026/07/03",
        start: "15:45",
        end: "16:35",
        vendorName: "夢想企画",
        peopleNames: ["小花暖"],
        notes: null,
        sourceUrl: "https://jkface.net/events/326"
      },
      {
        id: "act-hinano-20260703-1330",
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
    ],
    candidateEntries: [],
    ...overrides
  };
}

describe("MyScheduleTab", () => {
  test("shows an empty state when no purchased entries are stored", () => {
    render(
        <MyScheduleTab
          officialData={buildOfficialData()}
        schedule={{ version: 1, updatedAt: null, purchasedEntries: [], candidateEntries: [] }}
        onRemovePurchasedEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    expect(screen.getByText("尚未加入已購活動")).toBeInTheDocument();
    expect(screen.getByText("尚未加入預選活動")).toBeInTheDocument();
  });

  test("shows stored purchased entries in chronological order", () => {
    render(
        <MyScheduleTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onRemovePurchasedEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: "ACT 激情水鑽感謝祭" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "夢想企画感謝祭" })).toBeInTheDocument();
    expect(screen.getByText("雛乃花音 第四場")).toBeInTheDocument();
    expect(screen.getByText("小花暖 白金互動")).toBeInTheDocument();
  });

  test("allows deleting a purchased entry from tab1", async () => {
    const user = userEvent.setup();
    const onRemovePurchasedEntry = vi.fn();

    render(
      <MyScheduleTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onRemovePurchasedEntry={onRemovePurchasedEntry}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "刪除 ACT 激情水鑽感謝祭" }));

    expect(onRemovePurchasedEntry).toHaveBeenCalledWith("act-hinano-20260703-1330");
  });

  test("shows stored candidate entries in a separate section and allows deleting them", async () => {
    const user = userEvent.setup();
    const onRemoveCandidateEntry = vi.fn();

    render(
      <MyScheduleTab
        officialData={buildOfficialData()}
        schedule={buildSchedule({
          candidateEntries: [
            {
              id: "candidate-act-20260703-1430",
              sourceType: "official",
              officialEventId: "jkface-event-315",
              officialEventTitle: "ACT 激情水鑽感謝祭",
              selectionLabel: "音無鈴 預選方案",
              date: "2026/07/03",
              start: "14:30",
              end: "15:10",
              vendorName: "ACT",
              peopleNames: ["音無鈴"],
              notes: "想觀察是否和其他行程衝突",
              sourceUrl: "https://jkface.net/events/315"
            }
          ]
        })}
        onRemovePurchasedEntry={() => undefined}
        onRemoveCandidateEntry={onRemoveCandidateEntry}
      />
    );

    expect(screen.getByText("我的預選活動")).toBeInTheDocument();
    expect(screen.getByText("音無鈴 預選方案")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "刪除預選 ACT 激情水鑽感謝祭" }));

    expect(onRemoveCandidateEntry).toHaveBeenCalledWith("candidate-act-20260703-1430");
  });
});
