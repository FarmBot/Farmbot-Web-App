jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
}));

jest.mock("../../devices/actions", () => ({
  updateConfig: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import {
  LogLevelSetting, LogLevelSettingProps, LogEnableSettingProps,
  LogEnableSetting,
} from "../other_settings";
import { DeviceSetting } from "../../constants";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { updateConfig } from "../../devices/actions";

describe("<LogLevelSetting />", () => {
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
    expect(setWebAppConfigValue).toHaveBeenCalledWith("success_log", false);
  });
});

describe("<LogEnableSetting />", () => {
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
    expect(updateConfig).toHaveBeenCalledWith({ sequence_init_log: false });
  });
});
