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
import { API } from "../../../api";

describe("<WeedDetector />", () => {
  API.setBaseUrl("http://localhost:3000");

  const props: FarmwareProps = {
    timeOffset: 0,
    farmwares: {},
    botToMqttStatus: "up",
    env: {},
    user_env: {},
    dispatch: jest.fn(x => x()),
    currentImage: undefined,
    images: [],
    syncStatus: "synced",
    webAppConfig: {},
    firstPartyFarmwareNames: [],
    currentFarmware: undefined,
  };

  it("renders", () => {
    const wrapper = mount(<WeedDetector {...props} />);
    ["Color Range",
      "HUE01793090",
      "SATURATION025550255",
      "VALUE025550255",
      "Processing Parameters",
      "Scan image"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("executes plant detection", () => {
    const wrapper = shallow(<WeedDetector {...props} />);
    wrapper.find("button").first().simulate("click");
    expect(mockDevice.execScript).toHaveBeenCalledWith("plant-detection");
  });

  it("executes clear weeds", () => {
    const wrapper = shallow(<WeedDetector {...props} />);
    expect(wrapper.state().deletionProgress).toBeUndefined();
    wrapper.find("button").at(1).simulate("click");
    expect(wrapper.state().deletionProgress).toEqual("Deleting...");
  });
});
