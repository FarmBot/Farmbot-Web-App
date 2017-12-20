jest.mock("axios", () => ({
  default: {
    post: jest.fn(() => Promise.resolve({
      data: "whatever"
    }))
  }
}));

jest.mock("../../api", () => ({
  API: {
    setBaseUrl: jest.fn(),
    fetchBrowserLocation: jest.fn(),
    fetchHostName: () => "localhost",
    inferPort: () => 3000,
    current: { tokensPath: "://localhost:3000/api/tokens/" }
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { FrontPage } from "../front_page";
import axios from "axios";
import { API } from "../../api";

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

  it("submits login", () => {
    const el = mount(<FrontPage />);
    el.setState({
      email: "foo@bar.io", loginPassword: "password", showServerOpts: true
    });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    instance.submitLogin({ preventDefault: jest.fn() });
    expect(API.setBaseUrl).toHaveBeenCalledWith("//localhost:3000");
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
  });
});
