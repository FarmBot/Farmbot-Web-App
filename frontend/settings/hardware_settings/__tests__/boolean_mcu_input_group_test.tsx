import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import * as deviceActions from "../../../devices/actions";
import { bot } from "../../../__test_support__/fake_state/bot";
import { BooleanMCUInputGroupProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";
import * as ui from "../../../ui";
import { ToggleButtonProps } from "../../../ui/toggle_button";

let settingToggleSpy: jest.SpyInstance;
let toggleButtonSpy: jest.SpyInstance;

beforeEach(() => {
  settingToggleSpy = jest.spyOn(deviceActions, "settingToggle")
    .mockImplementation(jest.fn());
  toggleButtonSpy = jest.spyOn(ui, "ToggleButton")
    .mockImplementation(((props: ToggleButtonProps) =>
      <button
        data-testid="toggle-button"
        data-grayscale={props.grayscale ? "true" : "false"}
        disabled={props.disabled}
        onClick={props.toggleAction} />) as never);
});

afterEach(() => {
  toggleButtonSpy.mockRestore();
});

describe("BooleanMCUInputGroup", () => {
  const fakeProps = (): BooleanMCUInputGroupProps => ({
    sourceFwConfig: x => ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    dispatch: jest.fn(),
    tooltip: "Tooltip",
    label: DeviceSetting.invertEncoders,
    x: "encoder_invert_x",
    y: "encoder_invert_y",
    z: "encoder_invert_z",
  });

  enum Buttons { xAxis, yAxis, zAxis }

  it("triggers callbacks", () => {
    render(<BooleanMCUInputGroup {...fakeProps()} />);
    const buttons = screen.getAllByTestId("toggle-button");
    fireEvent.click(buttons[Buttons.xAxis]);
    expect(settingToggleSpy).toHaveBeenLastCalledWith("encoder_invert_x",
      expect.any(Function), undefined);
    fireEvent.click(buttons[Buttons.yAxis]);
    expect(settingToggleSpy).toHaveBeenLastCalledWith("encoder_invert_y",
      expect.any(Function), undefined);
    fireEvent.click(buttons[Buttons.zAxis]);
    expect(settingToggleSpy).toHaveBeenLastCalledWith("encoder_invert_z",
      expect.any(Function), undefined);
  });

  it("displays gray toggles", () => {
    const p = fakeProps();
    p.grayscale = { x: true, y: false, z: false };
    render(<BooleanMCUInputGroup {...p} />);
    const buttons = screen.getAllByTestId("toggle-button");
    expect(buttons[Buttons.xAxis]?.getAttribute("data-grayscale"))
      .toEqual("true");
    expect(buttons[Buttons.yAxis]?.getAttribute("data-grayscale"))
      .toEqual("false");
  });

  it("disables toggles", () => {
    const p = fakeProps();
    p.disable = { x: false, y: false, z: false };
    p.disabled = true;
    render(<BooleanMCUInputGroup {...p} />);
    screen.getAllByTestId("toggle-button").map(button =>
      expect((button as HTMLButtonElement).disabled).toEqual(true));
  });

  it("disables axis toggles", () => {
    const p = fakeProps();
    p.disable = { x: true, y: true, z: true };
    p.disabled = false;
    render(<BooleanMCUInputGroup {...p} />);
    screen.getAllByTestId("toggle-button").map(button =>
      expect((button as HTMLButtonElement).disabled).toEqual(true));
  });

  it("overrides advanced hide", () => {
    const p = fakeProps();
    p.advanced = true;
    p.showAdvanced = false;
    bot.hardware.mcu_params.encoder_invert_x = 0;
    bot.hardware.mcu_params.encoder_invert_y = 0;
    bot.hardware.mcu_params.encoder_invert_z = 1;
    const { container } = render(<BooleanMCUInputGroup {...p} />);
    expect(container.querySelector(".setting")?.hasAttribute("hidden"))
      .toEqual(false);
  });
});
