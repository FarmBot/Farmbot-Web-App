import React from "react";
import { render } from "@testing-library/react";
import {
  NorthArrow, northArrowPropsEqual, NorthArrowProps,
} from "../north_arrow";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<NorthArrow />", () => {
  const fakeProps = (): NorthArrowProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.north = true;
    const { container } = render(<NorthArrow {...p} />);
    expect(container).toContainHTML("north-arrow");
  });

  it("compares north-arrow-relevant config fields", () => {
    const p = fakeProps();
    expect(northArrowPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(northArrowPropsEqual(p, {
      config: { ...p.config, heading: p.config.heading + 1 },
    })).toBeFalsy();
    expect(northArrowPropsEqual(p, {
      config: { ...p.config, north: !p.config.north },
    })).toBeFalsy();
  });
});
