import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorHandling } from "../error_handling";
import { ErrorHandlingProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as deviceActions from "../../../devices/actions";
import * as ui from "../../../ui";
import { ToggleButtonProps } from "../../../ui/toggle_button";

let settingToggleSpy: jest.SpyInstance;
let toggleButtonSpy: jest.SpyInstance;
const TOGGLE_ACTION = { type: "TOGGLE_MCU" };

beforeEach(() => {
  settingToggleSpy = jest.spyOn(deviceActions, "settingToggle")
    .mockImplementation(() => TOGGLE_ACTION as never);
  toggleButtonSpy = jest.spyOn(ui, "ToggleButton")
    .mockImplementation(((props: ToggleButtonProps) =>
      <button data-testid="toggle-button" onClick={props.toggleAction} />) as never);
});

afterEach(() => {
  settingToggleSpy.mockRestore();
  toggleButtonSpy.mockRestore();
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
    const { container } = render(<ErrorHandling {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("error handling");
  });

  it("toggles retries e-stop parameter", () => {
    const p = fakeProps();
    p.settingsPanelState.error_handling = true;
    p.sourceFwConfig = () => ({ value: 1, consistent: true });
    render(<ErrorHandling {...p} />);
    fireEvent.click(screen.getByTestId("toggle-button"));
    expect(deviceActions.settingToggle)
      .toHaveBeenCalledWith("param_e_stop_on_mov_err", p.sourceFwConfig);
    expect(p.dispatch).toHaveBeenCalledWith(TOGGLE_ACTION);
  });

  it("shows new parameters", () => {
    const p = fakeProps();
    p.settingsPanelState.error_handling = true;
    const { container } = render(<ErrorHandling {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("total");
  });
});
