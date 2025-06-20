jest.mock("../boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />
}));

const mockDevice = {
  flashFirmware: jest.fn((_) => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { FarmBotSettings } from "../farmbot_os_settings";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FarmbotSettingsProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import { isFunction } from "lodash";

describe("<FarmBotSettings />", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig, fakeDevice()]);

  const fakeProps = (): FarmbotSettingsProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(x => isFunction(x) && x(jest.fn(), () => state)),
    bot,
    alerts: [],
    botOnline: true,
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    timeSettings: fakeTimeSettings(),
    settingsPanelState: settingsPanelState(),
    showAdvanced: true,
    farmwareEnvs: [],
  });

  it("displays boot sequence selector", () => {
    const p = fakeProps();
    p.settingsPanelState.farmbot_settings = true;
    const osSettings = shallow(<FarmBotSettings {...p} />);
    expect(osSettings.find("BootSequenceSelector").length).toEqual(1);
  });

  it("flashes firmware", () => {
    const p = fakeProps();
    p.settingsPanelState.farmbot_settings = true;
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const wrapper = mount(<FarmBotSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("flash");
    clickButton(wrapper, 6, "flash");
    expect(mockDevice.flashFirmware).toHaveBeenCalledWith("arduino");
  });
});
