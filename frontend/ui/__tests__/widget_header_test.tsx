import React from "react";
import { mount } from "enzyme";
import { WidgetHeader, WidgetHeaderProps } from "../widget_header";

describe("<WidgetHeader />", () => {
  const fakeProps = (): WidgetHeaderProps => ({
    title: "fakeWidget",
  });

  it("renders title", () => {
    const wrapper = mount(<WidgetHeader {...fakeProps()} />);
    expect(wrapper.html()).toContain("fakeWidget");
  });

  it("renders children", () => {
    const p = fakeProps();
    p.children = "children";
    const wrapper = mount(<WidgetHeader {...p} />);
    expect(wrapper.html()).toContain("children");
  });

  it("renders help text", () => {
    const p = fakeProps();
    p.helpText = "fakeHelp";
    const wrapper = mount(<WidgetHeader {...p} />);
    expect(wrapper.html()).toContain("fa-question-circle");
  });
});
