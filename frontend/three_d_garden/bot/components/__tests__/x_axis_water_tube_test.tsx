import React from "react";
import { render } from "@testing-library/react";
import {
  XAxisWaterTubeProps, XAxisWaterTube, xAxisWaterTubePropsEqual,
} from "../x_axis_water_tube";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<XAxisWaterTube />", () => {
  const fakeProps = (): XAxisWaterTubeProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<XAxisWaterTube {...p} />);
    expect(container).toContainHTML("x-axis-water-tube");
  });

  it("memoizes unchanged water tube props", () => {
    const memoized = XAxisWaterTube as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });

  it("compares x-axis water-tube-relevant config fields", () => {
    const p = fakeProps();
    expect(xAxisWaterTubePropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(xAxisWaterTubePropsEqual(p, {
      config: { ...p.config, waterFlow: !p.config.waterFlow },
    })).toBeFalsy();
    expect(xAxisWaterTubePropsEqual(p, {
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(xAxisWaterTubePropsEqual(p, {
      config: { ...p.config, bedZOffset: p.config.bedZOffset + 1 },
    })).toBeFalsy();
  });
});
