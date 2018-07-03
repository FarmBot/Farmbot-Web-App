import * as React from "react";
import { AxisInputBox } from "../axis_input_box";
import { mount, shallow } from "enzyme";
import { Xyz } from "farmbot/dist";

describe("<AxisInputBox/>", () => {
  function inputBoxWithValue(value: number | undefined) {
    const axis: Xyz = "x";
    const props = { axis, value, onChange: jest.fn() };
    return mount(<AxisInputBox {...props} />);
  }

  it("renders 0 if 0", () => {
    // HISTORIC CONTEXT: We hit a bug where entering "0" resulting in -1.
    const el = inputBoxWithValue(0);
    expect(el.find("input").first().props().value).toBe(0);
  });

  it("renders '' if undefined", () => {
    const el = inputBoxWithValue(undefined);
    expect(el.find("input").first().props().value).toBe("");
  });

  it("tests inputs", () => {
    const onChange = jest.fn();
    const wrapper = shallow(<AxisInputBox
      axis={"x"} value={undefined} onChange={onChange} />);

    function testInput(input: string, expected: number | undefined) {
      jest.clearAllMocks();
      wrapper.find("BlurableInput")
        .simulate("commit", { currentTarget: { value: input } });
      expect(onChange).toHaveBeenCalledWith("x", expected);
    }
    testInput("", undefined);
    testInput("1", 1);
    testInput("e", undefined);
  });
});
