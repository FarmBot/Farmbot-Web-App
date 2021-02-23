jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
  getWebAppConfigValue: jest.fn(() => jest.fn()),
}));

import React from "react";
import { mount } from "enzyme";
import { ToggleHighlightModified } from "../toggle_highlight_modified";
import { ToggleHighlightModifiedProps } from "../interfaces";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";

describe("<ToggleHighlightModified />", () => {
  const fakeProps = (): ToggleHighlightModifiedProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("toggles on", () => {
    const wrapper = mount(<ToggleHighlightModified {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, true);
  });

  it("toggles off", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = mount(<ToggleHighlightModified {...p} />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, false);
  });
});
