import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import * as springCore from "@react-spring/core";
import { Mesh, Ray, Vector3 } from "three";
import {
  axisConstraint,
  ControlArrow,
  ControlCursorProvider,
  ControlHandle,
  ControlPillButton,
  ControlPulse,
  ControlSphere,
  noControlRaycast,
  planeConstraint,
  ThreeDPopup,
  useControlCursor,
} from "../";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { ControlPointerEvent } from "../types";
import { Cone, Cylinder } from "@react-three/drei";
import {
  MeshBasicMaterial, MeshPhongMaterial,
} from "../../components";

const pointerEvent = (
  point = new Vector3(),
  delta = 0,
) => ({
  point,
  delta,
  pointerId: 1,
  stopPropagation: jest.fn(),
  nativeEvent: { stopImmediatePropagation: jest.fn() },
  target: {
    setPointerCapture: jest.fn(),
    releasePointerCapture: jest.fn(),
  },
}) as unknown as ControlPointerEvent;

describe("<ControlHandle />", () => {
  beforeEach(() => {
    document.body.style.cursor = "default";
  });

  it("owns hover, activation, and drag interaction lifecycle", () => {
    const onHoverChange = jest.fn();
    const onActivate = jest.fn();
    const onDragStart = jest.fn();
    const onDrag = jest.fn();
    const onDragEnd = jest.fn();
    const onDragCancel = jest.fn();
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        onHoverChange={onHoverChange}
        onActivate={onActivate}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}>
        {state => <group name={"state"} userData={state} />}
      </ControlHandle>,
    );
    const handle = () => wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];

    actRenderer(() => handle().props.onPointerOver(pointerEvent()));
    expect(onHoverChange).toHaveBeenCalledWith(true);
    expect(document.body.style.cursor).toEqual("pointer");
    expect(wrapper.root.findByProps({ name: "state" }).props.userData.hovered)
      .toEqual(true);

    const down = pointerEvent(new Vector3(1, 2, 3));
    actRenderer(() => handle().props.onPointerDown(down));
    expect((down.target as HTMLElement).setPointerCapture)
      .toHaveBeenCalledWith(1);
    expect(onDragStart.mock.calls[0][0].point.toArray()).toEqual([1, 2, 3]);
    expect(document.body.style.cursor).toEqual("grabbing");

    actRenderer(() =>
      handle().props.onPointerMove(pointerEvent(new Vector3(4, 6, 8), 5)));
    expect(onDrag.mock.calls[0][0].delta.toArray()).toEqual([3, 4, 5]);
    expect(onDrag.mock.calls[0][0].dragged).toEqual(true);

    const up = pointerEvent(new Vector3(5, 7, 9), 5);
    actRenderer(() => handle().props.onPointerUp(up));
    expect(onDragEnd.mock.calls[0][0].delta.toArray()).toEqual([4, 5, 6]);
    expect((up.target as HTMLElement).releasePointerCapture)
      .toHaveBeenCalledWith(1);
    expect(onDragCancel).not.toHaveBeenCalled();

    const click = pointerEvent();
    actRenderer(() => handle().props.onClick(click));
    expect(onActivate).toHaveBeenCalledWith(click);
    actRenderer(() => handle().props.onClick(pointerEvent(new Vector3(), 2)));
    expect(onActivate).toHaveBeenCalledTimes(1);

    actRenderer(() => handle().props.onPointerOut(pointerEvent()));
    expect(onHoverChange).toHaveBeenLastCalledWith(false);
    expect(document.body.style.cursor).toEqual("default");
    unmountRenderer(wrapper);
  });

  it("cancels an active drag when pointer capture is lost", () => {
    const onDragCancel = jest.fn();
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        onDrag={jest.fn()}
        onDragCancel={onDragCancel}>
        <group />
      </ControlHandle>,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    actRenderer(() => handle.props.onPointerDown(pointerEvent()));
    actRenderer(() => handle.props.onLostPointerCapture(pointerEvent()));
    actRenderer(() => handle.props.onPointerCancel(pointerEvent()));
    expect(onDragCancel).toHaveBeenCalledTimes(1);
    unmountRenderer(wrapper);
  });

  it("commits the last drag after early pointer capture loss", () => {
    const onDragEnd = jest.fn();
    const onDragCancel = jest.fn();
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        commitLastDragOnPointerUp={true}
        onDrag={jest.fn()}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}>
        <group />
      </ControlHandle>,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    actRenderer(() =>
      handle.props.onPointerDown(pointerEvent(new Vector3(1, 2, 3))));
    actRenderer(() =>
      handle.props.onPointerMove(pointerEvent(new Vector3(4, 6, 8), 5)));
    actRenderer(() =>
      handle.props.onLostPointerCapture(pointerEvent()));

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(onDragCancel).not.toHaveBeenCalled();

    actRenderer(() => {
      window.dispatchEvent(new Event("pointerup"));
    });

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragEnd.mock.calls[0][0].delta.toArray()).toEqual([3, 4, 5]);
    expect(onDragCancel).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("keeps the pointer-down constraint for the full drag", () => {
    const onDrag = jest.fn();
    const view = (z: number) =>
      <ControlHandle
        name={"test-control"}
        constraint={planeConstraint("xy", [0, 0, z])}
        onDrag={onDrag}>
        <group />
      </ControlHandle>;
    const wrapper = createRenderer(view(0));
    const handle = () => wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    const event = () => ({
      ...pointerEvent(),
      ray: new Ray(
        new Vector3(0, 0, 100),
        new Vector3(1, 0, -1).normalize(),
      ),
    }) as ControlPointerEvent;

    actRenderer(() => handle().props.onPointerDown(event()));
    actRenderer(() => wrapper.update(view(50)));
    actRenderer(() => handle().props.onPointerMove(event()));

    expect(onDrag.mock.calls[0][0].point.toArray()).toEqual([100, 0, 0]);
    expect(onDrag.mock.calls[0][0].delta.toArray()).toEqual([0, 0, 0]);
    actRenderer(() => handle().props.onPointerUp(event()));
    unmountRenderer(wrapper);
  });

  it("resolves dynamic constraints at the pointer-down location", () => {
    const onDrag = jest.fn();
    const constraint = jest.fn((event: ControlPointerEvent) =>
      axisConstraint("x", [event.point.x, event.point.y, event.point.z]));
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        constraint={constraint}
        onDrag={onDrag}>
        <group />
      </ControlHandle>,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" && node.props.name == "test-control")[0];
    const down = pointerEvent(new Vector3(10, 20, 30));

    actRenderer(() => handle.props.onPointerDown(down));
    actRenderer(() => handle.props.onPointerMove(
      pointerEvent(new Vector3(15, 40, 60), 5),
    ));

    expect(constraint).toHaveBeenCalledWith(down);
    expect(onDrag.mock.calls[0][0].delta.toArray()).toEqual([5, 0, 0]);
    actRenderer(() => handle.props.onPointerUp(pointerEvent()));
    unmountRenderer(wrapper);
  });

  it("leaves disabled handles inert", () => {
    const onActivate = jest.fn();
    const onDragStart = jest.fn();
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        enabled={false}
        onActivate={onActivate}
        onDragStart={onDragStart}>
        <group />
      </ControlHandle>,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    actRenderer(() => handle.props.onPointerDown(pointerEvent()));
    actRenderer(() => handle.props.onClick(pointerEvent()));
    expect(onActivate).not.toHaveBeenCalled();
    expect(onDragStart).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("leaves rejected pointer starts available to overlapping controls", () => {
    const canStart = jest.fn(() => false);
    const onDragStart = jest.fn();
    const wrapper = createRenderer(
      <ControlHandle
        name={"test-control"}
        canStart={canStart}
        onDragStart={onDragStart}>
        <group />
      </ControlHandle>,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    const event = pointerEvent();

    actRenderer(() => handle.props.onPointerDown(event));

    expect(canStart).toHaveBeenCalledWith(event);
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(event.nativeEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    expect((event.target as HTMLElement).setPointerCapture)
      .not.toHaveBeenCalled();
    expect(onDragStart).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("cleans up hover and drag state when disabled", () => {
    const onHoverChange = jest.fn();
    const onDragCancel = jest.fn();
    const view = (enabled: boolean) =>
      <ControlHandle
        name={"test-control"}
        enabled={enabled}
        onHoverChange={onHoverChange}
        onDrag={jest.fn()}
        onDragCancel={onDragCancel}>
        <group />
      </ControlHandle>;
    const wrapper = createRenderer(view(true));
    const handle = () => wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "test-control")[0];
    actRenderer(() => handle().props.onPointerOver(pointerEvent()));
    actRenderer(() => handle().props.onPointerDown(pointerEvent()));
    actRenderer(() => wrapper.update(view(false)));
    expect(onHoverChange).toHaveBeenLastCalledWith(false);
    expect(onDragCancel).toHaveBeenCalledTimes(1);
    expect(document.body.style.cursor).toEqual("default");
    unmountRenderer(wrapper);
  });
});

describe("3D control visuals", () => {
  it("renders reusable sphere states and disables raycasting", () => {
    const wrapper = createRenderer(
      <ControlSphere
        name={"sphere"}
        radius={10}
        color={"blue"}
        hoverColor={"cyan"}
        hovered={true}
        enabled={false} />,
    );
    const sphere = wrapper.root.findAll(node =>
      node.type == "div" &&
      node.props.name == "sphere")[0];
    expect(sphere.props.args).toEqual([10, 16, 16]);
    expect(sphere.props.raycast).toBe(noControlRaycast);
    expect(sphere.props.raycast()).toBeUndefined();
    actRenderer(() => wrapper.update(
      <ControlSphere
        name={"sphere"}
        radius={10}
        enabled={true} />,
    ));
    expect(wrapper.root.findAll(node =>
      node.type == "div" &&
      node.props.name == "sphere")[0].props.raycast)
      .toBe(Mesh.prototype.raycast);
    unmountRenderer(wrapper);

    const hovered = createRenderer(
      <ControlSphere
        name={"sphere"}
        radius={10}
        color={"blue"}
        hoverColor={"cyan"}
        hovered={true} />,
    );
    expect(hovered.root.findAll(node =>
      node.type == "div" &&
      node.props.name == "sphere")[0].props.args[0])
      .toEqual(12.5);
    expect(hovered.root.findAll(node => node.props.color == "cyan").length)
      .toBeGreaterThan(0);
    unmountRenderer(hovered);

    const custom = createRenderer(
      <ControlSphere
        name={"custom"}
        radius={10}
        color={"purple"}
        hovered={true} />,
    );
    expect(custom.root.findAll(node => node.props.color == "purple").length)
      .toBeGreaterThan(0);
    unmountRenderer(custom);

    const origin = createRenderer(
      <ControlSphere
        name={"origin"}
        radius={10}
        colorType={"origin"}
        hoverScale={1}
        hovered={true}
        transparent={true}
        renderOnTop={true}
        renderOrder={10} />,
    );
    expect(origin.root.findAll(
      node => node.props.color == "lightgray").length)
      .toBeGreaterThan(0);
    const originSphere = origin.root.findAll(node =>
      node.type == "div" && node.props.name == "origin")[0];
    expect(originSphere.props.renderOrder).toEqual(1001);
    const originMaterial = originSphere.find(node =>
      node.type == "div" && node.props.color == "lightgray");
    expect(originMaterial.props.transparent).toEqual(true);
    expect(originMaterial.props.depthTest).toEqual(false);
    expect(originMaterial.props.depthWrite).toEqual(false);
    unmountRenderer(origin);
  });

  it("keeps visual pulses non-interactive and composes parent opacity", () => {
    type ToMapper = (...values: number[]) => number;
    const toSpy = jest.spyOn(springCore, "to")
      .mockImplementation(((_values: unknown, mapper: ToMapper) =>
        mapper(0.5, 0.25) as never) as never);
    const wrapper = createRenderer(
      <ControlPulse
        enabled={true}
        radius={10}
        color={"blue"}
        parentOpacity={0.25 as never} />,
    );
    const pulse = wrapper.root.find(node =>
      Array.isArray(node.props.args) &&
      node.props.args.join(",") == "10,12,12");

    expect(pulse.props.raycast).toBe(noControlRaycast);
    expect(toSpy).toHaveBeenCalled();
    unmountRenderer(wrapper);
    toSpy.mockRestore();
  });

  it("uses the parent sphere material type for its pulse", () => {
    const wrapper = createRenderer(
      <ControlSphere
        name={"phong-sphere"}
        radius={10}
        color={"blue"}
        pulse={{ enabled: true }} />,
    );

    expect(wrapper.root.findAllByType(MeshPhongMaterial)).toHaveLength(2);
    expect(wrapper.root.findAllByType(MeshBasicMaterial)).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("renders solid Phong arrows with configurable heads and labels", () => {
    const wrapper = createRenderer(
      <ControlArrow
        name={"arrow"}
        start={[0, 0, 0]}
        end={[100, 0, 0]}
        width={10}
        color={"blue"}
        heads={"both"}
        label={"100mm"}
        transparent={true}
        depthTest={false}
        depthWrite={false}
        renderOrder={1001}
        labelDepthTest={true}
        labelDepthWrite={true}
        labelRenderOrder={1002} />,
    );
    expect(wrapper.root.findAllByType(Cone)).toHaveLength(2);
    expect(wrapper.root.findAllByType(Cylinder)).toHaveLength(1);
    expect(wrapper.root.findAllByType(MeshPhongMaterial).length)
      .toBeGreaterThan(0);
    const label = wrapper.root.findByProps({ name: "arrow-label" });
    expect(label.props.children).toEqual("100mm");
    expect(label.props.depthTest).toEqual(true);
    expect(label.props.depthWrite).toEqual(true);
    expect(label.props.renderOrder).toEqual(1002);
    const arrowMaterials = wrapper.root.findAll(node =>
      node.type == "div" && node.props.color == "blue");
    expect(arrowMaterials.length).toBeGreaterThan(0);
    const arrowShapeMaterials = arrowMaterials.filter(material =>
      material.props.depthTest == false);
    expect(arrowShapeMaterials.length).toBeGreaterThan(0);
    arrowShapeMaterials.map(material => {
      expect(material.props.transparent).toEqual(true);
      expect(material.props.depthTest).toEqual(false);
      expect(material.props.depthWrite).toEqual(false);
    });
    wrapper.root.findAllByType(Cone).map(cone =>
      expect(cone.props.renderOrder).toEqual(1001));
    unmountRenderer(wrapper);

    const axis = createRenderer(
      <ControlArrow
        name={"x-axis"}
        start={[0, 0, 0]}
        end={[100, 0, 0]}
        width={10}
        colorType={"x"}
        hovered={true}
        hoverScale={1} />,
    );
    expect(axis.root.findAllByType(Cone)).toHaveLength(1);
    expect(axis.root.findAll(node => node.props.color == "#cc0000").length)
      .toBeGreaterThan(0);
    unmountRenderer(axis);

    const onTop = createRenderer(
      <ControlArrow
        name={"on-top"}
        start={[0, 0, 0]}
        end={[100, 0, 0]}
        width={10}
        color={"blue"}
        label={"100mm"}
        renderOnTop={true}
        renderOrder={10}
        labelRenderOrder={11} />,
    );
    expect(onTop.root.findAll(node =>
      node.props.name == "on-top"
      && node.props.renderOrder == 1001)[0]
      .props.renderOrder).toEqual(1001);
    const onTopLabel = onTop.root.findAll(node =>
      node.props.name == "on-top-label"
      && node.props.depthTest == false
      && node.props.renderOrder == 1001)[0];
    expect(onTopLabel.props.depthTest).toEqual(false);
    expect(onTopLabel.props.depthWrite).toEqual(false);
    expect(onTopLabel.props.renderOrder).toEqual(1001);
    expect(onTop.root.findAll(node =>
      node.props.color == "blue" &&
      node.props.depthTest == false &&
      node.props.depthWrite == false).length).toBeGreaterThan(0);
    unmountRenderer(onTop);

    const visualOnly = createRenderer(
      <ControlArrow
        name={"visual-only"}
        start={[0, 0, 0]}
        end={[100, 0, 0]}
        width={10}
        enabled={false}
        label={"r30"} />,
    );
    const visualOnlyLabel = visualOnly.root.find(node =>
      node.props.font &&
      node.props.raycast == noControlRaycast);
    expect(visualOnlyLabel.props.raycast).toBe(noControlRaycast);
    unmountRenderer(visualOnly);
  });

  it("renders pill buttons with shared interaction and click feedback", () => {
    const onClick = jest.fn();
    const wrapper = createRenderer(
      <ControlPillButton
        name={"pill"}
        position={[1, 2, 3]}
        label={"Action"}
        length={100}
        width={40}
        transparent={true}
        depthTest={false}
        depthWrite={false}
        renderOrder={1001}
        onClick={onClick} />,
    );
    const handle = wrapper.root.findAll(node =>
      `${node.type}` == "group" &&
      node.props.name == "pill")[0];
    actRenderer(() => handle.props.onPointerDown(pointerEvent()));
    expect(wrapper.root.findAll(node => node.props.pressed === true).length)
      .toBeGreaterThan(0);
    actRenderer(() => handle.props.onPointerUp(pointerEvent()));
    actRenderer(() => handle.props.onClick(pointerEvent()));
    expect(onClick).toHaveBeenCalledTimes(1);
    const material = wrapper.root.findByType(MeshPhongMaterial);
    expect(material.props).toMatchObject({
      color: "dimgray",
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const body = wrapper.root.findByProps({
      "data-extrude-name": "pill-body",
    });
    expect(body.props.userData).toEqual({
      length: 100,
      width: 40,
      thickness: 10,
    });
    expect(wrapper.root.findAll(node =>
      `${node.props.name}`.startsWith("pill-end-"))).toHaveLength(0);
    const label = wrapper.root.find(node =>
      node.props.font &&
      node.props.raycast == noControlRaycast);
    expect(label.props.raycast).toBe(noControlRaycast);
    unmountRenderer(wrapper);
  });
});

const CursorRequest = (props: { active: boolean; cursor: string }) => {
  useControlCursor(props.active, props.cursor);
  return <></>;
};

describe("<ControlCursorProvider />", () => {
  it("coordinates cursor ownership and restores target styles", () => {
    const garden = document.createElement("div");
    garden.className = "garden-bed-3d-model";
    garden.style.cursor = "crosshair";
    const canvas = document.createElement("canvas");
    garden.appendChild(canvas);
    document.body.appendChild(garden);
    const useThree = threeFiber.useThree as jest.Mock;
    useThree.mockReturnValue({
      gl: { domElement: canvas },
      events: { connected: canvas },
    });
    const view = render(
      <ControlCursorProvider baseCursor={"grab"}>
        <CursorRequest active={false} cursor={"pointer"} />
      </ControlCursorProvider>,
    );
    expect(canvas.style.cursor).toEqual("grab");
    expect(garden.style.cursor).toEqual("grab");
    view.rerender(
      <ControlCursorProvider baseCursor={"grab"}>
        <CursorRequest active={true} cursor={"pointer"} />
      </ControlCursorProvider>,
    );
    expect(canvas.style.cursor).toEqual("pointer");
    expect(garden.style.cursor).toEqual("pointer");
    view.unmount();
    expect(garden.style.cursor).toEqual("crosshair");
    garden.remove();
  });
});

describe("<ThreeDPopup />", () => {
  it("normalizes popup framing and event isolation", () => {
    const onClose = jest.fn();
    const onParentClick = jest.fn();
    const onParentPointerEvent = jest.fn();
    const onParentDoubleClick = jest.fn();
    const { container } = render(
      <div
        onClick={onParentClick}
        onPointerMove={onParentPointerEvent}
        onPointerUp={onParentPointerEvent}
        onPointerCancel={onParentPointerEvent}
        onDoubleClick={onParentDoubleClick}>
        <ThreeDPopup
          name={"popup"}
          position={[1, 2, 3]}
          title={"Title"}
          onClose={onClose}>
          <p>Content</p>
        </ThreeDPopup>
      </div>,
    );
    expect(container.querySelector(".three-d-object-popup")).toBeTruthy();
    expect(container.textContent).toContain("Title");
    expect(container.textContent).toContain("Content");
    const popup = container.querySelector(".three-d-object-popup");
    popup && fireEvent.click(popup);
    popup && fireEvent.pointerMove(popup);
    popup && fireEvent.pointerUp(popup);
    popup && fireEvent.pointerCancel(popup);
    popup && fireEvent.doubleClick(popup);
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onParentPointerEvent).not.toHaveBeenCalled();
    expect(onParentDoubleClick).not.toHaveBeenCalled();
    const button = container.querySelector("button");
    act(() => button?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
