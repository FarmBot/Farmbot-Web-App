import React from "react";
import { render } from "@testing-library/react";
import {
  CameraSelectionUI, cameraSelectionUIPropsEqual, CameraSelectionUIProps,
} from "../camera_selection_ui";
import { clone } from "lodash";
import * as lodash from "lodash";
import { INITIAL } from "../config";
import * as configStorageActions from "../../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { getDefaultCameraPosition } from "../camera";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";
import * as threeFiber from "@react-three/fiber";

describe("<CameraSelectionUI />", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;
  let debounceSpy: jest.SpyInstance;
  let useFrameSpy: jest.SpyInstance;
  let useStateSpy: jest.SpyInstance;
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions,
      "setWebAppConfigValue")
      .mockImplementation(jest.fn());
    debounceSpy = jest.spyOn(lodash, "debounce")
      .mockImplementation((fn => fn) as typeof lodash.debounce);
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => undefined as never);
    useStateSpy = jest.spyOn(React, "useState");
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    setWebAppConfigValueSpy.mockRestore();
    debounceSpy.mockRestore();
    useFrameSpy.mockRestore();
    useStateSpy.mockRestore();
  });

  const fakeConfig = () => {
    const config = clone(INITIAL);
    config.bedHeight = 100;
    return config;
  };

  const fakeProps = (): CameraSelectionUIProps => ({
    config: fakeConfig(),
    dispatch: jest.fn(),
    topDownAtStart: false,
  });

  const findHead = (
    wrapper: ReturnType<typeof createRenderer>,
    angle: number,
    topDown: boolean,
  ) => wrapper.root.findAll(node =>
    node.props.name == "head"
    && node.props.userData?.hovered?.angle == angle
    && node.props.userData?.hovered?.topDown === topDown)[0];

  const markerPosition = (
    head: ReturnType<typeof findHead>,
  ): [number, number, number] | undefined => {
    let parent = head?.parent;
    while (parent && parent.props.position === undefined) {
      parent = parent.parent;
    }
    return parent?.props.position;
  };

  const expectedMarkerPosition = (
    config: CameraSelectionUIProps["config"],
    angle: number,
    topDown: boolean,
    debug = false,
  ): [number, number, number] => {
    const position = getDefaultCameraPosition({
      heading: angle,
      bedSize: {
        x: config.bedLengthOuter,
        y: config.bedWidthOuter,
      },
      topDown,
      visual: !debug,
      zoomFactor: config.zoomFactor,
    });
    const baseScaleXY = debug ? 1 : 0.5;
    const scale = topDown ? 0.1 : baseScaleXY;
    const baseScaleZ = debug ? 1 : 0.5 * 0.25;
    const zScale = topDown ? 0 : baseScaleZ;
    return [
      position[0] * scale,
      position[1] * scale,
      position[2] * zScale,
    ];
  };

  it("renders hidden by default", () => {
    const wrapper = createRenderer(<CameraSelectionUI {...fakeProps()} />);
    mountedWrappers.push(wrapper);
    const group = wrapper.root.findAll(node =>
      node.props.name == "camera-selection")[0];
    expect(group?.props.visible).toEqual(false);
  });

  it("doesn't register a frame loop", () => {
    const wrapper = createRenderer(<CameraSelectionUI {...fakeProps()} />);
    mountedWrappers.push(wrapper);
    expect(useFrameSpy).not.toHaveBeenCalled();
  });

  it("renders unique heading marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 30;
    const { container } = render(<CameraSelectionUI {...p} />);
    expect(container.querySelectorAll(".spherehead").length).toEqual(12);
  });

  it("keeps top-down heading marker choices and selection", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 45;
    p.topDownAtStart = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);

    expect(findHead(wrapper, 45, true)).toBeTruthy();
    expect(findHead(wrapper, 45, false)).toBeFalsy();
    const material = findHead(wrapper, 45, true)?.findAll(node =>
      node.props.color !== undefined)[0];
    expect(material?.props.color).toEqual("blue");
  });

  it("keeps marker positions stable across unchanged config churn", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);

    expect(markerPosition(findHead(wrapper, 30, false))).toEqual(
      expectedMarkerPosition(p.config, 30, false));

    actRenderer(() => {
      wrapper.update(<CameraSelectionUI {...p} config={clone(p.config)} />);
    });

    expect(markerPosition(findHead(wrapper, 30, false))).toEqual(
      expectedMarkerPosition(p.config, 30, false));
  });

  it("reuses marker setup across unchanged config churn", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    debounceSpy.mockClear();

    actRenderer(() => {
      wrapper.update(<CameraSelectionUI {...p} config={clone(p.config)} />);
    });

    expect(debounceSpy).not.toHaveBeenCalled();
  });

  it("dispatches heading update", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const groups = wrapper.root.findAll(node => node.props.onClick);
    actRenderer(() => {
      groups[0]?.props.onClick({ stopPropagation: jest.fn() });
    });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.viewpoint_heading, 0);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.top_down_view, true);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("handles missing dispatch", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.dispatch = undefined;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const groups = wrapper.root.findAll(node => node.props.onClick);
    actRenderer(() => {
      groups[0]?.props.onClick({ stopPropagation: jest.fn() });
    });
    expect(setWebAppConfigValueSpy).not.toHaveBeenCalled();
  });

  it("updates marker color from pointer hover state", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const hoveredSphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    actRenderer(() => {
      hoveredSphere?.props.onPointerOver();
    });
    expect(hoveredSphere).toBeTruthy();
    const updatedSphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    const material = updatedSphere?.findAll(node =>
      node.props.color !== undefined)[0];
    expect(material?.props.color).toEqual("cyan");
  });

  it("clears marker color on pointer out", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const hoveredSphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];

    actRenderer(() => {
      hoveredSphere?.props.onPointerOver();
      hoveredSphere?.props.onPointerOut();
    });

    const updatedSphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    const material = updatedSphere?.findAll(node =>
      node.props.color !== undefined)[0];
    expect(material?.props.color).toEqual("blue");
  });

  it("keeps default color when raycast finds no hovered marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 0;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);

    const sphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    const material = sphere?.findAll(node =>
      node.props.color !== undefined)[0];
    expect(material?.props.color).toEqual("orange");
  });

  it("avoids repeated hover state updates for the same marker", () => {
    const setHovered = jest.fn();
    useStateSpy.mockImplementationOnce(initial =>
      [initial as unknown, setHovered]);
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const head = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];

    actRenderer(() => {
      head?.props.onPointerMove();
      head?.props.onPointerMove();
    });

    expect(setHovered).toHaveBeenCalledTimes(1);
    expect(setHovered).toHaveBeenCalledWith({ angle: 30, topDown: false });
  });

  it("renders debug camera markers", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.lightsDebug = true;
    const { container } = render(<CameraSelectionUI {...p} />);
    expect(container.querySelectorAll(".line").length).toEqual(8);
  });

  it("dispatches non-top-down heading update", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    const head = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    actRenderer(() => {
      head?.props.onClick({ stopPropagation: jest.fn() });
    });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.viewpoint_heading, 30);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.top_down_view, false);
  });

  it("compares camera-selection-relevant inputs", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    expect(cameraSelectionUIPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(cameraSelectionUIPropsEqual(p, {
      ...p,
      topDownAtStart: !p.topDownAtStart,
    })).toBeFalsy();
    expect(cameraSelectionUIPropsEqual(p, {
      ...p,
      dispatch: jest.fn(),
    })).toBeFalsy();
    expect(cameraSelectionUIPropsEqual(p, {
      ...p,
      config: { ...p.config, viewpointHeading: p.config.viewpointHeading + 1 },
    })).toBeFalsy();
    expect(cameraSelectionUIPropsEqual(p, {
      ...p,
      config: { ...p.config, lightsDebug: !p.config.lightsDebug },
    })).toBeFalsy();
  });
});
