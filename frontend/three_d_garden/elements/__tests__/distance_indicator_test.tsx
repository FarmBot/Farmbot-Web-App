import React from "react";
import { render } from "@testing-library/react";
import { DistanceIndicator, DistanceIndicatorProps } from "../distance_indicator";

describe("<DistanceIndicator />", () => {
  const fakeProps = (): DistanceIndicatorProps => ({
    start: { x: 0, y: 0, z: 0 },
    end: { x: 100, y: 0, z: 0 },
  });

  it("renders", () => {
    const { container } = render(<DistanceIndicator {...fakeProps()} />);
    expect(container.innerHTML).toContain("box");
    expect(container.innerHTML).toContain("text");
    expect(container.innerHTML).toContain("arrow");
    expect(container.innerHTML).toContain("100mm");
    expect(container.innerHTML).toContain("extrude");
  });
});
