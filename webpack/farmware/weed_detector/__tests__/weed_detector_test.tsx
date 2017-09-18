jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { WeedDetector } from "../index";
import { FarmwareProps } from "../../../devices/interfaces";

describe("<WeedDetector />", () => {
  it("renders", () => {
    const props: FarmwareProps = {
      farmwares: {},
      syncStatus: "unknown",
      env: {},
      dispatch: jest.fn(),
      currentImage: undefined,
      images: []
    };
    const wrapper = mount(<WeedDetector {...props} />);
    expect(wrapper.text()).toContain("Weed Detector");
    expect(wrapper.text()).toContain("Color Range");
    expect(wrapper.text()).toContain("HUE01793090");
    expect(wrapper.text()).toContain("SATURATION025550255");
    expect(wrapper.text()).toContain("VALUE025550255");
    expect(wrapper.text()).toContain("Processing Parameters");
    expect(wrapper.text()).toContain("Scan image");
  });
});
