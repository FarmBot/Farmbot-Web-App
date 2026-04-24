import React from "react";
import { render, screen } from "@testing-library/react";
import { FallInGroup, PopInGroup } from "../progressive_load";

describe("<PopInGroup />", () => {
  it("renders children inside a named load-in group", () => {
    const { container } = render(<PopInGroup name={"bed-load-in"}>
      <span>content</span>
    </PopInGroup>);

    expect(container.innerHTML).toContain("bed-load-in");
    expect(screen.getByText("content")).toBeTruthy();
  });
});

describe("<FallInGroup />", () => {
  it("renders children inside a named load-in group", () => {
    const { container } = render(<FallInGroup name={"bot-load-in"}>
      <span>bot</span>
    </FallInGroup>);

    expect(container.innerHTML).toContain("bot-load-in");
    expect(screen.getByText("bot")).toBeTruthy();
  });
});
