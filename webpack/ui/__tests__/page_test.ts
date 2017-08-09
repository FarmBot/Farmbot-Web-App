import { Page } from "../page";
import { mount } from "enzyme";

describe("<Page />", () => {
  it("renders text", () => {
    let result = mount(Page({ children: "nice" }));
    expect(result.html()).toContain("nice");
  });
  it("gets correct className", () => {
    let result = mount(Page({ className: "some-class" }));
    expect(result.find("div").hasClass("some-class")).toBeTruthy();
    expect(result.find("div").hasClass("all-content-wrapper")).toBeTruthy();
  });
});
