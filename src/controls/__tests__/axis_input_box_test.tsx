import * as React from "react";
import { AxisInputBox } from "../axis_input_box";
import { mount } from "enzyme";
import { Xyz } from "farmbot/dist";

describe("<AxisInputBox/>", () => {
  function inputBoxWithValue(value: number | undefined) {
    let axis: Xyz = "x";
    let props = { axis, value, onChange: jest.fn() };
    return mount(<AxisInputBox {...props } />);
  }

  it("renders 0 if 0", () => {
    // HISTORIC CONTEXT: We hit a bug where entering "0" resulting in -1.
    let el = inputBoxWithValue(0);
    expect(el.find("input").first().props().value).toBe(0);
  });

  it("renders -1 if undefined", () => {
    let el = inputBoxWithValue(undefined);
    expect(el.find("input").first().props().value).toBe(-1);
  });
});
