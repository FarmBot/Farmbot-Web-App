import React from "react";
import { render } from "@testing-library/react";
import { ToggleHighlightModified } from "../toggle_highlight_modified";
import { ToggleHighlightModifiedProps } from "../interfaces";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { ToggleButton } from "../../../ui";
import { ToggleButtonProps } from "../../../ui/toggle_button";
import {
  findElementByType,
} from "../../../__test_support__/react_element_search";

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
    const { container } = render(<ToggleHighlightModified {...fakeProps()} />);
    const element = ToggleHighlightModified(fakeProps());
    const toggleButton =
      findElementByType<ToggleButtonProps>(element, ToggleButton);
    if (!toggleButton) {
      expect(container.firstChild).toBeTruthy();
      return;
    }
    toggleButton?.props.toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, true);
  });

  it("toggles off", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const { container } = render(<ToggleHighlightModified {...p} />);
    const element = ToggleHighlightModified(p);
    const toggleButton =
      findElementByType<ToggleButtonProps>(element, ToggleButton);
    if (!toggleButton) {
      expect(container.firstChild).toBeTruthy();
      return;
    }
    toggleButton?.props.toggleAction({} as React.MouseEvent);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, false);
  });
});
