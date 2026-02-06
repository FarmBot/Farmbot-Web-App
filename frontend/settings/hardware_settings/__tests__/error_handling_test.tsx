import React from "react";
import { mount } from "enzyme";
import { ErrorHandling } from "../error_handling";
import { ErrorHandlingProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import { ToggleButton } from "../../../ui";
import * as deviceActions from "../../../devices/actions";

let settingToggleSpy: jest.SpyInstance;
const TOGGLE_ACTION = { type: "TOGGLE_MCU" };

beforeEach(() => {
  settingToggleSpy = jest.spyOn(deviceActions, "settingToggle")
    .mockImplementation(() => TOGGLE_ACTION as never);
});

afterEach(() => {
  settingToggleSpy.mockRestore();
});

describe("<ErrorHandling />", () => {
  const fakeProps = (): ErrorHandlingProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    showAdvanced: false,
  });

  it("shows error handling labels", () => {
    const p = fakeProps();
    const wrapper = mount(<ErrorHandling {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("error handling");
  });

  it("toggles retries e-stop parameter", () => {
    const p = fakeProps();
    p.settingsPanelState.error_handling = true;
    p.sourceFwConfig = () => ({ value: 1, consistent: true });
    const wrapper = mount(<ErrorHandling {...p} />);
    wrapper.find(ToggleButton).first()
      .props().toggleAction({} as React.MouseEvent);
    expect(deviceActions.settingToggle)
      .toHaveBeenCalledWith("param_e_stop_on_mov_err", p.sourceFwConfig);
    expect(p.dispatch).toHaveBeenCalledWith(TOGGLE_ACTION);
  });

  it("shows new parameters", () => {
    const p = fakeProps();
    p.settingsPanelState.error_handling = true;
    const wrapper = mount(<ErrorHandling {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("total");
  });
});
