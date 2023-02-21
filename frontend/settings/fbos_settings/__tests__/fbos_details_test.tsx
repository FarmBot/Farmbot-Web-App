jest.mock("../../../devices/actions", () => ({ updateConfig: jest.fn() }));

import React from "react";
import {
  FbosDetails, colorFromTemp, colorFromThrottle, ThrottleType,
  OSReleaseChannelSelectionProps, OSReleaseChannelSelection, reformatFwVersion,
  reformatFbosVersion, MacAddress, MacAddressProps, colorFromMemoryUsage,
  convertUptime,
  PiDisplay,
  PiDisplayProps,
} from "../fbos_details";
import { shallow, mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FbosDetailsProps } from "../interfaces";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { updateConfig } from "../../../devices/actions";
import { FirmwareHardware } from "farmbot";

describe("<FbosDetails />", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): FbosDetailsProps => ({
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    bot: bot,
    deviceAccount: fakeDevice(),
    timeSettings: fakeTimeSettings(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.env = "fakeEnv";
    p.bot.hardware.informational_settings.commit = "fakeCommit";
    p.bot.hardware.informational_settings.target = "fakeTarget";
    p.bot.hardware.informational_settings.node_name = "fakeName";
    p.bot.hardware.informational_settings.firmware_version = "0.0.0.R.ramps";
    p.bot.hardware.informational_settings.firmware_commit = "fakeFwCommit";
    p.bot.hardware.informational_settings.soc_temp = 48.3;
    p.bot.hardware.informational_settings.wifi_level = -49;
    p.bot.hardware.informational_settings.uptime = 0;
    p.bot.hardware.informational_settings.memory_usage = 0;
    p.bot.hardware.informational_settings.disk_usage = 0;
    p.deviceAccount.body.id = 12345;
    p.deviceAccount.body.fbos_version = "1.0.0";
    p.sourceFbosConfig = () => ({ value: "ttyACM0", consistent: true });

    const wrapper = mount(<FbosDetails {...p} />);
    ["Environment", "fakeEnv",
      "Commit", "fakeComm",
      "Target", "fakeTarget",
      "Node name", "fakeName",
      "Version last seen", "1.0.0",
      "Device ID", "12345",
      "Firmware", "0.0.0 Arduino/RAMPS (Genesis v1.2)",
      "Firmware commit", "fakeFwCo",
      "Firmware code", "0.0.0.R.ramps",
      "Firmware path", "ttyACM0",
      "FAKETARGET CPU temperature", "48.3", "C",
      "WiFi strength", "81%",
      "OS release channel",
      "Uptime", "0 seconds",
      "Memory usage", "0MB",
      "Disk usage", "0%",
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

  it("handles missing data", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: undefined, consistent: true });
    p.bot.hardware.informational_settings.firmware_version = undefined;
    p.bot.hardware.informational_settings.node_name = "";
    p.bot.hardware.informational_settings.commit = "";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("---");
  });

  it("handles unknown firmware version", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "0.0.0.S.S";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("0.0.0");
  });

  it("displays firmware commit link from firmware_commit", () => {
    const p = fakeProps();
    const commit = "abcdefgh";
    p.bot.hardware.informational_settings.firmware_commit = commit;
    p.bot.hardware.informational_settings.firmware_version = "1.0.0";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").last().text()).toEqual(commit);
    expect(wrapper.find("a").last().props().href?.split("/").slice(-1)[0])
      .toEqual(commit);
  });

  it("displays firmware commit link from version", () => {
    const p = fakeProps();
    const commit = "abcdefgh";
    p.bot.hardware.informational_settings.firmware_version = `1.2.3.R.x-${commit}+`;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").last().text()).toEqual(commit);
    expect(wrapper.find("a").last().props().href?.split("/").slice(-1)[0])
      .toEqual(commit);
  });

  it("displays commit link", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.commit = "abcdefgh";
    p.bot.hardware.informational_settings.firmware_commit = "abcdefgh";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").length).toEqual(2);
  });

  it("doesn't display link without commit", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = undefined;
    p.bot.hardware.informational_settings.commit = "---";
    p.bot.hardware.informational_settings.firmware_commit = "---";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.find("a").length).toEqual(0);
  });

  it("displays N/A when wifi strength value is undefined", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.wifi_level = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("WiFi strength: N/A");
    expect(wrapper.text()).not.toContain("dBm");
  });

  it.each<[number, string]>([
    [10, "gray"],
    [50, "red"],
    [70, "yellow"],
    [90, "green"],
  ])("displays correct wifi signal strength indicator color: %s %s",
    (percent, color) => {
      const p = fakeProps();
      p.bot.hardware.informational_settings.wifi_level_percent = percent;
      const wrapper = mount(<FbosDetails {...p} />);
      expect(wrapper.find(".percent-bar-fill").hasClass(color)).toBeTruthy();
    });

  it("displays unknown when cpu temp value is undefined", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.soc_temp = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("CPU temperature: Unknown");
    expect(wrapper.text()).not.toContain("&deg;C");
  });

  it("doesn't display extra metrics when bot is offline", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.uptime = undefined;
    p.bot.hardware.informational_settings.memory_usage = undefined;
    p.bot.hardware.informational_settings.disk_usage = undefined;
    const wrapper = mount(<FbosDetails {...p} />);
    ["uptime"].map(metric =>
      expect(wrapper.text().toLowerCase()).not.toContain(metric));
  });

  it("displays uptime in minutes", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.uptime = 120;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 minutes");
  });

  it("displays uptime in hours", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.uptime = 7200;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 hours");
  });

  it("displays uptime in days", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.uptime = 172800;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text()).toContain("2 days");
  });

  it("displays voltage indicator", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.throttled = "0x0";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.html()).toContain("voltage-saucer");
  });

  it("displays cpu usage", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.cpu_usage = 10;
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("cpu usage: 10%");
  });

  it("displays ip address", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.private_ip = "192.168.0.100";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("local ip");
  });

  it("displays last OTA date", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p.deviceAccount.body as any).last_ota = "2018-02-11T20:20:38.362Z";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("last updated: february");
  });

  it("displays video devices", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.video_devices = "1,0";
    const wrapper = mount(<FbosDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("1,0");
  });
});

