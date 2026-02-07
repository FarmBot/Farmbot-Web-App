import React from "react";
import { mount } from "enzyme";
import { ToggleHighlightModified } from "../toggle_highlight_modified";
import { ToggleHighlightModifiedProps } from "../interfaces";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";

let setWebAppConfigValueSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;

beforeEach(() => {
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => false);
});

afterEach(() => {
  setWebAppConfigValueSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
});
describe("<ToggleHighlightModified />", () => {
  const fakeProps = (): ToggleHighlightModifiedProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("toggles on", () => {
    const wrapper = mount(<ToggleHighlightModified {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, true);
  });

  it("toggles off", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = mount(<ToggleHighlightModified {...p} />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, false);
  });
});
