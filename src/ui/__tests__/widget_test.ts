import { Widget } from "../widget";
import { mount } from "enzyme";

describe("<Widget />", () => {
  let params = { children: "wow", className: "k" };
  let result = mount(Widget(params));
  it("renders correct children", () => {
    expect(result.html()).toContain("wow");
  });
  it("renders correct classnames", () => {
    let element = result.find("div");
    expect(element.hasClass("k")).toBeTruthy();
    expect(element.hasClass("widget-wrapper")).toBeTruthy();
  });
});
