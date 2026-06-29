import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import type { OfficialEventData } from "../../../types/officialData";
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

describe("EventCatalogTab", () => {
  test("renders official events and expands the selected card", async () => {
    const user = userEvent.setup();

    render(<EventCatalogTab officialData={buildOfficialData()} />);

    expect(screen.getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(screen.getByText("夢想企画感謝祭")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);

    expect(screen.getByText("ACT 活動完整內容")).toBeInTheDocument();
    expect(screen.getByAltText("ACT 激情水鑽感謝祭 詳細圖片 1")).toBeInTheDocument();
  });

  test("filters by vendor, actress, and price tag", async () => {
    const user = userEvent.setup();

    render(<EventCatalogTab officialData={buildOfficialData()} />);

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

    render(<EventCatalogTab officialData={buildOfficialData()} />);

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);
    expect(screen.getByText("ACT 活動完整內容")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "展開內容" })[0]);

    expect(screen.getByText("夢想企画完整內容")).toBeInTheDocument();
    expect(screen.queryByText("ACT 活動完整內容")).not.toBeInTheDocument();
  });
});
