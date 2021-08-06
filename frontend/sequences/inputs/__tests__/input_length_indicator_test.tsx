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
    expect(wrapper.text()).toContain("290/300");
    expect(wrapper.find("span").props().hidden).toBeFalsy();
  });

  it("shows indicator for unknown field", () => {
    const p = fakeProps();
    p.field = "url";
    p.value = "url";
    const wrapper = mount(<InputLengthIndicator {...p} />);
    expect(wrapper.text()).toContain("5/3000");
    expect(wrapper.find("span").hasClass("over")).toBeFalsy();
  });

  it("shows indicator when over limit", () => {
    const p = fakeProps();
    p.value = repeat(" ", 301);
    const wrapper = mount(<InputLengthIndicator {...p} />);
    expect(wrapper.text()).toContain("301/300");
    expect(wrapper.find("span").hasClass("over")).toBeTruthy();
  });

  it("hides indicator", () => {
    const p = fakeProps();
    p.value = " ";
    const wrapper = mount(<InputLengthIndicator {...p} />);
    expect(wrapper.find("span").props().hidden).toBeTruthy();
  });
});
