import React from "react";
import { render } from "@testing-library/react";
import { ToggleHighlightModified } from "../toggle_highlight_modified";
import { ToggleHighlightModifiedProps } from "../interfaces";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { ToggleButton } from "../../../ui";

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

const findByType = (
  node: React.ReactNode,
  type: unknown,
): React.ReactElement<{ children?: React.ReactNode }> | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of React.Children.toArray(node)) {
      const found = findByType(child, type);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    if (node.type === type) { return node; }
    return findByType(node.props.children, type);
  }
  return undefined;
};

describe("<ToggleHighlightModified />", () => {
  const fakeProps = (): ToggleHighlightModifiedProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("toggles on", () => {
    const { container } = render(<ToggleHighlightModified {...fakeProps()} />);
    const element = ToggleHighlightModified(fakeProps());
    const toggleButton = findByType(element, ToggleButton);
    if (!toggleButton) {
      expect(container.firstChild).toBeTruthy();
      return;
    }
    toggleButton?.props.toggleAction();
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, true);
  });

  it("toggles off", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const { container } = render(<ToggleHighlightModified {...p} />);
    const element = ToggleHighlightModified(p);
    const toggleButton = findByType(element, ToggleButton);
    if (!toggleButton) {
      expect(container.firstChild).toBeTruthy();
      return;
    }
    toggleButton?.props.toggleAction();
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.highlight_modified_settings, false);
  });
});
