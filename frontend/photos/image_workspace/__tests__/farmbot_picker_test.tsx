import React from "react";
import { shallow } from "enzyme";
import { FarmbotColorPicker, getHueBoxes } from "../farmbot_picker";
import { FarmbotPickerProps } from "../interfaces";

describe("<FarmbotColorPicker />", () => {
  it("renders", () => {
    const props: FarmbotPickerProps = {
      h: [30, 90],
      s: [100, 255],
      v: [100, 255],
      invertHue: false
    };
    const wrapper = shallow(<FarmbotColorPicker {...props} />);
    expect(wrapper.find("#farmbot-color-picker").length).toEqual(1);
    expect(wrapper.find("#hue").length).toEqual(1);
    expect(wrapper.find("#saturation").length).toEqual(1);
  });
});

describe("getHueBoxes()", () => {
  function verifyBox(
    box: React.CSSProperties,
    left: string,
    width: string,
    background: string | undefined) {
    expect(box.left).toEqual(left);
    expect(box.width).toEqual(width);
    expect(box.background).toEqual(background);
  }
  it("returns box css", () => {
    const boxes = getHueBoxes([30, 90], false);
    verifyBox(boxes[0], "0%", "17%", "rgba(0, 0, 0, 0.3)");
    verifyBox(boxes[1], "17%", "33%", undefined);
    verifyBox(boxes[2], "50%", "50%", "rgba(0, 0, 0, 0.3)");
  });

  it("returns box css: inverted hue", () => {
    const boxes = getHueBoxes([30, 90], true);
    verifyBox(boxes[0], "0%", "17%", undefined);
    verifyBox(boxes[1], "17%", "33%", "rgba(0, 0, 0, 0.3)");
    verifyBox(boxes[2], "50%", "50%", undefined);
  });
});
