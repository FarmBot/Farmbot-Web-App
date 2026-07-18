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
    (node.type == "div" || `${node.type}` == "group")
    && node.props.name == name);
  const controlSphere = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => {
    const control = sphere(wrapper, name);
    return `${control.type}` == "group"
      ? control.find(node =>
        node.type == "div"
        && node.props.name == `${name}-sphere`
        && Array.isArray(node.props.args))
      : control;
  };
  const arrow = (
    wrapper: ReturnType<typeof createRenderer>,
    name = "section-width-arrow-near",
  ) =>
    wrapper.root.find(node =>
      `${node.type}` == "group"
      && node.props.name == name);
  const axisToggle = (
    wrapper: ReturnType<typeof createRenderer>,
    name = "section-axis-toggle-positive",
  ) => wrapper.root.find(node =>
    `${node.type}` == "group"
    && node.props.name == name);
  const pillBody = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => sphere(wrapper, name).findByProps({
    "data-extrude-name": `${name}-body`,
  });
  const expectPillSize = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => expect(pillBody(wrapper, name).props.userData).toEqual({
    length: 280,
    width: 80,
    thickness: 10,
  });
  const sphereColor = (
    wrapper: ReturnType<typeof createRenderer>,
    name: string,
  ) => {
    const pillBodies = sphere(wrapper, name).findAllByProps({
      "data-extrude-name": `${name}-body`,
    });
    const control = pillBodies[0] ?? controlSphere(wrapper, name);
    return control.find(node =>
      node.type == "div" && !!node.props.color).props.color;
  };

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
      nearLine: [[51, -300, -292.5], [51, 300, -292.5]],
      farLine: [[-51, -300, -292.5], [-51, 300, -292.5]],
      followLine: [[-300, -400, -292.5], [-300, 400, -292.5]],
      centerHandles: [[0, -500, -292.5], [0, 500, -292.5]],
      axisTogglePositions: [[0, -625, -292.5], [0, 625, -292.5]],
      followHandles: [[-300, -400, -292.5], [-300, 400, -292.5]],
      followCenter: 200,
      nearWidthArrowStart: [51, 0, -292.5],
      farWidthArrowStart: [-51, 0, -292.5],
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
      [-500, -51, -292.5], [500, -51, -292.5],
    ]);
    expect(layout.farLine).toEqual([
      [-500, 51, -292.5], [500, 51, -292.5],
    ]);
    expect(layout.centerHandles).toEqual([
      [-700, 0, -292.5], [700, 0, -292.5],
    ]);
    expect(layout.axisTogglePositions).toEqual([
      [-825, 0, -292.5], [825, 0, -292.5],
    ]);
    expect(layout.followLine).toEqual([
      [-600, -200, -292.5], [600, -200, -292.5],
    ]);
    expect(layout.followHandles).toEqual([
      [-600, -200, -292.5], [600, -200, -292.5],
    ]);
    expect(layout.followCenter).toEqual(100);
    expect(layout.nearWidthArrowStart).toEqual([0, -51, -292.5]);
    expect(layout.farWidthArrowStart).toEqual([0, 51, -292.5]);
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
      && `${node.props.name}`.endsWith("-shape"))).toHaveLength(2);
    const widthBases = wrapper.root.findAll(node =>
      node.type == "div"
      && `${node.props.name}`.startsWith("section-width-arrow-")
      && `${node.props.name}`.endsWith("-base"));
    expect(widthBases).toHaveLength(2);
    expect([
      arrow(wrapper, "section-width-arrow-near").props.position,
      arrow(wrapper, "section-width-arrow-far").props.position,
    ]).toEqual([
      [51, 0, -292.5],
      [-51, 0, -292.5],
    ]);
    widthBases.map(base =>
      expect(base.find(node =>
        node.type == "div" && !!node.props.color).props.color)
        .toEqual("dodgerblue"));
    expect(wrapper.root.findAll(node =>
      node.type == "div"
      && `${node.props.name}`.startsWith("section-center-handle-")))
      .toHaveLength(2);
    const center = sphere(wrapper, "section-center-handle-positive");
    expect(`${center.type}`).toEqual("group");
    expect(controlSphere(wrapper, "section-center-handle-positive")
      .props.position).toBeUndefined();
    const centerArrows = center.findAll(node =>
      `${node.type}` == "group"
      && `${node.props.name}`.startsWith(
        "section-center-handle-positive-arrow-")
      && `${node.props.name}`.endsWith("-shape"));
    expect(centerArrows).toHaveLength(2);
    const centerArrowEnds = ["negative", "positive"].map(direction =>
      center.find(node =>
        node.props.name ==
        `section-center-handle-positive-arrow-${direction}` &&
        Array.isArray(node.props.end)).props.end);
    expect(centerArrowEnds).toEqual([
      [-250, 0, 0],
      [250, 0, 0],
    ]);
    centerArrows.map(node => {
      expect(node.props.position).toEqual([0, 0, 0]);
      expect(node.findByProps({ className: "cylinder" }).props.args)
        .toEqual([10, 10, 190, 16]);
      node.findAll(item => item.type == "div" && !!item.props.color)
        .map(material =>
          expect(material.props.color).toEqual("dodgerblue"));
    });
    const followNames = [
      "section-follow-toggle-negative",
      "section-follow-toggle-positive",
    ];
    expect(followNames.map(name => sphere(wrapper, name).props.rotation))
      .toEqual([[0, 0, 0], [0, 0, Math.PI]]);
    followNames.map(name => {
      expectPillSize(wrapper, name);
      expect(sphere(wrapper, name).findByProps({ className: "text" }).children)
        .toContain("Follow Bot");
    });
    const hoverEvent = event(0, 0);
    actRenderer(() => sphere(wrapper, followNames[0])
      .props.onPointerOver(hoverEvent));
    expect(document.body.style.cursor).toEqual("pointer");
    expectPillSize(wrapper, followNames[0]);
    expect(sphereColor(wrapper, followNames[0])).toEqual("gray");
    expect(sphereColor(wrapper, followNames[1])).toEqual("dimgray");
    actRenderer(() => sphere(wrapper, followNames[0])
      .props.onPointerOut(hoverEvent));
    expect(document.body.style.cursor).toEqual("default");
    followNames.map(name => {
      actRenderer(() => sphere(wrapper, name).props.onClick(event(0, 0)));
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
    expect(arrow(wrapper).props.position).toEqual([201, 0, -292.5]);
    expect(arrow(wrapper, "section-width-arrow-far").props.position)
      .toEqual([-201, 0, -292.5]);
    expect(controlSphere(wrapper, "section-center-handle-positive")
      .props.raycast()).toBeUndefined();
    expect(pillBody(wrapper, "section-follow-toggle-positive")
      .props.raycast()).toBeUndefined();
    expect(arrow(wrapper).findByProps({ className: "cylinder" })
      .props.raycast()).toBeUndefined();
    expect(arrow(wrapper).find(node =>
      node.type == "div" &&
      node.props.name == "section-width-arrow-near-base" &&
      Array.isArray(node.props.args)).props.raycast()).toBeUndefined();
    expect(axisToggle(wrapper).find(node =>
      node.type == "div" &&
      node.props["data-extrude-name"] ==
        "section-axis-toggle-positive-body" &&
      Array.isArray(node.props.args))
      .props.raycast()).toBeUndefined();
    const pointerEvent = event(0, 0);
    actRenderer(() => axisToggle(wrapper).props.onPointerOver(pointerEvent));
    actRenderer(() => axisToggle(wrapper).props.onPointerOut(pointerEvent));
    actRenderer(() => axisToggle(wrapper).props.onClick(pointerEvent));
    expect(controlProps.dispatch).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("renders pill controls that switch the section axis", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const pointerEvent = event(0, 0);
    const negative = axisToggle(wrapper, "section-axis-toggle-negative");
    expect(negative.props).toMatchObject({
      position: [0, -625, -292.5],
      rotation: [0, 0, 0],
    });
    expect(axisToggle(wrapper).props).toMatchObject({
      position: [0, 625, -292.5],
      rotation: [0, 0, Math.PI],
    });
    expect(negative.findByProps({
      "data-extrude-name": "section-axis-toggle-negative-body",
    }).props).toMatchObject({
      userData: { length: 280, width: 80, thickness: 10 },
    });
    expect(negative.findAll(node =>
      `${node.props.name}`.startsWith(
        "section-axis-toggle-negative-end-"))).toHaveLength(0);
    expect(negative.findByProps({ className: "text" }).children)
      .toContain("Switch Axis");
    expect(sphereColor(wrapper, "section-axis-toggle-negative"))
      .toEqual("dimgray");
    actRenderer(() => negative.props.onPointerOver(pointerEvent));
    expect(document.body.style.cursor).toEqual("pointer");
    expect(sphereColor(wrapper, "section-axis-toggle-negative"))
      .toEqual("gray");
    expectPillSize(wrapper, "section-axis-toggle-negative");
    actRenderer(() => axisToggle(wrapper, "section-axis-toggle-negative")
      .props.onPointerOut(pointerEvent));
    expect(document.body.style.cursor).toEqual("default");
    ["negative", "positive"].map(side => {
      const control = axisToggle(wrapper, `section-axis-toggle-${side}`);
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
    const yPlanes = getSectionClippingPlanes(config(), "y", 300, 100);
    controlProps.designer.threeDSectionAxis = "y";
    actRenderer(() => wrapper.update(<SectionControls
      {...controlProps}
      axis={"y"}
      center={300}
      nearPlane={yPlanes[1]}
      farPlane={yPlanes[0]} />));
    expect(axisToggle(wrapper, "section-axis-toggle-negative").props.rotation)
      .toEqual([0, 0, 3 * Math.PI / 2]);
    expect(axisToggle(wrapper).props.rotation)
      .toEqual([0, 0, 5 * Math.PI / 2]);
    unmountRenderer(wrapper);
  });

  it("applies animated opacity to all section controls", () => {
    const controlProps = props();
    controlProps.opacity = 0.4;
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const line = wrapper.root.findByProps({
      name: "section-center-line",
    });
    expect(line.props.transparent).toEqual(true);
    expect(line.props.opacity).toEqual(0.4);
    const sphereMaterial = controlSphere(
      wrapper,
      "section-center-handle-positive",
    ).find(node => node.type == "div" && !!node.props.color);
    expect(sphereMaterial.props.transparent).toEqual(true);
    expect(sphereMaterial.props.opacity).toEqual(0.4);
    const arrowMaterials = arrow(wrapper).findAll(node =>
      node.type == "div" && !!node.props.color);
    expect(arrowMaterials).toHaveLength(3);
    arrowMaterials.map(material => {
      expect(material.props.transparent).toEqual(true);
      expect(material.props.opacity).toEqual(0.4);
    });
    const axisToggleMaterials = axisToggle(wrapper).findAll(node =>
      node.type == "div" && node.props.transparent);
    expect(axisToggleMaterials).toHaveLength(2);
    axisToggleMaterials.map(material =>
      expect(material.props.opacity).toEqual(0.4));
    const followMaterials = sphere(
      wrapper,
      "section-follow-toggle-positive",
    ).findAll(node => node.type == "div" && node.props.transparent);
    expect(followMaterials).toHaveLength(2);
    followMaterials.map(material =>
      expect(material.props.opacity).toEqual(0.4));
    const axisToggleTextMaterial = axisToggle(wrapper)
      .findByProps({ className: "text" })
      .find(node => node.type == "div" && node.props.color == "white");
    expect(axisToggleTextMaterial.props.opacity).toEqual(0.4);
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

  it("preserves the grab offset when a center arrow is dragged", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const centerName = "section-center-handle-positive";
    const center = () => sphere(wrapper, centerName);
    actRenderer(() => center().props.onPointerDown(event(200, 500)));
    expect(center().props.position).toEqual([0, 500, -292.5]);
    actRenderer(() => center().props.onPointerMove(event(250, 500)));
    expect(center().props.position).toEqual([50, 500, -292.5]);
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 550, y: 300 },
    });
    actRenderer(() => center().props.onPointerUp(event(250, 500, 2)));
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
    expect(sphereColor(wrapper, centerName)).toEqual("orange");
    expect(sphere(wrapper, centerName).props.position)
      .toEqual([-300, 500, -292.5]);

    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerMove(event(-280, 500)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_CENTER,
      payload: { x: 220, y: 300 },
    });
    expect(sphereColor(wrapper, "section-follow-toggle-positive"))
      .toEqual("dimgray");
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
    actRenderer(() => arrow(wrapper).props.onPointerDown(event(51, 0)));
    expect(document.body.style.cursor).toEqual("grabbing");
    actRenderer(() => arrow(wrapper).props.onPointerMove(event(101, 0)));
    expect(document.body.style.cursor).toEqual("grabbing");
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 200,
    });
    expect(wrapper.root.findAllByProps({
      name: "section-width-arrow-near-label",
    }).length).toBeGreaterThan(0);
    actRenderer(() => arrow(wrapper).props.onPointerUp(event(-100, 0)));
    expect(document.body.style.cursor).toEqual("default");
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

  it("adjusts width from the far-plane arrow", () => {
    const controlProps = props();
    const wrapper = createRenderer(<SectionControls {...controlProps} />);
    const far = "section-width-arrow-far";
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerDown(event(-51, 0)));
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerMove(event(-101, 0)));
    expect(controlProps.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_3D_SECTION_WIDTH,
      payload: 200,
    });
    actRenderer(() => arrow(wrapper, far)
      .props.onPointerUp(event(-101, 0)));
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
    actRenderer(() => arrow(wrapper).props.onPointerDown(event(51, 0)));
    actRenderer(() => arrow(wrapper).props.onPointerMove(event(3000, 0)));
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
    const centerShape = () => controlSphere(
      wrapper, "section-center-handle-positive");

    actRenderer(() => center().props.onPointerOver(pointerEvent));
    expect(document.body.style.cursor).toEqual("pointer");
    expect(centerShape().props.args[0]).toEqual(43.75);
    actRenderer(() => center().props.onPointerDown(pointerEvent));
    expect(document.body.style.cursor).toEqual("grabbing");
    actRenderer(() => center().props.onPointerUp(pointerEvent));
    expect(document.body.style.cursor).toEqual("pointer");
    actRenderer(() => center().props.onPointerOut(pointerEvent));
    expect(document.body.style.cursor).toEqual("default");
    expect(centerShape().props.args[0]).toEqual(35);
    actRenderer(() => center().props.onPointerCancel(pointerEvent));
    actRenderer(() => center().props.onLostPointerCapture(pointerEvent));
    actRenderer(() => center().props.onPointerDown(pointerEvent));
    expect(document.body.style.cursor).toEqual("grabbing");
    actRenderer(() => center().props.onPointerCancel(pointerEvent));
    expect(document.body.style.cursor).toEqual("default");
    actRenderer(() => center().props.onPointerDown(pointerEvent));
    expect(document.body.style.cursor).toEqual("grabbing");
    actRenderer(() => center().props.onLostPointerCapture(pointerEvent));
    expect(document.body.style.cursor).toEqual("default");

    actRenderer(() => arrow(wrapper).props.onPointerOver(pointerEvent));
    expect(arrow(wrapper).find(node =>
      node.type == "div"
      && node.props.name == "section-width-arrow-near-base"
      && Array.isArray(node.props.args)).props.args[0]).toEqual(43.75);
    expect(wrapper.root.findByProps({
      name: "section-width-arrow-near-label",
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
    [
      "section-follow-toggle-negative",
      "section-follow-toggle-positive",
    ].map(name => {
      expect(pillBody(wrapper, name).find(node =>
        node.type == "div" && !!node.props.color).props.toneMapped)
        .toEqual(true);
      expect(sphere(wrapper, name)
        .findByProps({ className: "text" })
        .find(node => node.type == "div" && !!node.props.color)
        .props.color).toEqual("dimgray");
    });
    const hoverEvent = event(0, 0);
    const followName = "section-follow-toggle-positive";
    actRenderer(() => sphere(wrapper, followName)
      .props.onPointerOver(hoverEvent));
    expect(sphereColor(wrapper, followName)).toEqual("darkorange");
    actRenderer(() => sphere(wrapper, followName)
      .props.onPointerOut(hoverEvent));
    expect(sphereColor(wrapper, followName)).toEqual("orange");
    const centerName = "section-center-handle-positive";
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerOver(hoverEvent));
    expect(sphereColor(wrapper, centerName)).toEqual("darkorange");
    actRenderer(() => sphere(wrapper, centerName)
      .props.onPointerOut(hoverEvent));
    expect(sphereColor(wrapper, centerName)).toEqual("orange");
    unmountRenderer(wrapper);
  });
});
