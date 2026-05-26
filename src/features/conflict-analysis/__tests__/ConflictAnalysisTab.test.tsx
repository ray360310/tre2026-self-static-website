import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { parseAppData } from "../../../lib/loadData";
import { ConflictAnalysisTab } from "../ConflictAnalysisTab";

describe("ConflictAnalysisTab", () => {
  test("shows conflict summary labels", () => {
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

    render(<ConflictAnalysisTab data={data} />);

    expect(screen.getByText("影響金卡")).toBeInTheDocument();
  });

  test("allows selecting which candidate to analyze", async () => {
    const user = userEvent.setup();
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
          id: "candidate-one",
          title: "第一候選活動",
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
        },
        {
          id: "candidate-two",
          title: "第二候選活動",
          date: "2026/07/03",
          start: "15:00",
          end: "15:20",
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
        candidateEventIds: ["candidate-one", "candidate-two"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    render(<ConflictAnalysisTab data={data} />);

    expect(screen.getByRole("button", { name: "第一候選活動" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "第二候選活動" }));

    expect(screen.getByText(/正在檢查 第二候選活動/)).toBeInTheDocument();
  });

  test("renders timeline events in chronological order", () => {
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
          id: "z-purchased-early",
          title: "較早的已購活動",
          date: "2026/07/03",
          start: "13:00",
          end: "13:20",
          type: "purchased",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "confirmed",
          notes: null
        },
        {
          id: "candidate-middle",
          title: "中間的候選活動",
          date: "2026/07/03",
          start: "13:10",
          end: "13:30",
          type: "candidate",
          peopleIds: ["hinano-kanon"],
          description: null,
          location: null,
          source: "test",
          status: "planned",
          notes: null
        },
        {
          id: "a-benefit-late",
          title: "較晚的卡福利活動",
          date: "2026/07/03",
          start: "13:25",
          end: "13:45",
          type: "card-benefit",
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
        purchasedEventIds: ["z-purchased-early"],
        candidateEventIds: ["candidate-middle"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      },
      rules: {
        overlapRequiresSameDate: true,
        overlapRequiresTimeWindowIntersection: true,
        goldCardConflictEventIds: ["a-benefit-late"],
        silverCardConflictEventIds: []
      }
    });

    render(<ConflictAnalysisTab data={data} />);

    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent)
        .filter((text) => text !== "候補活動")
    ).toEqual(["較早的已購活動", "中間的候選活動", "較晚的卡福利活動"]);
  });

  test("repairs candidate selection when incoming data changes", async () => {
    const user = userEvent.setup();
    const initialData = parseAppData({
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
          id: "candidate-one",
          title: "第一候選活動",
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
        },
        {
          id: "candidate-two",
          title: "第二候選活動",
          date: "2026/07/03",
          start: "15:00",
          end: "15:20",
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
        purchasedEventIds: [],
        candidateEventIds: ["candidate-one", "candidate-two"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });
    const nextData = parseAppData({
      people: initialData.people,
      events: [
        {
          id: "candidate-three",
          title: "第三候選活動",
          date: "2026/07/04",
          start: "16:00",
          end: "16:20",
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
        purchasedEventIds: [],
        candidateEventIds: ["candidate-three"],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: [],
        preferredTimeSlotNotes: []
      }
    });

    const { rerender } = render(<ConflictAnalysisTab data={initialData} />);

    await user.click(screen.getByRole("button", { name: "第二候選活動" }));

    rerender(<ConflictAnalysisTab data={nextData} />);

    expect(screen.getByText(/正在檢查 第三候選活動/)).toBeInTheDocument();
  });
});
