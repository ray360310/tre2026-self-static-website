import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import App from "../App";

test("renders tab labels", () => {
  render(<App />);
  expect(screen.getByText("我的行程")).toBeInTheDocument();
  expect(screen.getByText("衝突分析")).toBeInTheDocument();
  expect(screen.getByText("TRE2026 活動")).toBeInTheDocument();
});
