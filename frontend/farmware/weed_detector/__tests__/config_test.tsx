import * as React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetectorConfig } from "../config";
import { SettingsMenuProps } from "../interfaces";

describe("<WeedDetectorConfig />", () => {
  const fakeProps = (): SettingsMenuProps => ({
    values: {},
    onChange: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<WeedDetectorConfig {...fakeProps()} />);
    ["Invert Hue Range Selection",
      "Calibration Object Separation",
      "Calibration Object Separation along axis",
      "Camera Offset X", "Camera Offset Y",
      "Origin Location in Image", "Bottom Left",
      "Pixel coordinate scale", "Camera rotation"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("changes axis value", () => {
    const p = fakeProps();
    const wrapper = shallow(<WeedDetectorConfig {...p} />);
    const input = wrapper.find("FBSelect").first();
    input.simulate("change", { label: "", value: 4 });
    expect(p.onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_calibration_along_axis", 4);
    const badChange = () => input.simulate("change", { label: "", value: "4" });
    expect(badChange).toThrow("Weed detector got a non-numeric value");
  });

  it("changes number value", () => {
    const p = fakeProps();
    const wrapper = shallow<WeedDetectorConfig>(<WeedDetectorConfig {...p} />);
    const numBox = wrapper.instance().NumberBox({
      conf: "CAMERA_CALIBRATION_blur", label: "label"
    });
    const NumBox = shallow(numBox);
    NumBox.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "1.23" }
    });
    expect(p.onChange).toHaveBeenCalledWith("CAMERA_CALIBRATION_blur", 1.23);
  });
});
