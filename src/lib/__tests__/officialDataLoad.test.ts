import { describe, expect, test } from "vitest";

import { loadOfficialEventData } from "../loadData";

describe("loadOfficialEventData", () => {
  test("loads official JKFace events separately from personal events", () => {
    const result = loadOfficialEventData();

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String)
    });
  });
});
