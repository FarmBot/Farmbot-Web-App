import React from "react";
import { mount } from "enzyme";
import { Checkbox, CheckboxProps } from "../checkbox";

describe("<Checkbox />", () => {
  const fakeProps = (): CheckboxProps => ({
    onChange: jest.fn(),
    title: "title text",
    checked: false,
  });

  it("renders", () => {
    const wrapper = mount(<Checkbox {...fakeProps()} />);
    expect(wrapper.html()).toContain("title text");
  });

  it("renders: partial", () => {
    const p = fakeProps();
    p.partial = true;
    const wrapper = mount(<Checkbox {...p} />);
    expect(wrapper.html()).toContain("partial");
  });

  it("renders: disabled", () => {
    const p = fakeProps();
    p.disabled = true;
    const wrapper = mount(<Checkbox {...p} />);
    expect(wrapper.html()).toContain("incompatible");
  });
});
