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
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<Weed />", () => {
  let getModeSpy: jest.SpyInstance;
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
    getModeSpy.mockRestore();
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
    const wrapper = createRenderer(<WeedInstances {...fakeInstanceProps()} />);
    mountedWrappers.push(wrapper);
    const meshes = wrapper.root.findAll(node => node.type == "instancedMesh");
    expect(meshes.length).toEqual(2);
    expect(meshes[0].props.name).toEqual("weed-icons");
    expect(meshes[1].props.name).toEqual("weed-radius");
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
});
