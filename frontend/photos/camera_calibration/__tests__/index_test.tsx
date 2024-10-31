const mockScanImage = jest.fn();
jest.mock("../actions", () => ({
  calibrate: jest.fn(),
  scanImage: jest.fn(() => mockScanImage),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { CameraCalibration } from "..";
import { CameraCalibrationProps } from "../interfaces";
import { scanImage } from "../actions";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";
import { SPECIAL_VALUES } from "../../remote_env/constants";
import { fakePhotosPanelState } from "../../../__test_support__/fake_camera_data";

describe("<CameraCalibration/>", () => {
  const fakeProps = (): CameraCalibrationProps => ({
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
    wDEnv: {},
    env: {},
    iteration: 1,
    morph: 2,
    blur: 3,
    H_LO: 4,
    S_LO: 5,
    V_LO: 6,
    H_HI: 7,
    S_HI: 8,
    V_HI: 9,
    botToMqttStatus: "up",
    syncStatus: "synced",
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    versions: {},
    showAdvanced: false,
    photosPanelState: fakePhotosPanelState(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    const wrapper = mount(<CameraCalibration {...p} />);
    ["HUE017947",
      "SATURATION025558",
      "VALUE025569",
      "Scan current image",
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("saves ImageWorkspace changes: API", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_H_LO", "3");
  });

  it("calls scanImage", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(scanImage).toHaveBeenCalledWith(false);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("saves CameraCalibrationConfig changes: API", () => {
    const p = fakeProps();
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("CameraCalibrationConfig")
      .simulate("change", "CAMERA_CALIBRATION_camera_offset_x", 10);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_camera_offset_x", "10");
  });

  it("saves string CameraCalibrationConfig changes: API", () => {
    const p = fakeProps();
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("CameraCalibrationConfig")
      .simulate("change", "CAMERA_CALIBRATION_image_bot_origin_location", 4);
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_image_bot_origin_location", "\"BOTTOM_LEFT\"");
  });

  it("shows calibrate as enabled", () => {
    const wrapper = shallow(<CameraCalibration {...fakeProps()} />);
    const btn = wrapper.find("button").first();
    expect(btn.text()).toEqual("Calibrate");
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    expect(error).not.toHaveBeenCalled();
  });

  it("shows calibrate as disabled when camera is disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = shallow(<CameraCalibration {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
  });

  it("toggles simple version on", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    const wrapper = mount(<CameraCalibration {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_easy_calibration", "\"FALSE\"",
    );
  });

  it("toggles simple version off", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.TRUE };
    const wrapper = mount(<CameraCalibration {...p} />);
    wrapper.find("input").first().simulate("change");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_easy_calibration", "\"TRUE\"",
    );
  });

  it("renders simple version", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.TRUE };
    const wrapper = mount(<CameraCalibration {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("blur");
    expect(wrapper.text()).toContain(Content.CAMERA_CALIBRATION_GRID_PATTERN);
    expect(wrapper.text()).not.toContain(Content.CAMERA_CALIBRATION_RED_OBJECTS);
  });
});
