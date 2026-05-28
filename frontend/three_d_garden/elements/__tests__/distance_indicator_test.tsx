import React from "react";
import { render } from "@testing-library/react";
import {
  DistanceIndicator, distanceIndicatorPropsEqual, DistanceIndicatorProps,
} from "../distance_indicator";

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

  it("compares distance-indicator geometry inputs", () => {
    const p = fakeProps();
    expect(distanceIndicatorPropsEqual(p, {
      start: { ...p.start },
      end: { ...p.end },
    })).toBeTruthy();
    expect(distanceIndicatorPropsEqual(p, {
      ...p,
      start: { ...p.start, x: p.start.x + 1 },
    })).toBeFalsy();
    expect(distanceIndicatorPropsEqual(p, {
      ...p,
      end: { ...p.end, z: p.end.z + 1 },
    })).toBeFalsy();
    expect(distanceIndicatorPropsEqual(p, {
      ...p,
      visible: false,
    })).toBeFalsy();
  });
});
