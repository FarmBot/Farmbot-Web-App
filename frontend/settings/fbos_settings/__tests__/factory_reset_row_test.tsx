import React from "react";
import { render, screen } from "@testing-library/react";
import { FactoryResetRows } from "../factory_reset_row";
import { FactoryResetRowsProps } from "../interfaces";

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("<FactoryResetRows />", () => {
  const fakeProps = (): FactoryResetRowsProps => ({
    botOnline: true,
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<FactoryResetRows {...fakeProps()} />);
    expect(screen.getByRole("button", { name: /soft reset/i }))
      .toBeInTheDocument();
    const hardResetLinks = Array.from(container.querySelectorAll("a"))
      .filter(link => /hard reset/i.test(link.textContent || ""));
    expect(hardResetLinks.length).toBeGreaterThan(0);
  });
});
