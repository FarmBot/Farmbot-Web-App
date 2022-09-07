import React from "react";
import { mount, shallow } from "enzyme";
import {
  CameraSelection, cameraDisabled, cameraCalibrated, cameraBtnProps, Camera,
} from "../camera_selection";
import { CameraSelectionProps } from "../interfaces";
import { error } from "../../../toast/toast";

describe("<CameraSelection />", () => {
  const fakeProps = (): CameraSelectionProps => ({
    env: {},
    botOnline: true,
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

  it("stores config in API", () => {
    const p = fakeProps();
    const wrapper = shallow(<CameraSelection {...p} />);
    wrapper.find("FBSelect")
      .simulate("change", { label: "My Camera", value: "mycamera" });
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

describe("cameraBtnProps()", () => {
  it("is offline", () => {
    const env = { camera: Camera.NONE };
    cameraBtnProps(env, true).click?.();
    expect(error).toHaveBeenCalled();
    jest.resetAllMocks();
    cameraBtnProps(env, false).click?.();
    expect(error).not.toHaveBeenCalled();
  });
});
