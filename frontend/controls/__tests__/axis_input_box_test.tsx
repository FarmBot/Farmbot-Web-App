import React from "react";
import { AxisInputBox } from "../axis_input_box";
import { render, screen } from "@testing-library/react";
import { Xyz } from "farmbot";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

describe("<AxisInputBox/>", () => {
  function inputBoxWithValue(value: number | undefined) {
    const axis: Xyz = "x";
    const props = { axis, value, onChange: jest.fn() };
    return render(<AxisInputBox {...props} />);
  }

  it("renders 0 if 0", () => {
    // HISTORIC CONTEXT: We hit a bug where entering "0" resulting in -1.
    inputBoxWithValue(0);
    expect(screen.getByRole("spinbutton")).toHaveValue(0);
  });

  it("renders '' if undefined", () => {
    inputBoxWithValue(undefined);
    expect(screen.getByRole("spinbutton")).toHaveValue(null);
  });

  it("tests inputs", () => {
    function testInput(input: string, expected: number | undefined) {
      const onChange = jest.fn();
      const view =
        render(<AxisInputBox axis={"x"} value={undefined} onChange={onChange} />);
      const el = view.getByRole("spinbutton");
      changeBlurableInputRTL(el, input);
      expect(onChange).toHaveBeenCalledWith("x", expected);
      view.unmount();
    }
    testInput("", undefined);
    testInput("1", 1);
    testInput("1.1", 1.1);
    testInput("e", undefined);
  });
});
