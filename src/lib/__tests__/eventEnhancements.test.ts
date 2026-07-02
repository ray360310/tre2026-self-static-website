import { describe, expect, test } from "vitest";

import {
  getEventEnhancementById,
  getEnhancementPlanOptions,
  getEnhancementProfiles
} from "../eventEnhancements";

describe("eventEnhancements", () => {
  test("returns null for events without enhancement data", () => {
    expect(getEventEnhancementById("jkface-event-missing")).toBeNull();
  });

  test("loads enhancement records by official event id", () => {
    const enhancement = getEventEnhancementById("jkface-event-321");

    expect(enhancement?.officialEventId).toBe("jkface-event-321");
    expect(enhancement?.profiles[0]?.personName).toBe("桃園怜奈");
  });

  test("returns structured profiles and plan options for a specific person", () => {
    const profiles = getEnhancementProfiles("jkface-event-341");
    const kuramotoPlans = getEnhancementPlanOptions("jkface-event-341", "倉本堇");

    expect(profiles.map((profile) => profile.personName)).toContain("倉本堇");
    expect(kuramotoPlans.map((plan) => plan.planName)).toContain("白羽聖域");
    expect(kuramotoPlans[0]?.sessions[0]).toEqual(
      expect.objectContaining({
        date: "2026/07/03",
        start: "11:00",
        end: "11:50",
        outfit: "性感內衣A"
      })
    );
  });
});
