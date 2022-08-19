import React from "react";
import { shallow } from "enzyme";
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
import { svgMount } from "../../../../../__test_support__/svg_mount";
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
      const result = svgMount(<BotFigure {...p} />);

      const expectedGantryProps = expect.objectContaining({
        id: "gantry",
        x: xySwap ? -100 : expected.x - 10,
        y: xySwap ? expected.x - 10 : -100,
        width: xySwap ? 1700 : 20,
        height: xySwap ? 20 : 1700,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const gantryProps = result.find("rect").props();
      expect(gantryProps).toEqual(expectedGantryProps);

      const expectedUTMProps = expect.objectContaining({
        id: "UTM",
        cx: xySwap ? expected.y : expected.x,
        cy: xySwap ? expected.x : expected.y,
        r: 35,
        fill: Color.darkGray,
        fillOpacity: opacity
      });
      const UTMProps = result.find("circle").props();
      expect(UTMProps).toEqual(expectedUTMProps);
    });

  it("changes location", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    p.position = { x: 100, y: 200, z: 0 };
    const result = svgMount(<BotFigure {...p} />);
    const gantry = result.find("#gantry");
    expect(gantry.length).toEqual(1);
    expect(gantry.props().x).toEqual(90);
    const UTM = result.find("circle").props();
    expect(UTM.cx).toEqual(100);
    expect(UTM.cy).toEqual(200);
  });

  it("changes color on e-stop", () => {
    const p = fakeProps();
    p.eStopStatus = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find("#gantry").props().fill).toEqual(Color.virtualRed);
  });

  it("shows coordinates on hover", () => {
    const p = fakeProps();
    p.position.x = 100;
    const wrapper = shallow<BotFigure>(<BotFigure {...p} />);
    expect(wrapper.instance().state.hovered).toBeFalsy();
    const utm = wrapper.find("#UTM-wrapper");
    utm.simulate("mouseOver");
    expect(wrapper.instance().state.hovered).toBeTruthy();
    expect(wrapper.find("text").props()).toEqual(expect.objectContaining({
      x: 100, y: 0, dx: 40, dy: 0,
      textAnchor: "start", visibility: "visible",
    }));
    expect(wrapper.find("text").text()).toEqual("(100, 0, 0)");
    utm.simulate("mouseLeave");
    expect(wrapper.instance().state.hovered).toBeFalsy();
    expect(wrapper.find("text").props()).toEqual(
      expect.objectContaining({ visibility: "hidden" }));
  });

  it("shows coordinates on hover: X&Y swapped", () => {
    const p = fakeProps();
    p.position.x = 100;
    p.mapTransformProps.xySwap = true;
    const wrapper = shallow<BotFigure>(<BotFigure {...p} />);
    const utm = wrapper.find("#UTM-wrapper");
    utm.simulate("mouseOver");
    expect(wrapper.instance().state.hovered).toBeTruthy();
    expect(wrapper.find("text").props()).toEqual(expect.objectContaining({
      x: 0, y: 100, dx: 0, dy: 55,
      textAnchor: "middle", visibility: "visible",
    }));
    expect(wrapper.find("text").text()).toEqual("(100, 0, 0)");
  });

  it("shows mounted tool", () => {
    const p = fakeProps();
    p.mountedToolInfo = fakeMountedToolInfo();
    p.mountedToolInfo.name = "Seeder";
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find("#UTM-wrapper").find("#mounted-tool").length)
      .toEqual(1);
  });

  it("gets tool props: mounted tool", () => {
    const p = fakeProps();
    p.mountedToolInfo = fakeMountedToolInfo();
    p.mountedToolInfo.pulloutDirection = ToolPulloutDirection.NEGATIVE_X;
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find<BotFigure>(BotFigure).instance()
      .getToolProps({ qx: 0, qy: 0 }))
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
    p.mountedToolInfo = undefined;
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find<BotFigure>(BotFigure).instance()
      .getToolProps({ qx: 0, qy: 0 }))
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
    const wrapper = svgMount(<BotFigure {...p} />);
    const UTM = wrapper.find("#UTM-wrapper");
    expect(UTM.find("#mounted-tool").length).toEqual(0);
    expect(UTM.find("#three-in-one-tool-head").length).toEqual(1);
  });

  it("shows camera view area", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraViewArea = true;
    p.cropPhotos = false;
    const wrapper = svgMount(<BotFigure {...p} />);
    const view = wrapper.find("#camera-view-area-wrapper");
    expect(view.find("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    expect(view.find("#angled-camera-view-area").last().props().width)
      .not.toEqual(0);
    expect(view.find("#snapped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    expect(view.find("#cropped-camera-view-area").length).toEqual(0);
  });

  it("doesn't show camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.center.x = "";
    p.cameraViewArea = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find("#angled-camera-view-area").first().props().width)
      .toBeFalsy();
  });

  it("shows small cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "10";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    const view = wrapper.find("#camera-view-area-wrapper");
    expect(view.find("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    expect(view.find("#cropped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("doesn't show uncropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "10";
    p.cameraViewArea = true;
    p.showUncroppedArea = false;
    p.cropPhotos = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    const view = wrapper.find("#camera-view-area-wrapper");
    expect(view.find("#angled-camera-view-area").length).toEqual(0);
    expect(view.find("#snapped-camera-view-area").length).toEqual(0);
    expect(view.find("#cropped-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("shows large cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.rotation = "47";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    const view = wrapper.find("#camera-view-area-wrapper");
    expect(view.find("#angled-camera-view-area").length)
      .toBeGreaterThanOrEqual(1);
    const circle = view.find("#cropped-camera-view-area");
    expect(circle.length).toBeGreaterThanOrEqual(1);
    expect(circle.last().props().style?.transform).not.toEqual(undefined);
  });

  it("doesn't show large cropped camera view area", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cameraCalibrationData.center = { x: undefined, y: undefined };
    p.cameraCalibrationData.rotation = "47";
    p.cameraViewArea = true;
    p.showUncroppedArea = true;
    p.cropPhotos = true;
    const wrapper = svgMount(<BotFigure {...p} />);
    const view = wrapper.find("#camera-view-area-wrapper");
    const circle = view.find("#cropped-camera-view-area");
    expect(circle.length).toEqual(0);
  });

  it("renders custom color", () => {
    const p = fakeProps();
    p.color = Color.blue;
    const wrapper = svgMount(<BotFigure {...p} />);
    expect(wrapper.find("#gantry").props().fill).toEqual(Color.blue);
  });
});
