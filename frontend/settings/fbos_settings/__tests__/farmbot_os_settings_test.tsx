jest.mock("../boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />
}));

import * as React from "react";
import { FarmBotSettings } from "../farmbot_os_settings";
import { shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FarmbotSettingsProps } from "../../../devices/interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

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
    timeSettings: fakeTimeSettings(),
  });

  it("displays boot sequence selector", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const osSettings = shallow(<FarmBotSettings {...p} />);
    expect(osSettings.find("BootSequenceSelector").length).toEqual(1);
  });
});
