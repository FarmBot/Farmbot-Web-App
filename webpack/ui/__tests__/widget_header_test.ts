import { WidgetHeader } from "../widget_header";
import { mount } from "enzyme";
import { docLink } from "../doc_link";

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

  it("renders helpText", () => {
    const wrapper = mount(WidgetHeader({
      title: "fakeWidget",
      helpText: "fakeHelp"
    }));
    expect(wrapper.html()).toContain("fakeHelp");
    expect(wrapper.html()).not.toContain("a href");
  });

  it("renders docs link", () => {
    const wrapper = mount(WidgetHeader({
      title: "fakeWidget",
      helpText: "fakeHelp",
      docPage: "farmware"
    }));
    expect(wrapper.html())
      .toContain(docLink("farmware"));
    expect(wrapper.text()).toContain("Documentation");
    expect(wrapper.html()).toContain("fa-external-link");
  });
});
