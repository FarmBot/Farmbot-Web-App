import { WidgetHeader } from "../widget_header";
import { mount } from "enzyme";

describe("<WidgetHeader />", () => {
  it("renders title", () => {
    const wrapper = mount(WidgetHeader({
      title: "fakeWidget"
    }));
    expect(wrapper.html()).toContain("fakeWidget");
  });

  it("renders children", () => {
    const wrapper = mount(WidgetHeader({
      title: "fakeWidget",
      children: "children"
    }));
    expect(wrapper.html()).toContain("children");
  });

  it("renders ToolTip", () => {
    const wrapper = mount(WidgetHeader({
      title: "fakeWidget",
      helpText: "fakeHelp"
    }));
    expect(wrapper.html()).toContain("fa-question-circle");
    expect(wrapper.find(".title-help-text").html()).toContain("fakeHelp");
  });
});
