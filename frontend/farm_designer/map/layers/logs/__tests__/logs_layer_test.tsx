import React from "react";
import { act } from "react-dom/test-utils";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { LogsLayer } from "../logs_layer";
import { LogsLayerProps } from "../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeCameraCalibrationData, fakeCameraCalibrationDataFull,
} from "../../../../../__test_support__/fake_camera_data";
import { fakeLog } from "../../../../../__test_support__/fake_state/resources";
import { CameraViewArea } from "../../farmbot/bot_figure";

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
  const otherLog = fakeLog();
  otherLog.body.id = undefined;
  otherLog.uuid = "fakeOtherLogUuid";
  otherLog.body.message = "photo";
  const fakeProps = (): LogsLayerProps => ({
    visible: true,
    logs: [captureLog1, captureLog2, calibrateLog, detectLog],
    mapTransformProps: fakeMapTransformProps(),
    cameraCalibrationData: fakeCameraCalibrationData(),
    getConfigValue: jest.fn(),
    deviceTarget: "",
  });

  it("renders", () => {
    const wrapper = svgMount(<LogsLayer {...fakeProps()} />);
    [
      "#image-log-fakeCaptureLog1Uuid-visual",
      "#image-log-fakeCalibrateLogUuid-visual",
      "#image-log-fakeDetectLogUuid-visual",
    ].map(id => expect(wrapper.find(id).length).toEqual(1));
    [
      "#image-log-fakeCaptureLog2Uuid-visual",
      "#image-log-fakeOtherLogUuid-visual",
    ].map(id => expect(wrapper.find(id).length).toEqual(0));
    expect(wrapper.find(".capture").length).toEqual(1);
    expect(wrapper.find(".scan").length).toEqual(2);
    expect(wrapper.find(".animate").length).toEqual(3);
  });

  it("doesn't animate", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find(".capture").length).toEqual(1);
    expect(wrapper.find(".scan").length).toEqual(2);
    expect(wrapper.find(".animate").length).toEqual(0);
  });

  it("removes visuals", () => {
    jest.useFakeTimers();
    const wrapper = svgMount(<LogsLayer {...fakeProps()} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(3);
    act(() => { jest.advanceTimersByTime(10000); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(2);
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(0);
  });

  it("removes visuals more slowly", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.deviceTarget = "rpi";
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(3);
    act(() => { jest.advanceTimersByTime(30000); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(2);
    act(() => { jest.runAllTimers(); });
    wrapper.update();
    expect(wrapper.find(CameraViewArea).length).toEqual(0);
  });

  it("shows full visuals", () => {
    const p = fakeProps();
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find("#image-log-visuals").length).toEqual(3);
    expect(wrapper.find("#angled-camera-view-area-wrapper").length).toEqual(3);
  });

  it("shows cropped visuals", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    const wrapper = svgMount(<LogsLayer {...p} />);
    expect(wrapper.find("#image-log-visuals").length).toEqual(3);
    expect(wrapper.find("#angled-camera-view-area-wrapper").length).toEqual(0);
  });
});
