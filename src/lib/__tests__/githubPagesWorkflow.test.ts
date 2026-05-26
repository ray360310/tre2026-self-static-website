import viteWorkflowText from "../../../.github/workflows/deploy-pages.yml?raw";
import { describe, expect, test } from "vitest";

describe("GitHub Pages workflow", () => {
  test("deploys the Vite build with GitHub Pages actions", () => {
    expect(viteWorkflowText).toContain("actions/configure-pages");
    expect(viteWorkflowText).toContain("actions/upload-pages-artifact");
    expect(viteWorkflowText).toContain("actions/deploy-pages");
  });
});
