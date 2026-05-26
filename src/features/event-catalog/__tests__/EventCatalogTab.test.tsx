import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { parseAppData } from "../../../lib/loadData";
import { EventCatalogTab } from "../EventCatalogTab";

describe("EventCatalogTab", () => {
  test("shows unreleased status when present", () => {
    const data = parseAppData({
      people: [
        {
          id: "tre-host",
          name: "TRE 主持人",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "unreleased-event",
          title: "尚未上架活動",
          date: "2026/07/04",
          start: "11:00",
          end: "11:30",
          type: "official",
          peopleIds: ["tre-host"],
          description: "未上架說明",
          location: null,
          source: "test",
          status: "unreleased",
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
      }
    });

    render(<EventCatalogTab data={data} />);

    expect(screen.getByText("未上架")).toBeInTheDocument();
  });

  test("filters by date, person, and event type", async () => {
    const user = userEvent.setup();
    const data = parseAppData({
      people: [
        {
          id: "person-a",
          name: "A 女優",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        },
        {
          id: "person-b",
          name: "B 女優",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "official-a",
          title: "官方活動 A",
          date: "2026/07/04",
          start: "11:00",
          end: "11:30",
          type: "official",
          peopleIds: ["person-a"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        },
        {
          id: "candidate-b",
          title: "候補活動 B",
          date: "2026/07/05",
          start: "12:00",
          end: "12:30",
          type: "candidate",
          peopleIds: ["person-b"],
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
        candidateEventIds: ["candidate-b"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    render(<EventCatalogTab data={data} />);

    await user.selectOptions(screen.getByLabelText("活動類型"), "official");
    await user.selectOptions(screen.getByLabelText("人物篩選"), "person-a");
    await user.selectOptions(screen.getByLabelText("日期篩選"), "2026/07/04");

    expect(screen.getByText("官方活動 A")).toBeInTheDocument();
    expect(screen.queryByText("候補活動 B")).not.toBeInTheDocument();
  });

  test("repairs invalid filter selections when incoming data changes", async () => {
    const user = userEvent.setup();
    const initialData = parseAppData({
      people: [
        {
          id: "person-a",
          name: "A 女優",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "official-a",
          title: "官方活動 A",
          date: "2026/07/04",
          start: "11:00",
          end: "11:30",
          type: "official",
          peopleIds: ["person-a"],
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
      }
    });
    const nextData = parseAppData({
      people: [
        {
          id: "person-b",
          name: "B 女優",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [
        {
          id: "candidate-b",
          title: "候補活動 B",
          date: "2026/07/05",
          start: "12:00",
          end: "12:30",
          type: "candidate",
          peopleIds: ["person-b"],
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
        candidateEventIds: ["candidate-b"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    const { rerender } = render(<EventCatalogTab data={initialData} />);

    await user.selectOptions(screen.getByLabelText("活動類型"), "official");
    await user.selectOptions(screen.getByLabelText("人物篩選"), "person-a");
    await user.selectOptions(screen.getByLabelText("日期篩選"), "2026/07/04");

    rerender(<EventCatalogTab data={nextData} />);

    expect(screen.getByText("候補活動 B")).toBeInTheDocument();
  });
});
