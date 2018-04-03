const mockDevice = {
  execScript: jest.fn(() => Promise.resolve()),
};

jest.mock("../../../device", () => ({
  getDevice: () => {
    return mockDevice;
  }
}));

jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetector } from "../index";
import { FarmwareProps } from "../../../devices/interfaces";

describe("<WeedDetector />", () => {
  const props: FarmwareProps = {
    timeOffset: 0,
    farmwares: {},
    botToMqttStatus: "up",
    env: {},
    user_env: {},
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
    syncStatus: "synced",
    webAppConfig: {},
    firstPartyFarmwareNames: []
  };

  it("renders", () => {
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

  it("executes plant detection", () => {
    const dispatch = jest.fn();
    props.dispatch = dispatch;
    const wrapper = shallow(<WeedDetector {...props} />);
    wrapper.find("TitleBar").simulate("test");
    dispatch.mock.calls[0][0]()();
    expect(mockDevice.execScript).toHaveBeenCalledWith("plant-detection");
  });

  it("executes clear weeds", () => {
    const wrapper = shallow(<WeedDetector {...props} />);
    expect(wrapper.state().deletionProgress).toBeUndefined();
    wrapper.find("TitleBar").simulate("deletionClick");
    expect(wrapper.state().deletionProgress).toEqual("Deleting...");
  });
});
