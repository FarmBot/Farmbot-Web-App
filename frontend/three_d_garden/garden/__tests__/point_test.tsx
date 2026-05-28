import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  DrawnPoint, drawnPointPropsEqual, DrawnPointProps, Point,
  PointInstances, PointInstancesProps, PointProps,
} from "../point";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  fakeDesignerState, fakeDrawnPoint,
} from "../../../__test_support__/fake_designer_state";
import { SpecialStatus } from "farmbot";
import { Mode } from "../../../farm_designer/map/interfaces";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<Point />", () => {
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    location.pathname = Path.mock(Path.points());
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
  });

  const fakeProps = (): PointProps => ({
    config: clone(INITIAL),
    point: fakePoint(),
    visible: true,
    getZ: () => 0,
  });

  it("renders", () => {
    const { container } = render(<Point {...fakeProps()} />);
    expect(container).toContainHTML("cylinder");
    expect(container).toContainHTML("opacity=\"1\"");
  });

  it("renders mirrored position", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 500;
    p.point.body.x = 100;
    p.point.body.y = 200;
    const { container } = render(<Point {...p} />);
    expect(container).toContainHTML("position=\"1260,460,400\"");
  });

  it("renders: unsaved", () => {
    const p = fakeProps();
    p.point.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Point {...p} />);
    expect(container).toContainHTML("cylinder");
    expect(container).not.toContainHTML("opacity=\"1\"");
  });

  it("navigates to point info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.point.body.id = 1;
    const { container } = render(<Point {...p} />);
    const point = container.querySelector("[name='marker']");
    point && fireEvent.click(point);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("1"));
  });

  it("doesn't navigate after orbiting over a point", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.point.body.id = 1;
    const wrapper = createRenderer(<Point {...p} />);
    mountedWrappers.push(wrapper);
    const point = wrapper.root
      .findAll(node => node.props.name == "marker")[0];
    point.props.onClick({ delta: 3 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate to point info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.point.body.id = 1;
    const { container } = render(<Point {...p} />);
    const point = container.querySelector("[name='marker']");
    point && fireEvent.click(point);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  const fakeInstanceProps = (): PointInstancesProps => ({
    config: clone(INITIAL),
    points: [fakePoint(), fakePoint()],
    visible: true,
    getZ: () => 0,
  });

  it("renders instanced point markers", () => {
    const wrapper = createRenderer(<PointInstances {...fakeInstanceProps()} />);
    mountedWrappers.push(wrapper);
    const meshes = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(meshes.length).toEqual(2);
    expect(meshes[0].props.args[2]).toEqual(2);
  });

  it("uses point marker instance colors", () => {
    const p = fakeInstanceProps();
    p.points[1].body.meta.color = "blue";
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    const markers = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh" &&
      node.props.name == "marker");
    expect(markers.length).toEqual(1);
    expect(markers[0].findAll(node =>
      node.props.vertexColors).length).toBeGreaterThan(0);
  });

  it("renders mirrored point instance positions", () => {
    const markerRef = {
      current: {
        setMatrixAt: jest.fn(),
        setColorAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      },
    };
    const ringRef = {
      current: {
        setMatrixAt: jest.fn(),
        setColorAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      },
    };
    const useRefSpy = jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => markerRef)
      .mockImplementationOnce(() => ringRef);
    const p = fakeInstanceProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 500;
    p.points = [p.points[0]];
    p.points[0].body.x = 100;
    p.points[0].body.y = 200;
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    const matrix = markerRef.current.setMatrixAt.mock.calls[0][1];
    expect(matrix.elements[12]).toBeCloseTo(1260);
    expect(matrix.elements[13]).toBeCloseTo(460);
    expect(matrix.elements[14]).toBeCloseTo(400);
    useRefSpy.mockRestore();
  });

  it("uses point radius instance colors", () => {
    const p = fakeInstanceProps();
    p.points[1].body.meta.color = "blue";
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    const rings = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh" &&
      node.props.name == "marker-radius");
    expect(rings.length).toEqual(1);
    expect(rings[0].findAll(node =>
      node.props.vertexColors).length).toBeGreaterThan(0);
  });

  it("skips hidden point markers", () => {
    const p = fakeInstanceProps();
    p.visible = false;
    p.getZ = jest.fn();
    const { container } = render(<PointInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(0);
    expect(p.getZ).not.toHaveBeenCalled();
  });

  it("skips rebuilds for unrelated config churn", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.getZ = jest.fn(() => 0);
    p.points[0].body.id = 1;
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    expect(p.getZ).toHaveBeenCalledTimes(2);
    const nextConfig = clone(p.config);
    nextConfig.sun = p.config.sun + 1;
    nextConfig.ambient = p.config.ambient + 1;
    nextConfig.zoomBeaconDebug = !p.config.zoomBeaconDebug;
    nextConfig.label = "unrelated config churn";
    (p.getZ as jest.Mock).mockClear();
    actRenderer(() => wrapper.update(<PointInstances
      {...p}
      config={nextConfig} />));
    expect(p.getZ).not.toHaveBeenCalled();
    const meshes = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(meshes.length).toEqual(2);
    meshes[0].props.onClick({ instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("1"));
  });

  it("updates point instances when position config changes", () => {
    const p = fakeInstanceProps();
    p.getZ = jest.fn(() => 0);
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    expect(p.getZ).toHaveBeenCalledTimes(2);
    const nextConfig = clone(p.config);
    nextConfig.mirrorX = !p.config.mirrorX;
    (p.getZ as jest.Mock).mockClear();
    actRenderer(() => wrapper.update(<PointInstances
      {...p}
      config={nextConfig} />));
    expect(p.getZ).toHaveBeenCalledTimes(2);
  });

  it("navigates from a point instance", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.points[0].body.id = 1;
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    const marker = wrapper.root
      .findAll(node => node.props.name == "marker")[0];
    marker.props.onClick({ instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("1"));
  });

  it("doesn't navigate after orbiting over a point instance", () => {
    const p = fakeInstanceProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.points[0].body.id = 1;
    const wrapper = createRenderer(<PointInstances {...p} />);
    mountedWrappers.push(wrapper);
    const marker = wrapper.root
      .findAll(node => node.props.name == "marker")[0];
    marker.props.onClick({ instanceId: 0, delta: 3 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("<DrawnPoint />", () => {
  const fakeProps = (): DrawnPointProps => {
    const designer = fakeDesignerState();
    designer.drawnPoint = fakeDrawnPoint();
    const config = clone(INITIAL);
    return {
      designer,
      usePosition: false,
      config,
    };
  };

  it("draws point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.designer.drawnPoint = undefined;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("position=\"0,0,0\"");
  });

  it("draws point radius preview", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.r = 0;
    p.designer.drawnPoint = point;
    p.torusRef = { current: undefined as never };
    const { container } = render(<DrawnPoint {...p} />);
    expect(container.querySelector(".torus")).not.toBeNull();
  });

  it("doesn't draw point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.usePosition = true;
    p.designer.drawnPoint = undefined;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).not.toContainHTML("position=\"0,0,0\"");
  });

  it("draws weed", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("generic-weed");
    expect(container).toContainHTML("position=\"0,0,0\"");
    expect(container).toContainHTML("scale=\"30\"");
    expect(container).toContainHTML("color=\"green\"");
    expect(container).toContainHTML("opacity=\"0.25\"");
  });

  it("draws weed: no radius", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.r = 0;
    p.designer.drawnPoint = point;
    const { container } = render(<DrawnPoint {...p} />);
    expect(container).toContainHTML("generic-weed");
    expect(container).toContainHTML("position=\"0,0,0\"");
    expect(container).toContainHTML("scale=\"50\"");
    expect(container).toContainHTML("color=\"green\"");
    expect(container).toContainHTML("opacity=\"0.25\"");
  });

  it("compares drawn-point-relevant fields", () => {
    const p = fakeProps();
    const props = { ...p, mode: Mode.createPoint };
    expect(drawnPointPropsEqual(props, {
      ...props,
      config: { ...props.config, sun: props.config.sun + 1 },
    })).toBeTruthy();
    expect(drawnPointPropsEqual(props, {
      ...props,
      mode: Mode.createWeed,
    })).toBeFalsy();
    expect(drawnPointPropsEqual(props, {
      ...props,
      config: { ...props.config, bedXOffset: props.config.bedXOffset + 1 },
    })).toBeFalsy();
    const changedDrawnPoint = {
      ...props.designer.drawnPoint!,
      r: (props.designer.drawnPoint?.r || 0) + 1,
    };
    expect(drawnPointPropsEqual(props, {
      ...props,
      designer: {
        ...props.designer,
        drawnPoint: changedDrawnPoint,
      },
    })).toBeFalsy();
  });
});
