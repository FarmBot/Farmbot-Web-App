import React from "react";
import { mount } from "enzyme";
import { LimitSwitches } from "../limit_switches";
import { LimitSwitchesProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<LimitSwitches />", () => {
  const fakeProps = (): LimitSwitchesProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    showAdvanced: true,
  });

  it("shows limit switches labels", () => {
    const p = fakeProps();
    const wrapper = mount(<LimitSwitches {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("limit switches");
  });
});
