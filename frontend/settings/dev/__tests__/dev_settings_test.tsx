const mockDevSettings: { [key: string]: string } = {};
jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(() => () => { }),
  getWebAppConfigValue: jest.fn(() => () => JSON.stringify(mockDevSettings)),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  DevWidgetFERow, DevWidgetFBOSRow, DevWidgetDelModeRow,
  DevWidgetShowInternalEnvsRow,
} from "../dev_settings";
import { DevSettings } from "../dev_support";
import { setWebAppConfigValue } from "../../../config_storage/actions";

describe("<DevWidgetFBOSRow />", () => {
  it("changes override value", () => {
    const wrapper = shallow(<DevWidgetFBOSRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1.2.3" } });
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1.2.3" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("increases override value", () => {
    const wrapper = mount(<DevWidgetFBOSRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1000.0.0" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });
});

describe("<DevWidgetFERow />", () => {
  it("enables unstable FE features", () => {
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FUTURE_FE_FEATURES]: "true" }));
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });

  it("disables unstable FE features", () => {
    mockDevSettings[DevSettings.FUTURE_FE_FEATURES] = "true";
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });
});

describe("<DevWidgetDelModeRow />", () => {
  it("enables delete mode", () => {
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.QUICK_DELETE_MODE]: "true" }));
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });

  it("disables delete mode", () => {
    mockDevSettings[DevSettings.QUICK_DELETE_MODE] = "true";
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });
});

describe("<DevWidgetShowInternalEnvsRow />", () => {
  it("enables show internal envs", () => {
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.SHOW_INTERNAL_ENVS]: "true" }));
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });

  it("disables show internal envs", () => {
    mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS] = "true";
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });
});
