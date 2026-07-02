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
    },
    {
      id: "jkface-event-321",
      title: "TRE AV CULT粉絲見面會",
      bannerImageUrl: "https://example.com/avcult-banner.jpg",
      detailImageUrls: [],
      sourceUrl: "https://jkface.net/events/321",
      vendorName: "AVCULT",
      actressNames: ["桃園怜奈", "藤森里穗"],
      priceTags: [],
      fullContent: "AV CULT 活動完整內容"
    },
    {
      id: "jkface-event-341",
      title: "UR AV  ★情慾天國 PARADISE OF DESIRE ★",
      bannerImageUrl: "https://example.com/urav-banner.jpg",
      detailImageUrls: [],
      sourceUrl: "https://jkface.net/events/341",
      vendorName: "UR AV",
      actressNames: ["倉本堇", "小梅惠奈"],
      priceTags: ["鑽石"],
      fullContent: "UR AV 活動完整內容"
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
    },
    {
      id: "jkface-person-桃園怜奈",
      name: "桃園怜奈",
      image: null,
      sourceUrl: "https://jkface.net/events/321"
    },
    {
      id: "jkface-person-藤森里穗",
      name: "藤森里穗",
      image: null,
      sourceUrl: "https://jkface.net/events/321"
    },
    {
      id: "jkface-person-倉本堇",
      name: "倉本堇",
      image: null,
      sourceUrl: "https://jkface.net/events/341"
    },
    {
      id: "jkface-person-小梅惠奈",
      name: "小梅惠奈",
      image: null,
      sourceUrl: "https://jkface.net/events/341"
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
    candidateEntries: [],
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
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
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
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
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
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
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
    const addCandidateEntry = vi.fn();
    const removeCandidateEntry = vi.fn();

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
        onAddCandidateEntry={addCandidateEntry}
        onRemoveCandidateEntry={removeCandidateEntry}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "雛乃花音");
    await user.selectOptions(screen.getByLabelText("方案名稱"), "其他");
    await user.type(screen.getByLabelText("其他方案名稱"), "第四場");
    await user.type(screen.getByLabelText("活動日期"), "2026-07-03");
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
    expect(addCandidateEntry).not.toHaveBeenCalled();
    expect(removeCandidateEntry).not.toHaveBeenCalled();
  });

  test("adds and removes candidate entries", async () => {
    const user = userEvent.setup();
    const addCandidateEntry = vi.fn();
    const removeCandidateEntry = vi.fn();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule({
          candidateEntries: [
            {
              id: "candidate-act-20260703-1330",
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
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
        onAddCandidateEntry={addCandidateEntry}
        onRemoveCandidateEntry={removeCandidateEntry}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[1]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "小花暖");
    await user.selectOptions(screen.getByLabelText("方案名稱"), "其他");
    await user.type(screen.getByLabelText("其他方案名稱"), "白金互動");
    await user.type(screen.getByLabelText("活動日期"), "2026-07-03");
    await user.type(screen.getByLabelText("開始時間"), "15:45");
    await user.type(screen.getByLabelText("結束時間"), "16:35");
    await user.click(screen.getByRole("button", { name: "加入預選" }));

    expect(addCandidateEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        officialEventId: "jkface-event-314",
        selectionLabel: "小花暖 白金互動",
        date: "2026/07/03",
        start: "15:45",
        end: "16:35"
      })
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    await user.click(screen.getByRole("button", { name: "移出預選" }));

    expect(removeCandidateEntry).toHaveBeenCalledWith("candidate-act-20260703-1330");
  });

  test("shows required markers and validation errors for missing fields", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    await user.click(screen.getByRole("button", { name: "加入已購" }));

    expect(screen.getAllByText("*必填").length).toBeGreaterThan(0);
    expect(screen.getByText("請選擇方案名稱")).toBeInTheDocument();
    expect(screen.getByText("請選擇活動日期")).toBeInTheDocument();
    expect(screen.getByText("請選擇開始時間")).toBeInTheDocument();
    expect(screen.getByText("請選擇結束時間")).toBeInTheDocument();
  });

  test("shows structured summary details for enhanced plans", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[3]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "倉本堇");
    await user.selectOptions(screen.getByLabelText("方案名稱"), "A｜25,000紅鑽｜白羽聖域");

    expect(screen.getByText("拍立得合照1張、手機合照2次、寫真攝影15秒、簽名1項物品")).toBeInTheDocument();
    expect(screen.getByText("25,000紅鑽")).toBeInTheDocument();
    expect(screen.getByText("請選擇場次")).toBeInTheDocument();
  });

  test("requires session selection for enhanced events with multiple sessions", async () => {
    const user = userEvent.setup();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={() => undefined}
        onRemovePurchasedEntry={() => undefined}
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[2]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "桃園怜奈");
    await user.selectOptions(screen.getByLabelText("方案名稱"), "MEET｜3,000 TWD｜粉絲見面會");

    expect(screen.getByLabelText("場次")).toBeInTheDocument();
    expect(screen.getByLabelText("活動日期")).toHaveValue("");

    await user.selectOptions(screen.getByLabelText("場次"), "7/3 13:30-14:30｜第3場");

    expect(screen.getByLabelText("活動日期")).toHaveValue("2026-07-03");
    expect(screen.getByLabelText("開始時間")).toHaveValue("13:30");
    expect(screen.getByLabelText("結束時間")).toHaveValue("14:30");
  });

  test("saves enhanced event selections with chosen session time and outfit summary", async () => {
    const user = userEvent.setup();
    const addPurchasedEntry = vi.fn();

    render(
      <EventCatalogTab
        officialData={buildOfficialData()}
        schedule={buildSchedule()}
        onAddPurchasedEntry={addPurchasedEntry}
        onRemovePurchasedEntry={() => undefined}
        onAddCandidateEntry={() => undefined}
        onRemoveCandidateEntry={() => undefined}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[3]);
    await user.selectOptions(screen.getByLabelText("活動人物"), "倉本堇");
    await user.selectOptions(screen.getByLabelText("方案名稱"), "A｜25,000紅鑽｜白羽聖域");
    await user.selectOptions(screen.getByLabelText("場次"), "7/3 11:00-11:50｜第1場");

    expect(screen.getByText("服裝：性感內衣A")).toBeInTheDocument();
    expect(screen.getByText("場次備註：倉本堇時刻表")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "加入已購" }));

    expect(addPurchasedEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        officialEventId: "jkface-event-341",
        selectionLabel: "倉本堇 白羽聖域",
        date: "2026/07/03",
        start: "11:00",
        end: "11:50"
      })
    );
  });
});
