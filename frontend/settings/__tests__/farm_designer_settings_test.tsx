import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { PlainDesignerSettings, Setting } from "../farm_designer_settings";
import { DesignerSettingsPropsBase, SettingProps } from "../interfaces";
import { BooleanSetting } from "../../session_keys";
import { DeviceSetting } from "../../constants";
import * as botTrail from "../../farm_designer/map/layers/farmbot/bot_trail";
import * as configStorageActions from "../../config_storage/actions";
import { fakeFirmwareConfig } from "../../__test_support__/fake_state/resources";

describe("<PlainDesignerSettings />", () => {
  let resetVirtualTrailSpy: jest.SpyInstance;

  beforeEach(() => {
    resetVirtualTrailSpy = jest.spyOn(botTrail, "resetVirtualTrail")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    resetVirtualTrailSpy.mockRestore();
  });

  const fakeProps = (): DesignerSettingsPropsBase => ({
    dispatch: jest.fn(),
    getConfigValue: () => 0,
  });

  it("renders", () => {
    const firmwareConfig = fakeFirmwareConfig().body;
    const { container } = render(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    expect(container.textContent?.toLowerCase()).toContain("plant animations");
  });

  it("doesn't call callback", () => {
    const firmwareConfig = fakeFirmwareConfig().body;
    const { container } = render(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(labels[0]?.textContent).toContain("animations");
    fireEvent.click(buttons[0]);
    expect(resetVirtualTrailSpy).not.toHaveBeenCalled();
  });

  it("calls callback", () => {
    const firmwareConfig = fakeFirmwareConfig().body;
    const { container } = render(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(labels[1]?.textContent).toContain("Trail");
    fireEvent.click(buttons[1]);
    expect(resetVirtualTrailSpy).toHaveBeenCalled();
  });
});

describe("<Setting />", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    setWebAppConfigValueSpy.mockRestore();
  });

  const fakeProps = (): SettingProps => ({
    dispatch: jest.fn(),
    getConfigValue: () => 0,
    setting: BooleanSetting.show_farmbot,
    title: DeviceSetting.showFarmbot,
    description: "description",
    confirm: "confirmation message",
  });

  it("toggles upon confirmation", () => {
    window.confirm = jest.fn(() => true);
    const { container } = render(<Setting {...fakeProps()} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.show_farmbot, true);
  });

  it("doesn't toggle upon cancel", () => {
    window.confirm = jest.fn(() => false);
    const { container } = render(<Setting {...fakeProps()} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValueSpy).not.toHaveBeenCalled();
  });
});
