import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BooleanSetting } from "../../../session_keys";
import {
  moveWidgetSetting, MoveWidgetSettingsMenu, MoveWidgetSettingsMenuProps,
} from "../settings_menu";
import { DeviceSetting } from "../../../constants";
import * as configStorageActions from "../../../config_storage/actions";

let toggleWebAppBoolSpy: jest.SpyInstance;

describe("moveWidgetSetting()", () => {
  beforeEach(() => {
    toggleWebAppBoolSpy = jest.spyOn(configStorageActions, "toggleWebAppBool")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    toggleWebAppBoolSpy.mockRestore();
  });

  it("toggles setting", () => {
    const Setting = moveWidgetSetting(jest.fn(), jest.fn(() => true));
    const { container } = render(<Setting
      label={DeviceSetting.invertJogButtonXAxis}
      setting={BooleanSetting.xy_swap} />);
    ["x axis", "yes"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
    fireEvent.click(screen.getByRole("button"));
    expect(toggleWebAppBoolSpy).toHaveBeenCalledWith(BooleanSetting.xy_swap);
  });
});

describe("<MoveWidgetSettingsMenu />", () => {
  beforeEach(() => {
    toggleWebAppBoolSpy = jest.spyOn(configStorageActions, "toggleWebAppBool")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    toggleWebAppBoolSpy.mockRestore();
  });

  const fakeProps = (): MoveWidgetSettingsMenuProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    firmwareHardware: undefined,
  });

  it("displays motor plot toggle", () => {
    render(<MoveWidgetSettingsMenu {...fakeProps()} />);
    expect(screen.getByText(/motor position/i)).toBeInTheDocument();
  });

  it("displays encoder toggles", () => {
    const { container } = render(<MoveWidgetSettingsMenu {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("encoder");
  });

  it("doesn't display encoder toggles", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<MoveWidgetSettingsMenu {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("encoder");
  });
});
