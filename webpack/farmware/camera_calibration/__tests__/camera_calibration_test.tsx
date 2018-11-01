const mockDevice = { setUserEnv: jest.fn(() => Promise.resolve({})) };

jest.mock("../../../device", () => ({
  getDevice: () => {
    return mockDevice;
  }
}));

jest.mock("../actions", () => ({ scanImage: jest.fn() }));
jest.mock("../../images/actions", () => ({ selectImage: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { CameraCalibration } from "../camera_calibration";
import { CameraCalibrationProps } from "../interfaces";
import { scanImage } from "../actions";
import { selectImage } from "../../images/actions";

describe("<CameraCalibration/>", () => {
  const fakeProps = (): CameraCalibrationProps => ({
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
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
    shouldDisplay: () => false,
    saveFarmwareEnv: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<CameraCalibration {...fakeProps()} />);
    ["Color Range",
      "HUE017947",
      "SATURATION025558",
      "VALUE025569",
      "Processing Parameters",
      "Scan image"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("saves changes", () => {
    const p = fakeProps();
    p.shouldDisplay = () => false;
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ CAMERA_CALIBRATION_H_LO: "3" });
  });

  it("saves ImageWorkspace changes: API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_H_LO", "3");
  });

  it("calls scanImage", () => {
    const wrapper = shallow(<CameraCalibration {...fakeProps()} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(scanImage).toHaveBeenCalledWith(1);
  });

  it("calls selectImage", () => {
    const wrapper = shallow(<CameraCalibration {...fakeProps()} />);
    wrapper.find("ImageWorkspace").simulate("flip", "image0001");
    expect(selectImage).toHaveBeenCalledWith("image0001");
  });

  it("saves WeedDetectorConfig changes: API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<CameraCalibration {...p} />);
    wrapper.find("WeedDetectorConfig")
      .simulate("change", "CAMERA_CALIBRATION_camera_offset_x", 10);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_camera_offset_x", "10");
  });
});
