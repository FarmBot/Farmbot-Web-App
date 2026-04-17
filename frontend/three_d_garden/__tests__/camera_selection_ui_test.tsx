import React from "react";
import { render } from "@testing-library/react";
import { CameraSelectionUI } from "../camera_selection_ui";
import { clone } from "lodash";
import { INITIAL } from "../config";
import * as configStorageActions from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

describe("<CameraSelectionUI />", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    setWebAppConfigValueSpy.mockRestore();
  });

  const fakeConfig = () => {
    const config = clone(INITIAL);
    config.bedHeight = 100;
    return config;
  };

  it("renders hidden by default", () => {
    const wrapper = createRenderer(
      <CameraSelectionUI config={fakeConfig()} dispatch={jest.fn()} />);
    mountedWrappers.push(wrapper);
    const group = wrapper.root.findAll(node =>
      node.props.name == "camera-selection")[0];
    expect(group?.props.visible).toEqual(false);
  });

  it("renders unique heading marker", () => {
    const config = fakeConfig();
    config.cameraSelectionView = true;
    config.viewpointHeading = 45;
    const { container } = render(
      <CameraSelectionUI config={config} dispatch={jest.fn()} />);
    expect(container.querySelectorAll(".spherehead").length).toEqual(5);
  });

  it("dispatches heading update", () => {
    const config = fakeConfig();
    config.cameraSelectionView = true;
    const dispatch = jest.fn();
    const wrapper = createRenderer(
      <CameraSelectionUI config={config} dispatch={dispatch} />);
    mountedWrappers.push(wrapper);
    const groups = wrapper.root.findAll(node => node.props.onClick);
    actRenderer(() => {
      groups[0]?.props.onClick();
    });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.viewpoint_heading, 0);
    expect(dispatch).toHaveBeenCalled();
  });

  it("handles missing dispatch", () => {
    const config = fakeConfig();
    config.cameraSelectionView = true;
    const wrapper = createRenderer(
      <CameraSelectionUI config={config} dispatch={undefined} />);
    mountedWrappers.push(wrapper);
    const groups = wrapper.root.findAll(node => node.props.onClick);
    actRenderer(() => {
      groups[0]?.props.onClick();
    });
    expect(setWebAppConfigValueSpy).not.toHaveBeenCalled();
  });
});
