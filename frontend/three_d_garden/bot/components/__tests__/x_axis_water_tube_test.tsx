import React from "react";
import { render } from "@testing-library/react";
import { XAxisWaterTubeProps, XAxisWaterTube } from "../x_axis_water_tube";
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
});
