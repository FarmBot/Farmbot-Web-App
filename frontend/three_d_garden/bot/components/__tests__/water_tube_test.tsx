import React from "react";
import { render } from "@testing-library/react";
import { WaterTube, WaterTubeProps } from "../water_tube";
import { easyCubicBezierCurve3 } from "../../../helpers";

describe("<WaterTube />", () => {
  const fakeProps = (): WaterTubeProps => ({
    tubeName: "mock-tube",
    tubePath: easyCubicBezierCurve3([0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]),
    tubularSegments: 1,
    radius: 1,
    radialSegments: 1,
    waterFlow: false,
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<WaterTube {...p} />);
    expect(container.innerHTML).toContain("mock-tube-tube");
  });
});
