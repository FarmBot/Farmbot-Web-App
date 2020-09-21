const mockDevice = { setUserEnv: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  CameraSelection, cameraDisabled, cameraCalibrated,
} from "../camera_selection";
import { CameraSelectionProps } from "../interfaces";
import { info, error } from "../../../toast/toast";

describe("<CameraSelection/>", () => {
  const fakeProps = (): CameraSelectionProps => ({
    env: {},
    botOnline: true,
    shouldDisplay: () => false,
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("doesn't render camera", () => {
    const cameraSelection = mount(<CameraSelection {...fakeProps()} />);
    expect(cameraSelection.find("button").text()).toEqual("USB Camera");
  });

  it("renders camera", () => {
    const p = fakeProps();
    p.env = { "camera": "\"RPI\"" };
    const cameraSelection = mount(<CameraSelection {...p} />);
    expect(cameraSelection.find("button").text()).toEqual("Raspberry Pi Camera");
  });

  const expectInfoCall = () => expect(info).toHaveBeenCalledWith(
    "Sending camera configuration...", { title: "Sending" });

  it("changes camera", () => {
    const cameraSelection = shallow(<CameraSelection {...fakeProps()} />);
    cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expectInfoCall();
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ camera: "\"mycamera\"" });
  });

  it("handles error changing camera", async () => {
    mockDevice.setUserEnv = jest.fn(() => { return Promise.reject(); });
    const cameraSelection = shallow(<CameraSelection {...fakeProps()} />);
    await cameraSelection.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    await expectInfoCall();
    expect(error)
      .toHaveBeenCalledWith("An error occurred during configuration.");
  });

  it("stores config in API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<CameraSelection {...p} />);
    wrapper.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
    expectInfoCall();
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("camera", "\"mycamera\"");
  });
});

describe("cameraDisabled()", () => {
  it("returns enabled", () => {
    expect(cameraDisabled({ camera: "USB" })).toEqual(false);
    expect(cameraDisabled({ camera: "" })).toEqual(false);
  });

  it("returns disabled", () => {
    expect(cameraDisabled({ camera: "none" })).toEqual(true);
    expect(cameraDisabled({ camera: "\"NONE\"" })).toEqual(true);
  });
});

describe("cameraCalibrated()", () => {
  const ENV_NAME = "CAMERA_CALIBRATION_coord_scale";
  it("returns calibrated", () => {
    expect(cameraCalibrated({ [ENV_NAME]: "1" })).toEqual(true);
    expect(cameraCalibrated({ [ENV_NAME]: "0.01" })).toEqual(true);
  });

  it("returns uncalibrated", () => {
    expect(cameraCalibrated({ [ENV_NAME]: "0" })).toEqual(false);
    expect(cameraCalibrated({ [ENV_NAME]: "0.0" })).toEqual(false);
    expect(cameraCalibrated({ [ENV_NAME]: "\"0\"" })).toEqual(false);
  });
});
