const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { FbosDetails } from "../farmbot_os_row";
import { shallow, mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<FbosDetails/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("renders", () => {
    bot.hardware.informational_settings.env = "fakeEnv";
    bot.hardware.informational_settings.commit = "fakeCommit";
    bot.hardware.informational_settings.target = "fakeTarget";
    const wrapper = shallow(<FbosDetails {...bot} />);
    ["Environment", "fakeEnv", "Commit", "fakeCommit", "Target", "fakeTarget"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("toggles os beta opt in setting on", () => {
    bot.hardware.configuration.beta_opt_in = false;
    const wrapper = mount(<FbosDetails {...bot} />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
    window.confirm = () => true;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: true });
  });

  it("toggles os beta opt in setting off", () => {
    bot.hardware.configuration.beta_opt_in = true;
    const wrapper = mount(<FbosDetails {...bot} />);
    window.confirm = () => false;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: false });
  });
});
