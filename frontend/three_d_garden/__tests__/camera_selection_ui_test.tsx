import React from "react";
import { render } from "@testing-library/react";
import { CameraSelectionUI, CameraSelectionUIProps } from "../camera_selection_ui";
import { clone } from "lodash";
import * as lodash from "lodash";
import { INITIAL } from "../config";
import * as configStorageActions from "../../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";
import * as threeFiber from "@react-three/fiber";
import { PerspectiveCamera } from "three";

describe("<CameraSelectionUI />", () => {
  let setWebAppConfigValueSpy: jest.SpyInstance;
  let debounceSpy: jest.SpyInstance;
  let useFrameSpy: jest.SpyInstance;
  let useThreeSpy: jest.SpyInstance;
  let useStateSpy: jest.SpyInstance;
  let frameHandler: threeFiber.RenderCallback | undefined;
  let intersectObjects: jest.Mock;
  let setFromCamera: jest.Mock;
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
    debounceSpy = jest.spyOn(lodash, "debounce")
      .mockImplementation((fn => fn) as typeof lodash.debounce);
    frameHandler = undefined;
    intersectObjects = jest.fn(() => []);
    setFromCamera = jest.fn();
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation((callback: threeFiber.RenderCallback) => {
        frameHandler = callback;
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    useThreeSpy = jest.spyOn(threeFiber, "useThree")
      .mockReturnValue({
        camera: new PerspectiveCamera(),
        gl: {
          info: {
            render: { calls: 0, triangles: 0, points: 0, lines: 0 },
            memory: { geometries: 0, textures: 0 },
          },
        },
        pointer: { x: 0, y: 0 },
        raycaster: {
          setFromCamera,
          intersectObjects,
        },
        scene: { traverse: jest.fn() },
        size: { width: 800, height: 600 },
      });
    useStateSpy = jest.spyOn(React, "useState");
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    setWebAppConfigValueSpy.mockRestore();
    debounceSpy.mockRestore();
    useFrameSpy.mockRestore();
    useThreeSpy.mockRestore();
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

  const attachMeshRefs = (wrapper: ReturnType<typeof createRenderer>) => {
    wrapper.root.findAll(node => node.props.ref)
      .forEach((node, index) => {
        node.props.ref({
          userData: node.props.userData,
          uuid: `mesh-${index}`,
        });
      });
  };

  it("renders hidden by default", () => {
    const wrapper = createRenderer(<CameraSelectionUI {...fakeProps()} />);
    mountedWrappers.push(wrapper);
    const group = wrapper.root.findAll(node =>
      node.props.name == "camera-selection")[0];
    expect(group?.props.visible).toEqual(false);
  });

  it("doesn't raycast when camera selection is hidden", () => {
    const wrapper = createRenderer(<CameraSelectionUI {...fakeProps()} />);
    mountedWrappers.push(wrapper);
    actRenderer(() => {
      frameHandler?.({} as never, 0);
    });
    expect(setFromCamera).not.toHaveBeenCalled();
    expect(intersectObjects).not.toHaveBeenCalled();
  });

  it("renders unique heading marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 30;
    const { container } = render(<CameraSelectionUI {...p} />);
    expect(container.querySelectorAll(".spherehead").length).toEqual(12);
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

  it("updates marker color from raycast hover state", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    attachMeshRefs(wrapper);
    intersectObjects.mockReturnValue([{
      object: { userData: { hovered: { angle: 30, topDown: false } } },
    }]);

    actRenderer(() => {
      frameHandler?.({} as never, 0);
    });

    const hoveredSphere = wrapper.root.findAll(node =>
      node.props.name == "head"
      && node.props.userData?.hovered?.angle == 30
      && node.props.userData?.hovered?.topDown === false)[0];
    expect(hoveredSphere).toBeTruthy();
    const material = hoveredSphere?.findAll(node =>
      node.props.color !== undefined)[0];
    expect(material?.props.color).toEqual("cyan");
  });

  it("keeps default color when raycast finds no hovered marker", () => {
    const p = fakeProps();
    p.config.cameraSelectionView = true;
    p.config.viewpointHeading = 0;
    const wrapper = createRenderer(<CameraSelectionUI {...p} />);
    mountedWrappers.push(wrapper);
    attachMeshRefs(wrapper);
    intersectObjects.mockReturnValue([]);

    actRenderer(() => {
      frameHandler?.({} as never, 0);
    });

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
    attachMeshRefs(wrapper);
    intersectObjects.mockReturnValue([{
      object: { userData: { hovered: { angle: 45, topDown: false } } },
    }]);

    actRenderer(() => {
      frameHandler?.({} as never, 0);
      frameHandler?.({} as never, 0);
    });

    expect(setHovered).toHaveBeenCalledTimes(1);
    expect(setHovered).toHaveBeenCalledWith({ angle: 45, topDown: false });
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
});
