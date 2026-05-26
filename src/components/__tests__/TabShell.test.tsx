import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import App from "../../App";

describe("TabShell", () => {
  test("switches tabs", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole("heading", { name: "已購活動" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "衝突分析" }));

    expect(screen.getByRole("heading", { name: "衝突總覽" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "TRE2026 活動" }));

    expect(screen.getByRole("heading", { name: "活動總覽" })).toBeInTheDocument();
  });
});
