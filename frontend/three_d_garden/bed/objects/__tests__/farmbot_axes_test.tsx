import React from "react";
import { render } from "@testing-library/react";
import {
  FarmbotAxes, farmbotAxesPropsEqual, FarmbotAxesProps,
} from "../farmbot_axes";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<FarmbotAxes />", () => {
  const fakeProps = (): FarmbotAxesProps => ({
    config: clone(INITIAL)
  });

  it("renders", () => {
    const { container } = render(<FarmbotAxes {...fakeProps()} />);
    expect(container.innerHTML).toContain("extrude");
  });

  it("compares axes-relevant config fields", () => {
    const p = fakeProps();
    expect(farmbotAxesPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(farmbotAxesPropsEqual(p, {
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(farmbotAxesPropsEqual(p, {
      config: { ...p.config, bedYOffset: p.config.bedYOffset + 1 },
    })).toBeFalsy();
    expect(farmbotAxesPropsEqual(p, {
      config: { ...p.config, zGantryOffset: p.config.zGantryOffset + 1 },
    })).toBeFalsy();
  });
});
