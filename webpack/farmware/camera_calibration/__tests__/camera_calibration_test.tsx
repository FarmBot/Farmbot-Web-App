const mockDevice = { setUserEnv: jest.fn(() => Promise.resolve({})) };

jest.mock("../../../device", () => ({
  getDevice: () => {
    return mockDevice;
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { CameraCalibration } from "../camera_calibration";
import { CameraCalibrationProps } from "../interfaces";

describe("<CameraCalibration/>", () => {
  const props: CameraCalibrationProps = {
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
    syncStatus: "synced"
  };

  it("renders", () => {
    const wrapper = mount(<CameraCalibration {...props} />);
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
    const wrapper = shallow(<CameraCalibration {...props} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ CAMERA_CALIBRATION_H_LO: "3" });
  });
});
