import React from "react";
import { mount, shallow } from "enzyme";
import { FallbackWidget, FallbackWidgetProps } from "../fallback_widget";

describe("<FallbackWidget />", () => {
  const fakeProps = (): FallbackWidgetProps => ({
    title: "FakeWidget",
  });

  it("renders widget fallback", () => {
    const wrapper = mount(<FallbackWidget {...fakeProps()} />);
    const widget = wrapper.find(".widget-wrapper");
    const header = widget.find(".widget-header");
    expect(header.text()).toContain("FakeWidget");
    const body = widget.find(".widget-body");
    expect(body.text()).toContain("Widget load failed.");
  });

  it("renders widget fallback with help text", () => {
    const p = fakeProps();
    p.helpText = "This is a fake widget.";
    const wrapper = shallow(<FallbackWidget {...p} />);
    expect(wrapper.html())
      .toContain("<i role=\"tooltip\" class=\"fa fa-question-circle help-icon\"");
  });
});
