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
    expect(wrapper.text()).toContain("Camera Calibration");
    expect(wrapper.text()).toContain("Color Range");
    expect(wrapper.text()).toContain("HUE017947");
    expect(wrapper.text()).toContain("SATURATION025558");
    expect(wrapper.text()).toContain("VALUE025569");
    expect(wrapper.text()).toContain("Processing Parameters");
    expect(wrapper.text()).toContain("Scan image");
  });
});
