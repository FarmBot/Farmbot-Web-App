import React from "react";
import { mount } from "enzyme";
import { XAxisWaterTubeProps, XAxisWaterTube } from "../x_axis_water_tube";
import { clone } from "lodash";
import { INITIAL } from "../config";

describe("<XAxisWaterTube />", () => {
  const fakeProps = (): XAxisWaterTubeProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<XAxisWaterTube {...fakeProps()} />);
    expect(wrapper.html()).toContain("x-axis-water-tube");
  });
});
