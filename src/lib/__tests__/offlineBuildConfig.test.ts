import { describe, expect, test } from "vitest";
import viteConfigText from "../../../vite.config.ts?raw";

describe("offline build config", () => {
  test('uses a relative base path for iPhone offline bundles', () => {
    expect(viteConfigText).toContain('base: "./"');
  });
});
