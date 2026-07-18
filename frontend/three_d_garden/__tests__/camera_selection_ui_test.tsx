import React from "react";
import { clone } from "lodash";
import * as lodash from "lodash";
import * as configStorageActions from "../../config_storage/actions";
import {
  CameraSelectionUI, cameraSelectionUIPropsEqual, CameraSelectionUIProps,
} from "../camera_selection_ui";
import { INITIAL } from "../config";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { Actions } from "../../constants";

describe("<CameraSelectionUI />", () => {
  let debounceSpy: jest.SpyInstance;
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    debounceSpy = jest.spyOn(lodash, "debounce")
      .mockImplementation((fn => fn) as typeof lodash.debounce);
    setWebAppConfigValueSpy = jest.spyOn(
      configStorageActions,
      "setWebAppConfigValue",
    ).mockImplementation(jest.fn());
  });

  afterEach(() => {
    debounceSpy.mockRestore();
    setWebAppConfigValueSpy.mockRestore();
  });

  const fakeProps = (): CameraSelectionUIProps => ({
    config: clone(INITIAL),
    dispatch: jest.fn(),
    topDownAtStart: false,
    onSelect: jest.fn(),
  });
  const cameraMarkers = (
    wrapper: ReturnType<typeof createRenderer>,
  ) => wrapper.root.findAll(node =>
    `${node.type}` == "group" &&
    `${node.props.name}`.startsWith("camera-location-") &&
    typeof node.props.onPointerOver == "function" &&
    !!node.props.userData?.hovered);

  it("renders four top-down and eight angled camera markers", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    const heads = cameraMarkers(wrapper);
    const topDownAngles = heads
      .filter(head => head.props.userData.hovered.topDown)
      .map(head => head.props.userData.hovered.angle);
    const angledAngles = heads
      .filter(head => !head.props.userData.hovered.topDown)
      .map(head => head.props.userData.hovered.angle);
    expect([...new Set(topDownAngles)]).toEqual([0, 90, 180, 270]);
    expect([...new Set(angledAngles)])
      .toEqual([0, 90, 180, 270, 45, 135, 225, 315]);
    unmountRenderer(wrapper);
  });

  it("updates marker hover state and handles selection", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    const head = cameraMarkers(wrapper).find(node =>
      node.props.userData.hovered.angle == 45
      && node.props.userData?.hovered?.topDown === false)!;
    expect(head).toBeTruthy();
    const markerColor = () => cameraMarkers(wrapper).find(node =>
      node.props.userData.hovered.angle == 45
      && node.props.userData?.hovered?.topDown === false)!
      .findAll(node =>
        node.props.color !== undefined &&
        node.props.hoverColor === undefined)[0].props.color;
    expect(markerColor()).toEqual("blue");
    const stopPropagation = jest.fn();
    const pointerEvent = {
      delta: 0,
      stopPropagation,
      nativeEvent: { stopImmediatePropagation: jest.fn() },
    };
    actRenderer(() => head.props.onPointerOver(pointerEvent));
    expect(markerColor()).toEqual("cyan");
    actRenderer(() => head.props.onPointerOver(pointerEvent));
    expect(markerColor()).toEqual("cyan");
    actRenderer(() => head.props.onPointerMove());
    expect(markerColor()).toEqual("cyan");
    actRenderer(() => head.props.onPointerOut(pointerEvent));
    expect(markerColor()).toEqual("blue");
    actRenderer(() => head.props.onClick(pointerEvent));
    expect(stopPropagation).toHaveBeenCalled();
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.viewpoint_heading,
      45,
    );
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.top_down_view,
      false,
    );
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: true,
    });
    expect(p.onSelect).toHaveBeenCalledWith(45, false);
    unmountRenderer(wrapper);

    p.dispatch = undefined;
    p.onSelect = jest.fn();
    const noDispatchWrapper = createRenderer(<CameraSelectionUI {...p} />);
    const clickable = noDispatchWrapper.root.findAll(node =>
      node.props.onClick)[0];
    actRenderer(() => clickable.props.onClick(pointerEvent));
    expect(p.onSelect).not.toHaveBeenCalled();
    unmountRenderer(noDispatchWrapper);
  });

  it("maps a legacy angled heading to its nearest prism marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 30;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    const selected = cameraMarkers(wrapper).filter(node =>
      node.props.userData.hovered.topDown === false
      && node.findAll(item => item.props.color == "blue").length > 0);
    expect(selected.length).toBeGreaterThan(0);
    expect([...new Set(selected.map(node =>
      node.props.userData.hovered.angle))]).toEqual([45]);
    unmountRenderer(wrapper);
  });

  it("maps a saved top-down heading to its nearest cardinal marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 30;
    p.topDownAtStart = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    const selected = cameraMarkers(wrapper).filter(node =>
      node.props.userData.hovered.topDown === true
      && node.findAll(item => item.props.color == "blue").length > 0);
    expect([...new Set(selected.map(node =>
      node.props.userData.hovered.angle))]).toEqual([0]);
    unmountRenderer(wrapper);
  });

  it("selects a top-down camera with perspective on", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    const head = cameraMarkers(wrapper).find(node =>
      node.props.userData.hovered.angle == 90
      && node.props.userData?.hovered?.topDown === true)!;
    actRenderer(() =>
      head.props.onClick({
        delta: 0,
        stopPropagation: jest.fn(),
        nativeEvent: { stopImmediatePropagation: jest.fn() },
      }));
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.viewpoint_heading,
      90,
    );
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.top_down_view,
      true,
    );
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: true,
    });
    expect(p.onSelect).toHaveBeenCalledWith(90, true);
    unmountRenderer(wrapper);
  });

  it("renders debug markers", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.lightsDebug = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    expect(wrapper.root.findAll(node => node.props.name == "body").length)
      .toEqual(32);
    expect(wrapper.root.findAll(node => node.props.className == "line"))
      .toHaveLength(8);
    unmountRenderer(wrapper);
  });

  it("compares only relevant props", () => {
    const first = fakeProps();
    expect(cameraSelectionUIPropsEqual(first, first)).toEqual(true);
    expect(cameraSelectionUIPropsEqual(first, {
      ...first,
      config: { ...first.config, viewpointHeading: 90 },
    })).toEqual(false);
    expect(cameraSelectionUIPropsEqual(first, {
      ...first,
      topDownAtStart: true,
    })).toEqual(false);
    expect(cameraSelectionUIPropsEqual(first, {
      ...first,
      onSelect: jest.fn(),
    })).toEqual(false);
  });
});
