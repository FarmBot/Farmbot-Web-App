import React from "react";
import { clone } from "lodash";
import { Ray, Vector3 } from "three";
import { INITIAL } from "../config";
import {
  getSectionControlLayout, sectionCameraDirection,
  sectionControlNoRaycast, SectionControls,
} from "../section_controls";
import { getSectionClippingPlanes, SECTION_CLIPPING_EXEMPT } from
  "../section";
import { fakeDesignerState } from
  "../../__test_support__/fake_designer_state";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { Actions } from "../../constants";

describe("section controls", () => {
  const config = () => {
    const result = clone(INITIAL);
    result.bedLengthOuter = 1000;
    result.bedWidthOuter = 600;
    result.bedHeight = 300;
    result.bedZOffset = 25;
    result.bedXOffset = 0;
    result.bedYOffset = 0;
    result.beamLength = 700;
    result.kitVersion = "v1.9";
    return result;
  };
  const position = { x: 200, y: 100, z: 0 };
  const event = (x: number, y: number, delta = 0) => ({
    point: new Vector3(x, y, -292.5),
    delta,
    pointerId: 1,
    stopPropagation: jest.fn(),
    nativeEvent: { stopImmediatePropagation: jest.fn() },
    target: {
      setPointerCapture: jest.fn(),
      releasePointerCapture: jest.fn(),
    },
    ray: new Ray(new Vector3(x, y, 0), new Vector3(0, 0, -1)),
  });
  const props = () => {
    const designer = fakeDesignerState();
    designer.threeDSectionOpen = true;
    designer.threeDSectionAxis = "x";
    designer.threeDSectionCenter = { x: 500, y: 300 };
    designer.threeDSectionWidth = 100;
    designer.threeDSectionFollowBot = false;
    const planes = getSectionClippingPlanes(config(), "x", 500, 100);
    return {
      config: config(),
      configPosition: position,
      designer,
      dispatch: jest.fn(),
      gardenSize: { x: 1000, y: 600 },
      axis: "x" as const,
      center: 500,
      width: 100,
      opacity: 1,
      interactive: true,
      nearPlane: planes[1],
      farPlane: planes[0],
      onDraggingChange: jest.fn(),
    };
  };
  const sphere = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => wrapper.root.find(node =>
    node.type == "div" && node.props.name == name);
  const arrow = (
    wrapper: ReturnType<typeof createRenderer>,
    name = "section-width-arrow-near-positive",
  ) =>
    wrapper.root.find(node =>
      `${node.type}` == "group"
      && node.props.name == name);
  const axisArrow = (
    wrapper: ReturnType<typeof createRenderer>,
    name = "section-axis-toggle-positive",
  ) => wrapper.root.find(node =>
    `${node.type}` == "group"
    && node.props.name == name);
  const sphereColor = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => sphere(wrapper, name).find(node =>
    node.type == "div" && !!node.props.color).props.color;

  it("lays out x-axis guides and handles", () => {
    const layout = getSectionControlLayout({
      config: config(),
      configPosition: position,
      axis: "x",
      center: 500,
      width: 100,
      cameraDirection: 1,
    });
    expect(layout).toEqual({
      z: -292.5,
      centerLine: [[0, -500, -292.5], [0, 500, -292.5]],
      nearLine: [[50, -500, -292.5], [50, 500, -292.5]],
      farLine: [[-50, -500, -292.5], [-50, 500, -292.5]],
      followLine: [[-300, -400, -292.5], [-300, 400, -292.5]],
      centerHandles: [[0, -500, -292.5], [0, 500, -292.5]],
      axisToggleArrowStarts: [[0, -535, -292.5], [0, 535, -292.5]],
      followHandles: [[-300, -400, -292.5], [-300, 400, -292.5]],
      followCenter: 200,
      nearWidthArrowStarts: [
        [50, -500, -292.5], [50, 500, -292.5],
      ],
      farWidthArrowStarts: [
        [-50, -500, -292.5], [-50, 500, -292.5],
      ],
    });
  });

  it("lays out y-axis controls toward the camera", () => {
    const layout = getSectionControlLayout({
      config: config(),
      configPosition: position,
      axis: "y",
      center: 300,
      width: 100,
      cameraDirection: -1,
    });
    expect(layout.centerLine).toEqual([
      [-700, 0, -292.5], [700, 0, -292.5],
    ]);
    expect(layout.nearLine).toEqual([
      [-700, -50, -292.5], [700, -50, -292.5],
    ]);
    expect(layout.farLine).toEqual([
      [-700, 50, -292.5], [700, 50, -292.5],
    ]);
    expect(layout.centerHandles).toEqual([
      [-700, 0, -292.5], [700, 0, -292.5],
    ]);
    expect(layout.axisToggleArrowStarts).toEqual([
      [-735, 0, -292.5], [735, 0, -292.5],
    ]);
    expect(layout.followLine).toEqual([
      [-600, -200, -292.5], [600, -200, -292.5],
    ]);
    expect(layout.followHandles).toEqual([
      [-600, -200, -292.5], [600, -200, -292.5],
    ]);
    expect(layout.followCenter).toEqual(100);
    expect(layout.nearWidthArrowStarts).toEqual([
      [-700, -50, -292.5], [700, -50, -292.5],
    ]);
    expect(layout.farWidthArrowStarts).toEqual([
      [-700, 50, -292.5], [700, 50, -292.5],
    ]);
  });

  it("identifies the camera side of the section", () => {
    const planes = getSectionClippingPlanes(config(), "x", 500, 100);
    expect(sectionCameraDirection(planes[1], planes[0], "x")).toEqual(1);
    expect(sectionCameraDirection(planes[0], planes[1], "x")).toEqual(-1);
    expect(sectionControlNoRaycast()).toBeUndefined();
  });

  it("renders clipping-exempt controls and toggles follow", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const group = wrapper.root.findByProps({ name: "section-controls" });
    expect(group.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    [
      "section-follow-controls",
      "section-center-controls",
      "section-near-plane-controls",
      "section-far-plane-controls",
    ].map(name => expect(wrapper.root.findByProps({ name })).toBeTruthy());
    expect(wrapper.root.findByProps({ name: "section-center-line" }).props)
      .toMatchObject({ dashed: true, dashSize: 25, gapSize: 25 });
    expect(wrapper.root.findAll(node =>
      `${node.type}` == "group"
      && `${node.props.name}`.startsWith("section-width-arrow-")
      && `${node.props.name}`.endsWith("-shape"))).toHaveLength(4);
    expect(wrapper.root.findAll(node =>
      node.type == "div"
      && `${node.props.name}`.startsWith("section-center-handle-")))
      .toHaveLength(2);
    const followNames = [
      "section-follow-toggle-negative",
      "section-follow-toggle-positive",
    ];
    const hoverEvent = event(0, 0);
    actRenderer(() => sphere(wrapper, followNames[0])
      .props.onPointerOver(hoverEvent));
    expect(sphere(wrapper, followNames[0]).props.args[0]).toEqual(43.75);
    expect(sphere(wrapper, followNames[1]).props.args[0]).toEqual(35);
    actRenderer(() => sphere(wrapper, followNames[0])
      .props.onPointerOut(hoverEvent));
    followNames.map(name => {
      actRenderer(() => sphere(wrapper, name).props.onPointerDown(event(0, 0)));
      actRenderer(() => sphere(wrapper, name).props.onPointerUp(event(0, 0)));
    });
    expect(controlProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: true,
    });
    expect(controlProps.dispatch).toHaveBeenCalledTimes(2);
    unmountRenderer(wrapper);
  });

  it("renders animated geometry without interaction during transitions", () => {
    const controlProps = props();
    controlProps.width = 400;
    controlProps.interactive = false;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    expect(wrapper.root.findByProps({
      name: "section-width-arrow-near-positive-shape",
    }).props.position).toEqual([200, 500, -292.5]);
    expect(wrapper.root.findByProps({
      name: "section-width-arrow-far-positive-shape",
    }).props.position).toEqual([-200, 500, -292.5]);
    expect(sphere(wrapper, "section-center-handle-positive")
      .props.raycast()).toBeUndefined();
    expect(arrow(wrapper).findByProps({ className: "cylinder" })
      .props.raycast()).toBeUndefined();
    expect(axisArrow(wrapper).findByProps({ className: "cylinder" })
      .props.raycast()).toBeUndefined();
    unmountRenderer(wrapper);
  });

  it("toggles the section axis from either center arrow", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const pointerEvent = event(0, 0);
    const negative = axisArrow(wrapper, "section-axis-toggle-negative");
    expect(negative.findByProps({
      name: "section-axis-toggle-negative-shape",
    }).props).toMatchObject({
      position: [0, -535, -292.5],
      rotation: [0, 0, -Math.PI / 2],
    });
    expect(axisArrow(wrapper).findByProps({
      name: "section-axis-toggle-positive-shape",
    }).props).toMatchObject({
      position: [0, 535, -292.5],
      rotation: [0, 0, Math.PI / 2],
    });
    actRenderer(() => negative.props.onPointerOver(pointerEvent));
    expect(axisArrow(wrapper, "section-axis-toggle-negative")
      .findByProps({ className: "cylinder" }).props.args[0]).toEqual(12.5);
    actRenderer(() => axisArrow(wrapper, "section-axis-toggle-negative")
      .props.onPointerOut(pointerEvent));
    ["negative", "positive"].map(side => {
      const control = axisArrow(wrapper, `section-axis-toggle-${side}`);
      actRenderer(() => control.props.onClick(pointerEvent));
    });

    expect(controlProps.dispatch).toHaveBeenCalledTimes(2);
    expect(controlProps.dispatch).toHaveBeenNthCalledWith(1, {
      type: Actions.SET_3D_SECTION_AXIS,
      payload: "y",
    });
    expect(controlProps.dispatch).toHaveBeenNthCalledWith(2, {
      type: Actions.SET_3D_SECTION_AXIS,
      payload: "y",
    });
    expect(pointerEvent.stopPropagation).toHaveBeenCalledTimes(4);
    expect(pointerEvent.nativeEvent.stopImmediatePropagation)
      .toHaveBeenCalledTimes(2);
    unmountRenderer(wrapper);
  });

  it("applies animated opacity to lines, spheres, and arrows", () => {
    const controlProps = props();
    controlProps.opacity = 0.4;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const line = wrapper.root.findByProps({
      name: "section-center-line",
    });
    expect(line.props.transparent).toEqual(true);
    expect(line.props.opacity).toEqual(0.4);
    const sphereMaterial = sphere(
      wrapper,
      "section-center-handle-positive",
    ).find(node => node.type == "div" && !!node.props.color);
    expect(sphereMaterial.props.transparent).toEqual(true);
    expect(sphereMaterial.props.opacity).toEqual(0.4);
    const arrowMaterials = arrow(wrapper).findAll(node =>
      node.type == "div" && !!node.props.color);
    expect(arrowMaterials).toHaveLength(2);
    arrowMaterials.map(material => {
      expect(material.props.transparent).toEqual(true);
      expect(material.props.opacity).toEqual(0.4);
    });
    const axisArrowMaterials = axisArrow(wrapper).findAll(node =>
      node.type == "div" && !!node.props.color);
    expect(axisArrowMaterials).toHaveLength(2);
    axisArrowMaterials.map(material =>
      expect(material.props.opacity).toEqual(0.4));
    unmountRenderer(wrapper);
  });

  it("moves the center and shows its garden coordinate", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const start = event(0, 500);
    actRenderer(() => sphere(wrapper, "section-center-handle-positive")
      .props.onPointerDown(start));
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(true);
    actRenderer(() => sphere(wrapper, "section-center-handle-positive")
      .props.onPointerMove(event(100, 500)));
    expect(wrapper.root.findAllByProps({
      name: "section-center-handle-label",
    }).length).toBeGreaterThan(0);
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 600, y: 300 },
    });
    actRenderer(() => sphere(wrapper, "section-center-handle-positive")
      .props.onPointerUp(event(1000, 500, 2)));
    expect(controlProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 1000, y: 300 },
    });
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: false,
    });
    expect(wrapper.root.findAllByProps({
      name: "section-center-handle-label",
    })).toHaveLength(0);
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(true);
    controlProps.center = 1000;
    controlProps.designer.threeDSectionCenter.x = 1000;
    actRenderer(() => wrapper.update(
      <SectionControls {...controlProps} />));
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(false);
    unmountRenderer(wrapper);
  });

  it("turns follow off when the center is dragged away", () => {
    const controlProps = props();
    controlProps.designer.threeDSectionFollowBot = true;
    controlProps.center = 200;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerDown(event(-300, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-200, 500)));
    expect(controlProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 300, y: 300 },
    });
    expect(controlProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: false,
    });
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerUp(event(-200, 500)));
    expect(controlProps.dispatch.mock.calls.filter(([action]) =>
      action.type == Actions.SET_3D_SECTION_FOLLOW_BOT)).toHaveLength(2);
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: false,
    });
    unmountRenderer(wrapper);
  });

  it("keeps follow on when a center drag is released snapped", () => {
    const controlProps = props();
    controlProps.designer.threeDSectionFollowBot = true;
    controlProps.center = 200;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerDown(event(-300, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-295, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerUp(event(-290, 500, 2)));
    expect(controlProps.dispatch.mock.calls.slice(-2)).toEqual([
      [{
        type: Actions.SET_3D_SECTION_CENTER,
        payload: { x: 500, y: 300 },
      }],
      [{
        type: Actions.SET_3D_SECTION_FOLLOW_BOT,
        payload: true,
      }],
    ]);
    expect(controlProps.dispatch.mock.calls.filter(([action]) =>
      action.type == Actions.SET_3D_SECTION_FOLLOW_BOT
      && action.payload === false)).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("preserves the default manual center when snapped", () => {
    const controlProps = props();
    controlProps.designer.threeDSectionCenter.x = undefined;
    controlProps.designer.threeDSectionFollowBot = true;
    controlProps.gardenSize.x = 1200;
    controlProps.center = 200;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerDown(event(-300, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-295, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerUp(event(-290, 500, 2)));
    expect(controlProps.dispatch.mock.calls.slice(-2)).toEqual([
      [{
        type: Actions.SET_3D_SECTION_CENTER,
        payload: { x: 600, y: 300 },
      }],
      [{
        type: Actions.SET_3D_SECTION_FOLLOW_BOT,
        payload: true,
      }],
    ]);
    unmountRenderer(wrapper);
  });

  it("snaps, unsnaps, and enables follow when released snapped", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerDown(event(0, 500)));
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-295, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 200, y: 300 },
    });
    expect(sphereColor(wrapper, "section-follow-toggle-positive"))
      .toEqual("orange");
    expect(sphere(wrapper, centerName).props.position)
      .toEqual([-300, 500, -292.5]);

    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-280, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 220, y: 300 },
    });
    expect(sphereColor(wrapper, "section-follow-toggle-positive"))
      .toEqual("dodgerblue");
    expect(sphere(wrapper, centerName).props.position)
      .toEqual([-280, 500, -292.5]);
    expect(controlProps.dispatch.mock.calls.filter(([action]) =>
      action.type == Actions.SET_3D_SECTION_FOLLOW_BOT)).toHaveLength(0);

    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerUp(event(-290, 500, 2)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: true,
    });
    unmountRenderer(wrapper);
  });

  it("toggles follow when the center sphere is clicked", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    const clickCenter = () => {
      actRenderer(() => sphere(wrapper, centerName)
        .props.onPointerDown(event(0, 800)));
      actRenderer(() => sphere(wrapper, centerName)
        .props.onPointerUp(event(0, 800)));
    };
    clickCenter();
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: true,
    });
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(false);

    controlProps.designer.threeDSectionFollowBot = true;
    actRenderer(() => wrapper.update(
      <SectionControls {...controlProps} />));
    clickCenter();
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_FOLLOW_BOT,
      payload: false,
    });
    expect(controlProps.dispatch.mock.calls.filter(([action]) =>
      action.type == Actions.SET_3D_SECTION_CENTER)).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("adjusts width from the near plane down to one millimeter", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    actRenderer(() => arrow(wrapper).props.onPointerDown(event(50, 500)));
    actRenderer(() => arrow(wrapper).props.onPointerMove(event(100, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 200,
    });
    expect(wrapper.root.findAllByProps({
      name: "section-width-arrow-near-positive-label",
    }).length).toBeGreaterThan(0);
    actRenderer(() => arrow(wrapper).props.onPointerUp(event(-100, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 1,
    });
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(true);
    controlProps.designer.threeDSectionWidth = 1;
    actRenderer(() => wrapper.update(
      <SectionControls {...controlProps} />));
    expect(controlProps.onDraggingChange).toHaveBeenLastCalledWith(false);
    unmountRenderer(wrapper);
  });

  it("adjusts width from either far-plane arrow", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const far = "section-width-arrow-far-negative";
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerDown(event(-50, -500)));
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerMove(event(-100, -500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 200,
    });
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerUp(event(-100, -500)));
    expect(controlProps.onDraggingChange).toHaveBeenNthCalledWith(1, true);
    expect(controlProps.onDraggingChange).toHaveBeenCalledTimes(1);
    controlProps.designer.threeDSectionWidth = 200;
    actRenderer(() => wrapper.update(
      <SectionControls {...controlProps} />));
    expect(controlProps.onDraggingChange).toHaveBeenNthCalledWith(2, false);
    unmountRenderer(wrapper);
  });

  it("limits width arrows to twice the chosen axis length", () => {
    const controlProps = props();
    controlProps.gardenSize.x = 2400;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    actRenderer(() => arrow(wrapper).props.onPointerDown(event(50, 500)));
    actRenderer(() => arrow(wrapper).props.onPointerMove(event(3000, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 4800,
    });
    unmountRenderer(wrapper);
  });

  it("handles control hover and drag cancellation", () => {
    const wrapper = createRenderer(<SectionControls {...props()} />);
    const pointerEvent = event(0, 500);
    const center = () => sphere(
      wrapper, "section-center-handle-positive");

    actRenderer(() => center().props.onPointerOver(pointerEvent));
    expect(center().props.args[0]).toEqual(43.75);
    actRenderer(() => center().props.onPointerOut(pointerEvent));
    expect(center().props.args[0]).toEqual(35);
    actRenderer(() => center().props.onPointerCancel(pointerEvent));
    actRenderer(() => center().props.onLostPointerCapture(pointerEvent));
    actRenderer(() => center().props.onPointerDown(pointerEvent));
    actRenderer(() => center().props.onPointerCancel(pointerEvent));
    actRenderer(() => center().props.onPointerDown(pointerEvent));
    actRenderer(() => center().props.onLostPointerCapture(pointerEvent));

    actRenderer(() => arrow(wrapper).props.onPointerOver(pointerEvent));
    expect(wrapper.root.findByProps({
      name: "section-width-arrow-near-positive-label",
    })).toBeTruthy();
    actRenderer(() => arrow(wrapper).props.onPointerOut(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onPointerCancel(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onLostPointerCapture(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onPointerDown(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onPointerCancel(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onPointerDown(pointerEvent));
    actRenderer(() => arrow(wrapper).props.onLostPointerCapture(pointerEvent));
    unmountRenderer(wrapper);
  });

  it("shows orange follow and center handles while following", () => {
    const controlProps = props();
    controlProps.designer.threeDSectionFollowBot = true;
    controlProps.center = 200;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    expect(wrapper.root.findAll(node =>
      node.type == "div"
      && `${node.props.name}`.startsWith("section-center-handle-")))
      .toHaveLength(2);
    [
      "section-follow-toggle-negative",
      "section-follow-toggle-positive",
      "section-center-handle-negative",
      "section-center-handle-positive",
    ].map(name =>
      expect(sphereColor(wrapper, name))
        .toEqual("orange"));
    unmountRenderer(wrapper);
  });
});
