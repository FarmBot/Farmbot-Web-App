jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import {
  FbosDetails, colorFromTemp, betaReleaseOptIn, colorFromThrottle, ThrottleType
} from "../fbos_details";
import { shallow, mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { FbosDetailsProps } from "../interfaces";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice
} from "../../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../../api/crud";
import { fakeTimeSettings } from "../../../../__test_support__/fake_time_settings";

describe("<FbosDetails/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): FbosDetailsProps => ({
    botInfoSettings: bot.hardware.informational_settings,
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    shouldDisplay: () => false,
    botToMqttLastSeen: 0,
    deviceAccount: fakeDevice(),
    timeSettings: fakeTimeSettings(),
  });

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
    p.botInfoSettings.uptime = 0;
    p.botInfoSettings.memory_usage = 0;
    p.botInfoSettings.disk_usage = 0;

    const wrapper = mount(<FbosDetails {...p} />);
    ["Environment", "fakeEnv",
      "Commit", "fakeComm",
      "Target", "fakeTarget",
      "Node name", "fakeName",
      "Firmware", "fakeFirmware",
      "Firmware commit", "fakeFwCo",
      "FAKETARGET CPU temperature", "48.3", "C",
      "WiFi strength", "-49dBm",
      "Beta release Opt-In",
      "Uptime", "0 seconds",
      "Memory usage", "0MB",
      "Disk usage", "0%",
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

  it("displays commit link", () => {
    const p = fakeProps();
    p.botInfoSettings.commit = "abcdefgh";
    p.botInfoSettings.firmware_commit = "abcdefgh";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").length).toEqual(2);
  });

  it("doesn't display link without commit", () => {
    const p = fakeProps();
    p.botInfoSettings.commit = "---";
    p.botInfoSettings.firmware_commit = "---";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").length).toEqual(0);
  });

  it("toggles os beta opt in setting on", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: true });
    const wrapper = mount(<FbosDetails {...p} />);
    window.confirm = jest.fn();
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("you sure?"));
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    window.confirm = () => true;
    wrapper.find("button").simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { beta_opt_in: true });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("toggles os beta opt in setting off", () => {
    bot.hardware.configuration.beta_opt_in = true;
    const wrapper = mount(<FbosDetails {...fakeProps()} />);
    window.confirm = () => false;
    wrapper.find("button").simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { beta_opt_in: false });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("displays N/A when wifi strength value is undefined", () => {
    const p = fakeProps();
    p.botInfoSettings.wifi_level = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("WiFi strength: N/A");
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
    p.botInfoSettings.uptime = undefined;
    p.botInfoSettings.memory_usage = undefined;
    p.botInfoSettings.disk_usage = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    ["uptime", "usage"].map(metric =>
      expect(wrapper.text().toLowerCase()).not.toContain(metric));
  });

  it("displays uptime in minutes", () => {
    const p = fakeProps();
    p.botInfoSettings.uptime = 120;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 minutes");
  });

  it("displays uptime in hours", () => {
    const p = fakeProps();
    p.botInfoSettings.uptime = 7200;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 hours");
  });

  it("displays uptime in days", () => {
    const p = fakeProps();
    p.botInfoSettings.uptime = 172800;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 days");
  });

  it("doesn't display when throttled value is undefined", () => {
    const p = fakeProps();
    p.botInfoSettings.throttled = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("voltage");
  });

  it("displays voltage indicator", () => {
    const p = fakeProps();
    p.botInfoSettings.throttled = "0x0";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("voltage");
  });

  it("displays cpu usage", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    (p.botInfoSettings as any).cpu_usage = 10;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("cpu usage: 10%");
  });

  it("displays ip address", () => {
    const p = fakeProps();
    p.botInfoSettings.private_ip = "192.168.0.100";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("ip address");
  });

  it("displays last OTA check date", () => {
    const p = fakeProps();
    p.deviceAccount.body.last_ota_checkup = "2018-01-11T20:20:38.362Z";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("last checked for updates: january");
  });

  it("displays last OTA date", () => {
    const p = fakeProps();
    p.deviceAccount.body.last_ota = "2018-02-11T20:20:38.362Z";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("last updated: february");
  });
});

describe("betaReleaseOptIn()", () => {
  it("uses `beta_opt_in`: beta enabled", () => {
    const result = betaReleaseOptIn({
      sourceFbosConfig: () => ({ value: true, consistent: true }),
      shouldDisplay: () => false
    });
    expect(result).toEqual({
      betaOptIn: { consistent: true, value: true },
      betaOptInValue: true,
      update: { beta_opt_in: false }
    });
  });

  it("uses `beta_opt_in`: beta disabled", () => {
    const result = betaReleaseOptIn({
      sourceFbosConfig: () => ({ value: false, consistent: true }),
      shouldDisplay: () => false
    });
    expect(result).toEqual({
      betaOptIn: { consistent: true, value: false },
      betaOptInValue: false,
      update: { beta_opt_in: true }
    });
  });

  it("uses `update_channel`: beta enabled", () => {
    const result = betaReleaseOptIn({
      sourceFbosConfig: () => ({ value: "beta", consistent: true }),
      shouldDisplay: () => true
    });
    expect(result).toEqual({
      betaOptIn: { consistent: true, value: true },
      betaOptInValue: true,
      update: { update_channel: "stable" }
    });
  });

  it("uses `update_channel`: beta disabled", () => {
    const result = betaReleaseOptIn({
      sourceFbosConfig: () => ({ value: "stable", consistent: true }),
      shouldDisplay: () => true
    });
    expect(result).toEqual({
      betaOptIn: { consistent: true, value: false },
      betaOptInValue: false,
      update: { update_channel: "beta" }
    });
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

describe("colorFromThrottle()", () => {
  it("is currently throttled", () => {
    expect(colorFromThrottle("0x40004", ThrottleType.Throttled)).toEqual("red");
  });
  it("was throttled", () => {
    expect(colorFromThrottle("0x40000", ThrottleType.Throttled)).toEqual("yellow");
  });
  it("hasn't been throttled", () => {
    expect(colorFromThrottle("0x0", ThrottleType.Throttled)).toEqual("green");
  });
});
