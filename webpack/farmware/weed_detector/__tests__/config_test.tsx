import * as React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetectorConfig } from "../config"

describe("<WeedDetectorConfig />", () => {
  it("renders", () => {
    const wrapper =mount<>(<WeedDetectorConfig
      values={{}} onChange={jest.fn()} />);
    ["Invert Hue Range Selection",
      "Calibration Object Separation",
      "Calibration Object Separation along axis",
      "Camera Offset X", "Camera Offset Y",
      "Origin Location in Image", "Bottom Left",
      "Pixel coordinate scale", "Camera rotation"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("changes value", () => {
    const onChange = jest.fn();
    const wrapper = shallow(<WeedDetectorConfig
      values={{}} onChange={onChange} />);
    const input = wrapper.find("FBSelect").first();
    input.simulate("change", { label: "", value: 4 });
    expect(onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_calibration_along_axis", 4);
    const badChange = () => input.simulate("change", { label: "", value: "4" });
    expect(badChange).toThrow("Weed detector got a non-numeric value");
  });
});
