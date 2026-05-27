import React from "react";
import { render } from "@testing-library/react";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { Bounds, BoundsProps } from "../bounds";

describe("<Bounds />", () => {
  const fakeProps = (): BoundsProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("skips disabled overlays", () => {
    const { container } = render(<Bounds {...fakeProps()} />);
    expect(container.innerHTML).toEqual("");
  });

  it("renders bounds", () => {
    const p = fakeProps();
    p.config.bounds = true;
    const { container } = render(<Bounds {...p} />);
    expect(container).toContainHTML("bounds");
  });
});
