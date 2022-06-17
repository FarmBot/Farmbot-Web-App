jest.mock("../boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />
}));

import React from "react";
import { FarmBotSettings } from "../farmbot_os_settings";
import { shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FarmbotSettingsProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { settingsPanelState } from "../../../__test_support__/panel_state";

describe("<FarmBotSettings />", () => {
  const fakeProps = (): FarmbotSettingsProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
    bot,
    alerts: [],
    botOnline: true,
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    timeSettings: fakeTimeSettings(),
    settingsPanelState: settingsPanelState(),
  });

  it("displays boot sequence selector", () => {
    const p = fakeProps();
    p.settingsPanelState.farmbot_settings = true;
    const osSettings = shallow(<FarmBotSettings {...p} />);
    expect(osSettings.find("BootSequenceSelector").length).toEqual(1);
  });
});
