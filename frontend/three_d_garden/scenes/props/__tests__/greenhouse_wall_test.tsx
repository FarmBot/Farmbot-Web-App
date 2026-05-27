import React from "react";
import { render } from "@testing-library/react";
import { GreenhouseWall } from "../greenhouse_wall";

describe("<GreenhouseWall />", () => {
  it("renders", () => {
    const { container } = render(<GreenhouseWall />);
    expect(container).toContainHTML("greenhouse-wall");
  });

  it("memoizes the static wall subtree", () => {
    const memoized = GreenhouseWall as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });
});
