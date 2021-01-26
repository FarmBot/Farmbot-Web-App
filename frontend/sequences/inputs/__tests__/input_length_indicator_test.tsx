import React from "react";
import { mount } from "enzyme";
import {
  InputLengthIndicatorProps, InputLengthIndicator,
} from "../input_length_indicator";
import { repeat } from "lodash";

describe("<InputLengthIndicator />", () => {
  const fakeProps = (): InputLengthIndicatorProps => ({
    field: "message",
    value: repeat(" ", 290),
  });

  it("shows indicator", () => {
    const wrapper = mount(<InputLengthIndicator {...fakeProps()} />);
    expect(wrapper.text()).toContain("292/300");
    expect(wrapper.find("span").props().hidden).toBeFalsy();
  });

  it("shows indicator for unknown field", () => {
    const p = fakeProps();
    p.field = "url";
    const wrapper = mount(<InputLengthIndicator {...p} />);
    expect(wrapper.text()).toContain("292/300");
  });

  it("hides indicator", () => {
    const p = fakeProps();
    p.value = " ";
    const wrapper = mount(<InputLengthIndicator {...p} />);
    expect(wrapper.find("span").props().hidden).toBeTruthy();
  });
});
