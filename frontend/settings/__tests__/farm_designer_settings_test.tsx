import React from "react";
import { mount } from "enzyme";
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
    const wrapper = mount(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    expect(wrapper.text().toLowerCase()).toContain("plant animations");
  });

  it("doesn't call callback", () => {
    const firmwareConfig = fakeFirmwareConfig().body;
    const wrapper = mount(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    expect(wrapper.find("label").at(0).text()).toContain("animations");
    wrapper.find("button").at(0).simulate("click");
    expect(resetVirtualTrailSpy).not.toHaveBeenCalled();
  });

  it("calls callback", () => {
    const firmwareConfig = fakeFirmwareConfig().body;
    const wrapper = mount(<div>
      {PlainDesignerSettings(fakeProps(), firmwareConfig)}
    </div>);
    expect(wrapper.find("label").at(1).text()).toContain("Trail");
    wrapper.find("button").at(1).simulate("click");
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
    const wrapper = mount(<Setting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.show_farmbot, true);
  });

  it("doesn't toggle upon cancel", () => {
    window.confirm = jest.fn(() => false);
    const wrapper = mount(<Setting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("confirmation message");
    expect(setWebAppConfigValueSpy).not.toHaveBeenCalled();
  });
});
