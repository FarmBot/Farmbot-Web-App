const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { FbosDetails, colorFromTemp } from "../fbos_details";
import { shallow, mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { FbosDetailsProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<FbosDetails/>", () => {
  const fakeProps = (): FbosDetailsProps => {
    return {
      botInfoSettings: bot.hardware.informational_settings,
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: x =>
        ({ value: bot.hardware.configuration[x], consistent: true }),
    };
  };

  it("renders", () => {
    const p = fakeProps();
    p.botInfoSettings.env = "fakeEnv";
    p.botInfoSettings.commit = "fakeCommit";
    p.botInfoSettings.target = "fakeTarget";
    p.botInfoSettings.node_name = "fakeName";
    p.botInfoSettings.firmware_version = "fakeFirmware";
    p.botInfoSettings.firmware_commit = "fakeFwCommit";
    p.botInfoSettings.soc_temp = 48.3;
    p.botInfoSettings.wifi_level = -49;
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).uptime = 100;
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).memory_usage = 100;
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).disk_usage = 100;

    const wrapper = mount(<FbosDetails {...p} />);
    ["Environment", "fakeEnv",
      "Commit", "fakeComm",
      "Target", "fakeTarget",
      "Node name", "fakeName",
      "Firmware", "fakeFirmware",
      "Firmware commit", "fakeFwCo",
      "FAKETARGET CPU temperature", "48.3", "C",
      "WiFi Strength", "-49dBm",
      "Beta release Opt-In",
      "Uptime", "100s",
      "Memory usage", "100MB",
      "Disk usage", "100%",
    ]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("simplifies node name", () => {
    const p = fakeProps();
    p.botInfoSettings.node_name = "name@nodeName";
    const wrapper = shallow(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("nodeName");
    expect(wrapper.text()).not.toContain("name@");
  });

  it("toggles os beta opt in setting on", () => {
    bot.hardware.configuration.beta_opt_in = false;
    const wrapper = mount(<FbosDetails {...fakeProps()} />);
    window.confirm = jest.fn();
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("you sure?"));
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
    window.confirm = () => true;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: true });
  });

  it("toggles os beta opt in setting off", () => {
    bot.hardware.configuration.beta_opt_in = true;
    const wrapper = mount(<FbosDetails {...fakeProps()} />);
    window.confirm = () => false;
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ beta_opt_in: false });
  });

  it("displays N/A when wifi strength value is undefined", () => {
    const p = fakeProps();
    p.botInfoSettings.wifi_level = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("WiFi Strength: N/A");
    expect(wrapper.text()).not.toContain("dBm");
  });

  it("displays unknown when cpu temp value is undefined", () => {
    const p = fakeProps();
    p.botInfoSettings.soc_temp = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("CPU temperature: unknown");
    expect(wrapper.text()).not.toContain("&deg;C");
  });

  it("doesn't display extra metrics when bot is offline", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).uptime = undefined;
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).memory_usage = undefined;
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).disk_usage = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    ["uptime", "usage"].map(metric =>
      expect(wrapper.text().toLowerCase()).not.toContain(metric));
  });
});

describe("colorFromTemp()", () => {
  it("temperature is good or none", () => {
    expect(colorFromTemp(30)).toEqual("green");
    expect(colorFromTemp(undefined)).toEqual("gray");
  });
  it("temperature is hot", () => {
    expect(colorFromTemp(61)).toEqual("yellow");
    expect(colorFromTemp(76)).toEqual("red");
  });
  it("temperature is cold", () => {
    expect(colorFromTemp(9)).toEqual("blue");
    expect(colorFromTemp(-1)).toEqual("lightblue");
  });
});
