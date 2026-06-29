import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import type { OfficialEventData } from "../../../types/officialData";
import type { UserScheduleRecord } from "../../../types/userSchedule";
import { EventCatalogTab } from "../EventCatalogTab";

function buildOfficialData(): OfficialEventData {
  const events = [
    {
      id: "jkface-event-315",
      title: "ACT 激情水鑽感謝祭",
      bannerImageUrl: "https://example.com/act-banner.jpg",
      detailImageUrls: ["https://example.com/act-detail.jpg"],
      sourceUrl: "https://jkface.net/events/315",
      vendorName: "ACT",
      actressNames: ["音無鈴", "雛乃花音"],
      priceTags: ["鑽石"],
      fullContent: "ACT 活動完整內容"
    },
    {
      id: "jkface-event-314",
      title: "夢想企画感謝祭",
      bannerImageUrl: "https://example.com/dream-banner.jpg",
      detailImageUrls: [],
      sourceUrl: "https://jkface.net/events/314",
      vendorName: "夢想企画",
      actressNames: ["小花暖"],
      priceTags: ["FACE券"],
      fullContent: "夢想企画完整內容"
    }
  ];
  const people = [
    {
      id: "jkface-person-音無鈴",
      name: "音無鈴",
      image: null,
      sourceUrl: "https://jkface.net/events/315"
    },
    {
      id: "jkface-person-雛乃花音",
      name: "雛乃花音",
      image: null,
      sourceUrl: "https://jkface.net/events/315"
    },
    {
      id: "jkface-person-小花暖",
      name: "小花暖",
      image: null,
      sourceUrl: "https://jkface.net/events/314"
    }
  ];

  return {
    events,
    people,
    peopleById: Object.fromEntries(people.map((person) => [person.id, person]))
  };
}

function buildSchedule(overrides: Partial<UserScheduleRecord> = {}): UserScheduleRecord {
  return {
    version: 1,
    updatedAt: "2026-06-30T12:00:00.000Z",
    purchasedEntries: [],
    ...overrides
  };
}

describe("EventCatalogTab", () => {
  test("renders official events and expands the selected card", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
      />
    );

    expect(screen.getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(screen.getByText("夢想企画感謝祭")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);

    expect(screen.getByText("ACT 活動完整內容")).toBeInTheDocument();
    expect(screen.getByAltText("ACT 激情水鑽感謝祭 詳細圖片 1")).toBeInTheDocument();
  });

  test("filters by vendor, actress, and price tag", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
      />
    );

    await user.selectOptions(screen.getByLabelText("廠商篩選"), "ACT");
    expect(screen.getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(screen.queryByText("夢想企画感謝祭")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "清除條件" }));
    await user.selectOptions(screen.getByLabelText("女優篩選"), "小花暖");
    await user.selectOptions(screen.getByLabelText("票種篩選"), "FACE券");

    expect(screen.getByText("夢想企画感謝祭")).toBeInTheDocument();
    expect(screen.queryByText("ACT 激情水鑽感謝祭")).not.toBeInTheDocument();
  });

  test("keeps only one event expanded at a time", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    expect(screen.getByText("ACT 活動完整內容")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);

    expect(screen.getByText("夢想企画完整內容")).toBeInTheDocument();
    expect(screen.queryByText("ACT 活動完整內容")).not.toBeInTheDocument();
  });

  test("adds and removes purchased entries", async () => {
    const user = userEvent.setup();
    const addPurchasedEntry = vi.fn();
    const removePurchasedEntry = vi.fn();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule({
          purchasedEntries: [
            {
              id: "dream-kohana-20260703-1545",
              sourceType: "official",
              officialEventId: "jkface-event-314",
              officialEventTitle: "夢想企画感謝祭",
              selectionLabel: "小花暖 白金互動",
              date: "2026/07/03",
              start: "15:45",
              end: "16:35",
              vendorName: "夢想企画",
              peopleNames: ["小花暖"],
              notes: null,
              sourceUrl: "https://jkface.net/events/314"
            }
          ]
        })}
        onAddPurchasedEntry={addPurchasedEntry}
        onRemovePurchasedEntry={removePurchasedEntry}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "雛乃花音");
    await user.type(screen.getByLabelText("方案名稱"), "第四場");
    await user.type(screen.getByLabelText("活動日期"), "2026/07/03");
    await user.type(screen.getByLabelText("開始時間"), "13:30");
    await user.type(screen.getByLabelText("結束時間"), "14:10");
    await user.click(screen.getByRole("button", { name: "加入已購" }));

    expect(addPurchasedEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        officialEventId: "jkface-event-315",
        selectionLabel: "雛乃花音 第四場",
        date: "2026/07/03",
        start: "13:30",
        end: "14:10"
      })
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    await user.click(screen.getByRole("button", { name: "移出已購" }));

    expect(removePurchasedEntry).toHaveBeenCalledWith("dream-kohana-20260703-1545");
  });
});
