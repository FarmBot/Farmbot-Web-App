jest.mock("../fbos_settings/boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />
}));

let mockDev = false;
jest.mock("../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import * as React from "react";
import { FarmbotOsSettings, FarmBotSettings } from "../farmbot_os_settings";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  FarmbotOsProps, FarmbotSettingsProps, ControlPanelState,
} from "../../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<FarmbotOsSettings />", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  const fakeProps = (): FarmbotOsProps => ({
    deviceAccount: fakeDevice(),
    dispatch: jest.fn(),
    bot,
    alerts: [],
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    shouldDisplay: jest.fn(() => true),
    env: {},
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("renders settings", () => {
    const p = fakeProps();
    p.bot.controlPanelState.farmbot_os = true;
    const osSettings = mount(<FarmbotOsSettings {...p} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(6);
    ["name", "time zone", "farmbot os", "camera"]
      .map(string => expect(osSettings.text().toLowerCase()).toContain(string));
  });

  it("renders expanded", () => {
    mockDev = true;
    const p = fakeProps();
    Object.keys(p.bot.controlPanelState).map((panel: keyof ControlPanelState) => {
      p.bot.controlPanelState[panel] = true;
    });
    const wrapper = mount(<FarmbotOsSettings {...p} />);
    ["camera", "name"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("<FarmBotSettings />", () => {
  const fakeProps = (): FarmbotSettingsProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
    bot,
    alerts: [],
    botOnline: true,
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    shouldDisplay: jest.fn(() => true),
    env: {},
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("displays boot sequence selector", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const osSettings = shallow(<FarmBotSettings {...p} />);
    expect(osSettings.find("BootSequenceSelector").length).toEqual(1);
  });
});
