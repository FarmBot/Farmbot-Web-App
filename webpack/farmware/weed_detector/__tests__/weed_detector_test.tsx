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
      user_env: {},
      dispatch: jest.fn(),
      currentImage: undefined,
      images: []
    };
    const wrapper = mount(<WeedDetector {...props} />);
    ["Weed Detector",
      "Color Range",
      "HUE01793090",
      "SATURATION025550255",
      "VALUE025550255",
      "Processing Parameters",
      "Scan image"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
