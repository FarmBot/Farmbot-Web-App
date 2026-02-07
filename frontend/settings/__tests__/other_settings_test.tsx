import React from "react";
import { mount } from "enzyme";
import {
  LogLevelSetting, LogLevelSettingProps, LogEnableSettingProps,
  LogEnableSetting,
} from "../other_settings";
import { DeviceSetting } from "../../constants";
import * as configStorageActions from "../../config_storage/actions";
import * as deviceActions from "../../devices/actions";

describe("<LogLevelSetting />", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    setWebAppConfigValueSpy.mockRestore();
  });

  const fakeProps = (): LogLevelSettingProps => ({
    dispatch: jest.fn(),
    title: DeviceSetting.logFilterLevelSuccess,
    setting: "success_log",
    description: "description",
    getConfigValue: () => 1,
  });

  it("toggles setting", () => {
    const wrapper = mount(<LogLevelSetting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("success_log", false);
  });
});

describe("<LogEnableSetting />", () => {
  let updateConfigSpy: jest.SpyInstance;

  beforeEach(() => {
    updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    updateConfigSpy.mockRestore();
  });

  const fakeProps = (): LogEnableSettingProps => ({
    dispatch: jest.fn(),
    title: DeviceSetting.sequenceBeginLogs,
    setting: "sequence_init_log",
    description: "description",
    sourceFbosConfig: () => ({ value: true, consistent: true }),
  });

  it("toggles setting", () => {
    const wrapper = mount(<LogEnableSetting {...fakeProps()} />);
    wrapper.find("ToggleButton").simulate("click");
    expect(updateConfigSpy).toHaveBeenCalledWith({ sequence_init_log: false });
  });
});
