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
import { FbosDetailsProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<FbosDetails/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): FbosDetailsProps => {
    return {
      bot,
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders", () => {
    bot.hardware.informational_settings.env = "fakeEnv";
    bot.hardware.informational_settings.commit = "fakeCommit";
    bot.hardware.informational_settings.target = "fakeTarget";
    bot.hardware.informational_settings.node_name = "fakeName";
    bot.hardware.informational_settings.firmware_version = "fakeFirmware";
    bot.hardware.informational_settings.firmware_commit = "fakeFwCommit";
    const wrapper = shallow(<FbosDetails {...fakeProps() } />);
    ["Environment", "fakeEnv",
      "Commit", "fakeComm",
      "Target", "fakeTarget",
      "Node name", "fakeName",
      "Firmware", "fakeFirmware",
      "Firmware commit", "fakeFwCo",
      "Beta release Opt-In"
    ]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("simplifies node name", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.node_name = "name@nodeName";
    const wrapper = shallow(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("nodeName");
    expect(wrapper.text()).not.toContain("name@");
  });

  it("toggles os beta opt in setting on", () => {
    bot.hardware.configuration.beta_opt_in = false;
    const wrapper = mount(<FbosDetails {...fakeProps() } />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
    window.confirm = () => true;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: true });
  });

  it("toggles os beta opt in setting off", () => {
    bot.hardware.configuration.beta_opt_in = true;
    const wrapper = mount(<FbosDetails {...fakeProps() } />);
    window.confirm = () => false;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: false });
  });
});
