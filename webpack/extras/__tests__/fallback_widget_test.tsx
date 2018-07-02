import * as React from "react";
import { mount, shallow } from "enzyme";
import { FallbackWidget } from "../fallback_widget";

describe("<FallbackWidget/>", function () {

  it("renders widget fallback", function () {
    const wrapper =mount<>(<FallbackWidget title="FakeWidget" />);
    const widget = wrapper.find(".widget-wrapper");
    const header = widget.find(".widget-header");
    expect(header.text()).toContain("FakeWidget");
    const body = widget.find(".widget-body");
    expect(body.text()).toContain("Widget load failed.");
  });

  it("renders widget fallback with help text", function () {
    const helpText = "This is a fake widget.";
    const wrapper = shallow(<FallbackWidget
      title="FakeWidget" helpText={helpText} />);
    expect(wrapper.html()).toContain(
      "<i class=\"fa fa-question-circle help-icon\">" +
      "<div class=\"help-text\">This is a fake widget.</div></i>");
  });

});