describe("<OSReleaseChannelSelection />", () => {
  const fakeProps = (): OSReleaseChannelSelectionProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
  });

  it("changes to beta channel", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "stable", consistent: true });
    const wrapper = shallow(<OSReleaseChannelSelection {...p} />);
    window.confirm = jest.fn();
    wrapper.find("FBSelect").simulate("change", { label: "", value: "" });
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("you sure?"));
    expect(updateConfig).not.toHaveBeenCalled();
    window.confirm = () => true;
    wrapper.find("FBSelect").simulate("change", { label: "", value: "beta" });
    expect(updateConfig).toHaveBeenCalledWith({ update_channel: "beta" });
  });

  it("changes to stable channel", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "beta", consistent: true });
    const wrapper = shallow(<OSReleaseChannelSelection {...p} />);
    window.confirm = () => false;
    wrapper.find("FBSelect").simulate("change", { label: "", value: "stable" });
    expect(updateConfig).toHaveBeenCalledWith({ update_channel: "stable" });
  });

  it("shows options", () => {
    const wrapper = shallow(<OSReleaseChannelSelection {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().list).toEqual([
      { label: "stable", value: "stable" },
      { label: "beta", value: "beta" },
      { label: "alpha", value: "alpha" },
    ]);
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

describe("<PiDisplay />", () => {
  const fakeProps = (): PiDisplayProps => ({
    chip: "rpi",
    firmware: "arduino",
  });

  it.each<[string, string, FirmwareHardware | undefined]>([
    ["Zero W", "rpi", "arduino"],
    ["3", "rpi3", "arduino"],
    ["Zero 2 W", "rpi3", "express_k11"],
    ["4", "rpi4", "arduino"],
    ["Unknown", "", undefined],
  ])("returns correct pi model: %s", (expected, chip, firmware) => {
    const p = fakeProps();
    p.chip = chip;
    p.firmware = firmware;
    const wrapper = mount(<PiDisplay {...p} />);
    expect(wrapper.text()).toContain(expected);
  });
});

describe("colorFromMemoryUsage()", () => {
  it("memory usage is missing", () => {
    expect(colorFromMemoryUsage(undefined)).toEqual("gray");
  });

  it("memory usage is low", () => {
    expect(colorFromMemoryUsage(30)).toEqual("green");
  });

  it("memory usage is medium", () => {
    expect(colorFromMemoryUsage(200)).toEqual("yellow");
  });

  it("memory usage is high", () => {
    expect(colorFromMemoryUsage(400)).toEqual("red");
  });
});

describe("<MacAddress />", () => {
  const fakeProps = (): MacAddressProps => ({
    nodeName: undefined,
    target: undefined,
    wifi: false,
  });

  it.each<[string, string | undefined, string | undefined, boolean]>([
    ["MAC address: ---", undefined, undefined, false],
    ["MAC address: ---", "---", "rpi", false],
    ["MAC address: b8:27:eb:34:56:78", "farmbot-12345678.local", undefined, false],
    ["MAC address: dc:a6:32:cd:ef:gh", "farmbot-00000000abcdefgh", "rpi4", false],
    ["MAC address: dc:a6:32:55:98:ba", "farmbot-00000000abcdefgh", "rpi4", true],
  ])("renders formatted MAC address: %s", (expected, nodeName, target, wifi) => {
    const p = fakeProps();
    p.nodeName = nodeName;
    p.target = target;
    p.wifi = wifi;
    const wrapper = mount(<MacAddress {...p} />);
    expect(wrapper.text()).toEqual(expected);
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

describe("convertUptime()", () => {
  it("returns abbreviated time units", () => {
    expect(convertUptime(12, true)).toEqual("12 sec");
    expect(convertUptime(120, true)).toEqual("2 min");
    expect(convertUptime(7200, true)).toEqual("2 hours");
  });
});

describe("reformatFwVersion()", () => {
  it("returns version string", () => {
    expect(reformatFwVersion("1.0.0.R"))
      .toEqual("v1.0.0 Arduino/RAMPS (Genesis v1.2)");
    expect(reformatFwVersion("1.0.0.F.x"))
      .toEqual("v1.0.0 Farmduino (Genesis v1.3)");
  });

  it("returns null version string", () => {
    expect(reformatFwVersion(undefined)).toEqual("---");
    expect(reformatFwVersion("---")).toEqual("--- ");
  });
});

describe("reformatFbosVersion()", () => {
  it("returns version string", () => {
    expect(reformatFbosVersion("1.0.0-rc1")).toEqual("v1.0.0-rc1");
  });

  it("returns null version string", () => {
    expect(reformatFbosVersion(undefined)).toEqual("Unknown");
  });
});
