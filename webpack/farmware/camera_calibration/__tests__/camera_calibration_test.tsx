import * as React from "react";
import { mount } from "enzyme";
import { CameraCalibration } from "../camera_calibration";
import { CameraCalibrationProps } from "../interfaces";

describe("<CameraCalibration/>", () => {
  it("renders", () => {
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
      V_HI: 9
    };
    const wrapper = mount(<CameraCalibration {...props} />);
    ["Camera Calibration",
      "Color Range",
      "HUE017947",
      "SATURATION025558",
      "VALUE025569",
      "Processing Parameters",
      "Scan image"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
