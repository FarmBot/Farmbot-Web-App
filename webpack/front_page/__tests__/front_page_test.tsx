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
    current: {
      tokensPath: "://localhost:3000/api/tokens/",
      passwordResetPath: "resetPath",
      usersPath: "usersPath"
    }
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { FrontPage } from "../front_page";
import axios from "axios";
import { API } from "../../api";

describe("<FrontPage />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
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
    expect(API.setBaseUrl).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      "://localhost:3000/api/tokens/",
      { user: { email: "foo@bar.io", password: "password" } });
  });

  it("submits registration", () => {
    const el = mount(<FrontPage />);
    el.setState({
      regEmail: "foo@bar.io",
      regName: "Foo Bar",
      regPassword: "password",
      regConfirmation: true,
      agreeToTerms: true
    });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    instance.submitRegistration({ preventDefault: jest.fn() });
    expect(axios.post).toHaveBeenCalledWith("usersPath", {
      user: {
        agree_to_terms: true, email: "foo@bar.io", name: "Foo Bar",
        password: "password", password_confirmation: true
      }
    });
  });

  it("submits forgot password", () => {
    const el = mount(<FrontPage />);
    el.setState({ email: "foo@bar.io" });
    // tslint:disable-next-line:no-any
    const instance = el.instance() as any;
    instance.submitForgotPassword({ preventDefault: jest.fn() });
    expect(axios.post).toHaveBeenCalledWith("resetPath",
      { email: "foo@bar.io" });
  });

  it("renders proper panels", () => {
    const el = mount(<FrontPage />);
    el.setState({ activePanel: "resendVerificationEmail" });
    expect(el.text()).toContain("Account Not Verified");
    el.setState({ activePanel: "forgotPassword" });
    expect(el.text()).toContain("Reset Password");
    el.setState({ activePanel: "login" });
    expect(el.text()).toContain("Login");
  });
});
