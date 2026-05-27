import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Weed, WeedInstances, WeedInstancesProps, WeedProps } from "../weed";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import * as mapUtil from "../../../farm_designer/map/util";
import { Mode } from "../../../farm_designer/map/interfaces";
import { useFrame } from "@react-three/fiber";
import { Quaternion } from "three";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<Weed />", () => {
  let getModeSpy: jest.SpyInstance;
  let reactUseRefSpy: jest.SpyInstance | undefined;
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
    (useFrame as jest.Mock).mockClear();
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    getModeSpy.mockRestore();
    reactUseRefSpy?.mockRestore();
    reactUseRefSpy = undefined;
  });

  const fakeProps = (): WeedProps => ({
    config: clone(INITIAL),
    weed: fakeWeed(),
    visible: true,
    getZ: () => 0,
  });

  it("renders", () => {
    const { container } = render(<Weed {...fakeProps()} />);
    expect(container).toContainHTML("weed");
  });

  it("renders mirrored position", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 500;
    p.weed.body.x = 100;
    p.weed.body.y = 200;
    const { container } = render(<Weed {...p} />);
    expect(container).toContainHTML("position=\"1260,460,400\"");
  });

  it("navigates to weed info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed-1']");
    weed && fireEvent.click(weed);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });

  it("doesn't navigate after orbiting over a weed", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weed.body.id = 1;
    const wrapper = createRenderer(<Weed {...p} />);
    mountedWrappers.push(wrapper);
    const weed = wrapper.root
      .findAll(node => node.props.name == "weed-1")[0];
    weed.props.onClick({ delta: 3 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate to weed info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed']");
    weed && fireEvent.click(weed);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  const fakeInstanceProps = (): WeedInstancesProps => ({
    config: clone(INITIAL),
    weeds: [fakeWeed(), fakeWeed()],
    visible: true,
    getZ: () => 0,
  });

  it("renders instanced weeds", () => {
    const p = fakeInstanceProps();
    p.weeds[0].body.meta.color = "red";
    p.weeds[1].body.meta.color = "blue";
    const wrapper = createRenderer(<WeedInstances {...p} />);
    mountedWrappers.push(wrapper);
    const meshes = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(meshes.length).toEqual(3);
    expect(meshes[0].props.name).toEqual("weed-icons");
    expect(meshes[1].props.name).toEqual("weed-radius");
    expect(meshes[2].props.name).toEqual("weed-radius");
  });

  it("skips hidden weed instances", () => {
    const p = fakeInstanceProps();
    p.visible = false;
    p.getZ = jest.fn();
    const { container } = render(<WeedInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(0);
    expect(p.getZ).not.toHaveBeenCalled();
  });

  it("navigates from a weed instance", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weeds[0].body.id = 1;
    const wrapper = createRenderer(<WeedInstances {...p} />);
    mountedWrappers.push(wrapper);
    const weedIcons = wrapper.root
      .findAll(node => node.props.name == "weed-icons")[0];
    weedIcons.props.onClick({ instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });

  it("navigates from a weed radius instance", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weeds[0].body.id = 1;
    const wrapper = createRenderer(<WeedInstances {...p} />);
    mountedWrappers.push(wrapper);
    const weedRadius = wrapper.root
      .findAll(node => node.props.name == "weed-radius")[0];
    weedRadius.props.onClick({ instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });

  it("doesn't navigate after orbiting over weed instances", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weeds[0].body.id = 1;
    const wrapper = createRenderer(<WeedInstances {...p} />);
    mountedWrappers.push(wrapper);
    const weedIcons = wrapper.root
      .findAll(node => node.props.name == "weed-icons")[0];
    const weedRadius = wrapper.root
      .findAll(node => node.props.name == "weed-radius")[0];
    weedIcons.props.onClick({ instanceId: 0, delta: 3 });
    weedRadius.props.onClick({ instanceId: 0, delta: 3 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("updates weed icon matrices on frame", () => {
    const iconRef = {
      current: {
        setMatrixAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      },
    };
    const radiusRef = {
      current: {
        setMatrixAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      },
    };
    const updateStateRef = { current: {} };
    reactUseRefSpy = jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => iconRef)
      .mockImplementationOnce(() => updateStateRef)
      .mockImplementationOnce(() => radiusRef)
      .mockImplementation(value => ({ current: value }));
    const wrapper = createRenderer(<WeedInstances {...fakeInstanceProps()} />);
    mountedWrappers.push(wrapper);
    const frameFn = (useFrame as jest.Mock).mock.calls[0][0];
    frameFn({ camera: { quaternion: new Quaternion() } });
    expect(iconRef.current.setMatrixAt).toHaveBeenCalled();
    expect(iconRef.current.instanceMatrix.needsUpdate).toEqual(true);
  });
});
