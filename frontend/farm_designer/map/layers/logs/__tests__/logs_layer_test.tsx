import React, { act } from "react";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { awayFromHome, LogsLayer, positionDifferent } from "../logs_layer";
import { LogsLayerProps } from "../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeCameraCalibrationData, fakeCameraCalibrationDataFull,
} from "../../../../../__test_support__/fake_camera_data";
import { fakeLog } from "../../../../../__test_support__/fake_state/resources";
import { CameraViewArea } from "../../farmbot/bot_figure";
import { fakeBotLocationData } from "../../../../../__test_support__/fake_bot_data";

describe("<LogsLayer />", () => {
  const captureLog1 = fakeLog();
  captureLog1.body.id = undefined;
  captureLog1.uuid = "fakeCaptureLog1Uuid";
  captureLog1.body.message = "Taking photo";
  const captureLog2 = fakeLog();
  captureLog2.body.id = 1;
  captureLog2.uuid = "fakeCaptureLog2Uuid";
  captureLog2.body.message = "Taking photo";
  const calibrateLog = fakeLog();
  calibrateLog.body.id = undefined;
  calibrateLog.uuid = "fakeCalibrateLogUuid";
  calibrateLog.body.message = "Calibrating camera";
  const detectLog = fakeLog();
  detectLog.body.id = undefined;
  detectLog.uuid = "fakeDetectLogUuid";
  detectLog.body.message = "Running weed detector";
  const measureLog = fakeLog();
  measureLog.body.id = undefined;
  measureLog.uuid = "fakeMeasureLogUuid";
  measureLog.body.message = "Executing Measure Soil Height";
  const findHomeLog = fakeLog();
  findHomeLog.body.id = undefined;
  findHomeLog.uuid = "fakeFindHomeLogUuid";
  findHomeLog.body.message = "Finding home on all axes";
  const otherLog = fakeLog();
  otherLog.body.id = undefined;
  otherLog.uuid = "fakeOtherLogUuid";
  otherLog.body.message = "photo";
  const fakeProps = (): LogsLayerProps => ({
    visible: true,
    logs: [
      captureLog1, captureLog2,
      calibrateLog, detectLog, measureLog,
      findHomeLog,
      otherLog,
    ],
    mapTransformProps: fakeMapTransformProps(),
    cameraCalibrationData: fakeCameraCalibrationData(),
    getConfigValue: jest.fn(),
    deviceTarget: "",
    botPosition: fakeBotLocationData().position,
    plantAreaOffset: { x: 0, y: 0 },
  });

  it("renders", () => {
    const wrapper = svgMount(<LogsLayer {...fakeProps()} />);
    [
      "#image-log-fakeCaptureLog1Uuid-visual",
      "#image-log-fakeCalibrateLogUuid-visual",
      "#image-log-fakeDetectLogUuid-visual",
      "#image-log-fakeMeasureLogUuid-visual",
      "#movement-log-fakeFindHomeLogUuid-visual",
    ].map(id => expect(wrapper.find(id).length).toEqual(1));
    [
      "#image-log-fakeCaptureLog2Uuid-visual",
      "#image-log-fakeOtherLogUuid-visual",
    ].map(id => expect(wrapper.find(id).length).toEqual(0));
    expect(wrapper.find(".capture").length).toEqual(1);
    expect(wrapper.find(".scan").length).toEqual(3);
    expect(wrapper.find(".find").length).toEqual(1);
    expect(wrapper.find(".animate").length).toEqual(5);
  });

  it("doesn't animate", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find(".capture").length).toEqual(1);
    expect(wrapper.find(".scan").length).toEqual(3);
    expect(wrapper.find(".find").length).toEqual(1);
    expect(wrapper.find(".animate").length).toEqual(0);
  });

  it("removes visuals", () => {
    jest.useFakeTimers();
    const wrapper = svgMount(<LogsLayer {...fakeProps()} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(4);
    act(() => { jest.advanceTimersByTime(10000); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(3);
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(0);
  });

  it("removes visuals more slowly", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.deviceTarget = "rpi";
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(4);
    act(() => { jest.advanceTimersByTime(30000); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(3);
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(0);
  });

  it("shows full visuals", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.botPosition = { x: 10, y: 20, z: 30 };
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find("#image-log-visuals").length).toEqual(4);
    expect(wrapper.find("#angled-camera-view-area-wrapper").length).toEqual(4);
    expect(wrapper.find("#finding-home").length).toEqual(1);
  });

  it("shows cropped visuals", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find("#image-log-visuals").length).toEqual(4);
    expect(wrapper.find("#angled-camera-view-area-wrapper").length).toEqual(0);
    expect(wrapper.find("#finding-home").length).toEqual(0);
  });
});

describe("positionDifferent()", () => {
  it("returns false: undefined", () => {
    const result = positionDifferent(
      { x: undefined, y: undefined, z: undefined },
      { x: undefined, y: undefined, z: undefined });
    expect(result).toEqual(false);
  });

  it("returns false", () => {
    const result = positionDifferent(
      { x: 1, y: 2, z: 3 },
      { x: 2, y: 3, z: 4 },
      2);
    expect(result).toEqual(false);
  });

  it("returns true", () => {
    const result = positionDifferent(
      { x: 1, y: 2, z: 3 },
      { x: 2, y: 3, z: 4 });
    expect(result).toEqual(true);
  });
});

describe("awayFromHome()", () => {
  it("returns result", () => {
    expect(awayFromHome({ x: 1, y: 2, z: 3 })).toEqual(true);
    expect(awayFromHome({ x: 0, y: 0, z: 0 })).toEqual(false);
    expect(awayFromHome({ x: 1, y: 2, z: 3 }, 2)).toEqual(true);
    expect(awayFromHome({ x: 1, y: 2, z: 3 }, 5)).toEqual(false);
  });
});
