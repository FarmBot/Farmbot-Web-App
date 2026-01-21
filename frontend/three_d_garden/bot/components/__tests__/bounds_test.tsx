import React from "react";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { Bounds, BoundsProps } from "../bounds";

describe("<Bounds />", () => {
  const fakeProps = (): BoundsProps => ({
    config: clone(INITIAL),
  });

  it("renders bounds", () => {
    const { container } = render(<Bounds {...fakeProps()} />);
    expect(container).toContainHTML("bounds");
  });

  it("toggles bounds visibility", () => {
    const p = fakeProps();
    p.config.bounds = false;
    const { container } = render(<Bounds {...p} />);
    const line = container.querySelector("[name='bounds']");
    expect(line?.getAttribute("visible")).not.toEqual("true");
  });
});
