import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { parseAppData } from "../../../lib/loadData";
import { MyScheduleTab } from "../MyScheduleTab";

describe("MyScheduleTab", () => {
  test("shows the two purchased seed events", () => {
    render(<MyScheduleTab data={parseAppData()} />);

    expect(screen.getByText("ACT 激情水鑽感謝祭")).toBeInTheDocument();
    expect(screen.getByText("夢想企画感謝祭")).toBeInTheDocument();
  });

  test("shows preferred people and preferred time notes from the plan", () => {
    const data = parseAppData({
      people: [
        {
          id: "target-person",
          name: "想選的人",
          group: null,
          bio: null,
          tags: [],
          notes: null,
          image: null
        }
      ],
      events: [],
      myPlan: {
        ownedCards: { gold: 1, silver: 1 },
        purchasedEventIds: [],
        candidateEventIds: [],
        pendingCardBenefitPreferences: [],
        preferredPeopleIds: ["target-person"],
        preferredTimeSlotNotes: ["7/4 下午優先"]
      }
    });

    render(<MyScheduleTab data={data} />);

    expect(screen.getByText("想選的人")).toBeInTheDocument();
    expect(screen.getByText("7/4 下午優先")).toBeInTheDocument();
  });
});
