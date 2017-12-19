import * as React from "react";
import { mount } from "enzyme";
import { FrontPage } from "../front_page";

describe("<FrontPage />", () => {
  it("shows 3rd party server box", () => {
    const el = mount(<FrontPage />);
    expect(el.text()).not.toContain("Server URL");
    el.find("button.fb-button.gray").first().simulate("click");
    expect(el.text()).toContain("Server URL");
  });

  it("shows forgot password box", () => {
    const el = mount(<FrontPage />);
    expect(el.text()).not.toContain("Reset Password");
    el.find("a.forgot-password").first().simulate("click");
    expect(el.text()).toContain("Reset Password");
  });

  it("shows TOS and Privacy links", () => {
    const el = mount(<FrontPage />);
    ["Privacy Policy", "Terms of Use"].map(string =>
      expect(el.text()).toContain(string));
    ["https://farmbot.io/privacy/", "https://farmbot.io/tos/"]
      .map(string => expect(el.html()).toContain(string));
  });
});
