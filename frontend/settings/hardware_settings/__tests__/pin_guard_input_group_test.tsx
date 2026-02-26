import React from "react";
import { PinGuardMCUInputGroup } from "../pin_guard_input_group";
import { fireEvent, render, screen } from "@testing-library/react";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as deviceActions from "../../../devices/actions";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { DeviceSetting } from "../../../constants";
import * as ui from "../../../ui";

let settingToggleSpy: jest.SpyInstance;
let toggleButtonSpy: jest.SpyInstance;

beforeEach(() => {
  settingToggleSpy = jest.spyOn(deviceActions, "settingToggle")
    .mockImplementation(jest.fn());
  toggleButtonSpy = jest.spyOn(ui, "ToggleButton")
    .mockImplementation((props: { toggleAction: () => void }) =>
      <button data-testid="toggle-button" onClick={props.toggleAction} />);
});

afterEach(() => {
  toggleButtonSpy.mockRestore();
});
describe("<PinGuardMCUInputGroup />", () => {
  const fakeProps = (): PinGuardMCUInputGroupProps => ({
    label: DeviceSetting.pinGuard1,
    pinNumKey: "pin_guard_1_pin_nr",
    timeoutKey: "pin_guard_1_time_out",
    activeStateKey: "pin_guard_1_active_state",
    dispatch: jest.fn(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    resources: buildResourceIndex([]).index,
    disabled: false,
  });

  it("calls toggle action", () => {
    const p = fakeProps();
    render(<PinGuardMCUInputGroup {...p} />);
    fireEvent.click(screen.getByTestId("toggle-button"));
    expect(settingToggleSpy).toHaveBeenCalledWith("pin_guard_1_active_state",
      expect.any(Function));
  });
});
