import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BotOriginQuadrant } from "../../../../interfaces";
import { BotFigure, BotFigureProps } from "../bot_figure";
import { Color } from "../../../../../ui";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeMountedToolInfo,
} from "../../../../../__test_support__/fake_tool_info";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  fakeCameraCalibrationDataFull,
} from "../../../../../__test_support__/fake_camera_data";

describe("<BotFigure/>", () => {
  const fakeProps = (): BotFigureProps => ({
    figureName: "",
    position: { x: 0, y: 0, z: 0 },
    mapTransformProps: fakeMapTransformProps(),
    plantAreaOffset: { x: 100, y: 100 },
  });

  const EXPECTED_MOTORS_OPACITY = 0.5;

  const renderFigure = (
    props: BotFigureProps,
    ref?: React.RefObject<BotFigure | undefined>,
  ) => render(<svg><BotFigure {...props} ref={ref} /></svg>);

  const requiredElement = (
    container: HTMLElement,
    selector: string,
  ): HTMLElement => {
    const element = container.querySelector(selector);
    if (!element) { throw new Error(`Missing element: ${selector}`); }
    return element as HTMLElement;
  };

  const getAttribute = (element: Element, key: string) =>
    element.getAttribute(key) ||
    element.getAttribute(key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`));

  const getNumericAttribute = (element: Element, key: string) => {
    const value = getAttribute(element, key);
    if (value === undefined || value === undefined) {
      throw new Error(`Missing attribute ${key}`);
    }
    return Number(value);
  };

  it.each<[
    string, BotOriginQuadrant, Record<"x" | "y", number>, boolean, number
  ]>([
    ["motors", 1, { x: 3000, y: 0 }, false, EXPECTED_MOTORS_OPACITY],
    ["motors", 2, { x: 0, y: 0 }, false, EXPECTED_MOTORS_OPACITY],
    ["motors", 3, { x: 0, y: 1500 }, false, EXPECTED_MOTORS_OPACITY],
    ["motors", 4, { x: 3000, y: 1500 }, false, EXPECTED_MOTORS_OPACITY],
    ["motors", 1, { x: 0, y: 1500 }, true, EXPECTED_MOTORS_OPACITY],
    ["motors", 2, { x: 0, y: 0 }, true, EXPECTED_MOTORS_OPACITY],
    ["motors", 3, { x: 3000, y: 0 }, true, EXPECTED_MOTORS_OPACITY],
    ["motors", 4, { x: 3000, y: 1500 }, true, EXPECTED_MOTORS_OPACITY],
    ["encoders", 2, { x: 0, y: 0 }, false, 0.25],
  ])("shows %s in correct location for quadrant %i",
    (figureName, quadrant, expected, xySwap, opacity) => {
      const p = fakeProps();
      p.mapTransformProps.quadrant = quadrant;
      p.mapTransformProps.xySwap = xySwap;
      p.figureName = figureName;
      const { container } = renderFigure(p);

      const gantry = requiredElement(container, "#gantry");
      expect(getNumericAttribute(gantry, "x")).toEqual(
        xySwap ? -100 : expected.x - 10);
      expect(getNumericAttribute(gantry, "y")).toEqual(
        xySwap ? expected.x - 10 : -100);
      expect(getNumericAttribute(gantry, "width")).toEqual(
        xySwap ? 1700 : 20);
      expect(getNumericAttribute(gantry, "height")).toEqual(
        xySwap ? 20 : 1700);
      expect(getAttribute(gantry, "fill")).toEqual(Color.darkGray);
      expect(getNumericAttribute(gantry, "fillOpacity")).toEqual(opacity);

      const utm = requiredElement(container, "#UTM");
      expect(getNumericAttribute(utm, "cx")).toEqual(
        xySwap ? expected.y : expected.x);
      expect(getNumericAttribute(utm, "cy")).toEqual(
        xySwap ? expected.x : expected.y);
      expect(getNumericAttribute(utm, "r")).toEqual(35);
      expect(getAttribute(utm, "fill")).toEqual(Color.darkGray);
      expect(getNumericAttribute(utm, "fillOpacity")).toEqual(opacity);
    });

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.position = { x: 100, y: 200, z: 0 };
    const { container } = renderFigure(p);
    expect(container.querySelectorAll("#gantry").length).toEqual(1);
    expect(getNumericAttribute(requiredElement(container, "#gantry"), "x"))
      .toEqual(90);
    const utm = requiredElement(container, "circle");
    expect(getNumericAttribute(utm, "cx")).toEqual(100);
    expect(getNumericAttribute(utm, "cy")).toEqual(200);
  });

  it("changes color on e-stop", () => {
    const p = fakeProps();
    p.eStopStatus = true;
    const { container } = renderFigure(p);
    expect(getAttribute(requiredElement(container, "#gantry"), "fill"))
      .toEqual(Color.virtualRed);
  });

  it("shows coordinates on hover", () => {
    const p = fakeProps();
    const ref = React.createRef<BotFigure>();
    p.position.x = 100;
    const { container } = renderFigure(p, ref);
    expect(ref.current?.state.hovered).toBeFalsy();
    const utm = requiredElement(container, "#UTM-wrapper");
    fireEvent.mouseOver(utm);
    expect(ref.current?.state.hovered).toBeTruthy();
    const text = requiredElement(container, "text");
    expect(getNumericAttribute(text, "x")).toEqual(100);
    expect(getNumericAttribute(text, "y")).toEqual(0);
    expect(getNumericAttribute(text, "dx")).toEqual(40);
    expect(getNumericAttribute(text, "dy")).toEqual(0);
    expect(getAttribute(text, "textAnchor")).toEqual("start");
    expect(getAttribute(text, "visibility")).toEqual("visible");
    expect(text.textContent).toEqual("(100, 0, 0)");
    fireEvent.mouseLeave(utm);
    expect(ref.current?.state.hovered).toBeFalsy();
    expect(getAttribute(text, "visibility")).toEqual("hidden");
  });

  it("shows coordinates on hover: X&Y swapped", () => {
    const p = fakeProps();
    const ref = React.createRef<BotFigure>();
    p.position.x = 100;
    p.mapTransformProps.xySwap = true;
    const { container } = renderFigure(p, ref);
    fireEvent.mouseOver(requiredElement(container, "#UTM-wrapper"));
    expect(ref.current?.state.hovered).toBeTruthy();
    const text = requiredElement(container, "text");
    expect(getNumericAttribute(text, "x")).toEqual(0);
    expect(getNumericAttribute(text, "y")).toEqual(100);
    expect(getNumericAttribute(text, "dx")).toEqual(0);
    expect(getNumericAttribute(text, "dy")).toEqual(55);
    expect(getAttribute(text, "textAnchor")).toEqual("middle");
    expect(getAttribute(text, "visibility")).toEqual("visible");
    expect(text.textContent).toEqual("(100, 0, 0)");
  });

  it("shows mounted tool", () => {
    const p = fakeProps();
    p.mountedToolInfo = fakeMountedToolInfo();
    p.mountedToolInfo.name = "Seeder";
    const { container } = renderFigure(p);
    expect(container.querySelectorAll("#UTM-wrapper #mounted-tool").length)
      .toEqual(1);
  });

  it("gets tool props: mounted tool", () => {
    const p = fakeProps();
    const ref = React.createRef<BotFigure>();
    p.mountedToolInfo = fakeMountedToolInfo();
    p.mountedToolInfo.pulloutDirection = ToolPulloutDirection.NEGATIVE_X;
    renderFigure(p, ref);
    expect(ref.current?.getToolProps({ qx: 0, qy: 0 }))
      .toEqual({
        toolName: "fake mounted tool",
        dispatch: expect.any(Function),
        hovered: false,
        pulloutDirection: ToolPulloutDirection.NEGATIVE_X,
        flipped: false,
        toolTransformProps: {
          xySwap: false,
          quadrant: 2,
        },
        uuid: "utm",
        x: 0,
        y: 0,
      });
  });

  it("gets tool props: no mounted tool info", () => {
    const p = fakeProps();
    const ref = React.createRef<BotFigure>();
    p.mountedToolInfo = undefined;
    renderFigure(p, ref);
    expect(ref.current?.getToolProps({ qx: 0, qy: 0 }))
      .toEqual({
        dispatch: expect.any(Function),
        hovered: false,
        pulloutDirection: ToolPulloutDirection.POSITIVE_X,
        flipped: false,
        toolTransformProps: {
          xySwap: false,
          quadrant: 2,
        },
        uuid: "utm",
        x: 0,
        y: 0,
      });
  });

  it("shows tool head", () => {
    const p = fakeProps();
    p.mountedToolInfo = fakeMountedToolInfo();
    p.mountedToolInfo.noUTM = true;
    p.mountedToolInfo.name = undefined;
    const { container } = renderFigure(p);
    const utm = requiredElement(container, "#UTM-wrapper");
    expect(utm.querySelectorAll("#mounted-tool").length).toEqual(0);
    expect(utm.querySelectorAll("#three-in-one-tool-head").length).toEqual(1);
  });

  it("shows camera view area", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraViewArea = true;
    p.cropPhotos = false;
    const { container } = renderFigure(p);
    const view = requiredElement(container, "#camera-view-area-wrapper");
    expect(view.querySelectorAll("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    const angled = view.querySelectorAll("#angled-camera-view-area");
    const lastAngled = angled[angled.length - 1];
    expect(getNumericAttribute(lastAngled, "width")).toBeGreaterThan(0);
    expect(view.querySelectorAll("#snapped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    expect(view.querySelectorAll("#cropped-camera-view-area").length)
      .toEqual(0);
  });

  it("doesn't show camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.center.x = "";
    p.cameraViewArea = true;
    const { container } = renderFigure(p);
    const angled = requiredElement(container, "#angled-camera-view-area");
    expect(getAttribute(angled, "width")).toBeFalsy();
  });

  it("shows small cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "10";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const { container } = renderFigure(p);
    const view = requiredElement(container, "#camera-view-area-wrapper");
    expect(view.querySelectorAll("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    expect(view.querySelectorAll("#cropped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("doesn't show uncropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "10";
    p.cameraViewArea = true;
    p.showUncroppedArea = false;
    p.cropPhotos = true;
    const { container } = renderFigure(p);
    const view = requiredElement(container, "#camera-view-area-wrapper");
    expect(view.querySelectorAll("#angled-camera-view-area").length).toEqual(0);
    expect(view.querySelectorAll("#snapped-camera-view-area").length).toEqual(0);
    expect(view.querySelectorAll("#cropped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("shows large cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "47";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const { container } = renderFigure(p);
    const view = requiredElement(container, "#camera-view-area-wrapper");
    expect(view.querySelectorAll("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    const circle = view.querySelectorAll("#cropped-camera-view-area");
    expect(circle.length).toBeGreaterThanOrEqual(1);
    const style = circle[circle.length - 1].getAttribute("style");
    expect(style).toContain("transform:");
  });

  it("doesn't show large cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.center = { x: undefined, y: undefined };
    p.cameraCalibrationData.rotation = "47";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const { container } = renderFigure(p);
    const view = requiredElement(container, "#camera-view-area-wrapper");
    const circle = view.querySelectorAll("#cropped-camera-view-area");
    expect(circle.length).toEqual(0);
  });

  it("renders custom color", () => {
    const p = fakeProps();
    p.color = Color.blue;
    const { container } = renderFigure(p);
    expect(getAttribute(requiredElement(container, "#gantry"), "fill"))
      .toEqual(Color.blue);
  });
});
